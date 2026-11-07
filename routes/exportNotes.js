const express = require("express");
const NoteModel = require("../models/notes");
const auth = require("../middlewares/auth");

const router = express.Router();

function asText(notes) {
    if (!notes.length) return "NoteFlow export\nNo active notes.\n";
    return notes.map((note, index) => [
        `${index + 1}. ${note.title || "Untitled note"}`,
        `Created: ${new Date(note.createdAt).toLocaleString("en-US", { timeZone: "UTC" })} UTC`,
        "",
        note.content || "",
        "\n---\n"
    ].join("\n")).join("\n");
}

function pdfEscape(value) {
    return String(value).replace(/[^\x20-\x7E]/g, "?").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function makePdf(notes) {
    const lines = ["NoteFlow notes export", ""];
    for (const [index, note] of notes.entries()) {
        lines.push(`${index + 1}. ${note.title || "Untitled note"}`);
        lines.push(`Created: ${new Date(note.createdAt).toISOString()}`);
        lines.push("");
        for (const paragraph of String(note.content || "").split(/\r?\n/)) {
            const wrapped = paragraph.match(/.{1,88}(?:\s|$)|.{1,88}/g) || [""];
            lines.push(...wrapped.map(line => line.trim()));
        }
        lines.push("", "----------------------------------------", "");
    }
    if (!notes.length) lines.push("No active notes.");

    const pages = [];
    for (let i = 0; i < lines.length; i += 48) pages.push(lines.slice(i, i + 48));
    const objects = [null];
    const addObject = body => (objects.push(body), objects.length - 1);
    const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    const pageIds = [];
    for (const pageLines of pages) {
        const commands = ["BT", "/F1 10 Tf", "50 790 Td", "14 TL"];
        for (const line of pageLines) commands.push(`(${pdfEscape(line)}) Tj`, "T*");
        commands.push("ET");
        const stream = commands.join("\n");
        const contentId = addObject(`<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream`);
        const pageId = addObject(`<< /Type /Page /Parent PAGES_ID /MediaBox [0 0 612 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
        pageIds.push(pageId);
    }
    const pagesId = addObject(`<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`);
    const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
    for (const id of pageIds) objects[id] = objects[id].replace("PAGES_ID", String(pagesId));

    let pdf = "%PDF-1.4\n%NoteFlow\n";
    const offsets = [0];
    for (let id = 1; id < objects.length; id++) {
        offsets[id] = Buffer.byteLength(pdf, "ascii");
        pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
    }
    const xrefOffset = Buffer.byteLength(pdf, "ascii");
    pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for (let id = 1; id < objects.length; id++) pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
    pdf += `trailer\n<< /Size ${objects.length} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return Buffer.from(pdf, "ascii");
}

function crc32(buffer) {
    let crc = 0xffffffff;
    for (const byte of buffer) {
        crc ^= byte;
        for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function makeZip(files) {
    const localParts = [];
    const centralParts = [];
    let offset = 0;
    for (const { name, data } of files) {
        const filename = Buffer.from(name, "utf8");
        const body = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf8");
        const crc = crc32(body);
        const local = Buffer.alloc(30);
        local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6);
        local.writeUInt32LE(crc, 14); local.writeUInt32LE(body.length, 18); local.writeUInt32LE(body.length, 22);
        local.writeUInt16LE(filename.length, 26);
        localParts.push(local, filename, body);

        const central = Buffer.alloc(46);
        central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6);
        central.writeUInt16LE(0x0800, 8); central.writeUInt32LE(crc, 16); central.writeUInt32LE(body.length, 20);
        central.writeUInt32LE(body.length, 24); central.writeUInt16LE(filename.length, 28); central.writeUInt32LE(offset, 42);
        centralParts.push(central, filename);
        offset += local.length + filename.length + body.length;
    }
    const centralDirectory = Buffer.concat(centralParts);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10);
    end.writeUInt32LE(centralDirectory.length, 12); end.writeUInt32LE(offset, 16);
    return Buffer.concat([...localParts, centralDirectory, end]);
}

router.get("/settings/export", auth, async (req, res) => {
    if (!req.signedIn || !req.userId) return res.status(401).send("Please sign in to export your notes.");
    const format = String(req.query.format || "").toLowerCase();
    if (!["txt", "pdf", "json", "zip"].includes(format)) return res.status(400).send("Choose TXT, PDF, JSON, or ZIP.");

    try {
        const notes = await NoteModel.find({ userId: req.userId, recentlyDeleted: false }).sort({ createdAt: 1 }).lean();
        const portableNotes = notes.map(({ _id, title, content, projects, favourite, pinned, createdAt, updatedAt }) => ({
            id: String(_id), title, content, projects: projects || null, favourite: Boolean(favourite), pinned: Boolean(pinned), createdAt, updatedAt
        }));
        const txt = asText(portableNotes);
        const json = JSON.stringify({ exportedAt: new Date().toISOString(), notes: portableNotes }, null, 2);
        const pdf = makePdf(portableNotes);
        const filename = `noteflow-notes-${new Date().toISOString().slice(0, 10)}`;
        const exports = {
            txt: { data: txt, type: "text/plain; charset=utf-8", ext: "txt" },
            json: { data: json, type: "application/json; charset=utf-8", ext: "json" },
            pdf: { data: pdf, type: "application/pdf", ext: "pdf" },
            zip: { data: makeZip([{ name: "notes.txt", data: txt }, { name: "notes.json", data: json }, { name: "notes.pdf", data: pdf }]), type: "application/zip", ext: "zip" }
        };
        const file = exports[format];
        res.set({ "Content-Type": file.type, "Content-Disposition": `attachment; filename="${filename}.${file.ext}"`, "Cache-Control": "private, no-store" });
        res.send(file.data);
    } catch (error) {
        console.error("Note export failed:", error);
        res.status(500).send("Could not export notes right now. Please try again.");
    }
});

module.exports = router;
