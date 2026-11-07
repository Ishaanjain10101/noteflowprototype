const title = document.getElementById("title");
const content = document.querySelector("#content");
const fav = document.getElementById("star");
const draftStatus = document.getElementById("draft-status");
const discardDraft = document.getElementById("discard-draft");
const draftKey = "noteflow:add-note-draft:v1";
let draftSaveTimer;

function setDraftStatus(message, hasDraft) {
    draftStatus.textContent = message;
    draftStatus.hidden = !message;
    discardDraft.hidden = !hasDraft;
}

function persistDraft() {
    window.clearTimeout(draftSaveTimer);
    if (!title.value.trim() && !content.value.trim()) {
        try { localStorage.removeItem(draftKey); } catch (error) { /* Storage can be disabled in private browsing. */ }
        setDraftStatus("", false);
        return;
    }

    const draft = {
        title: title.value,
        content: content.value,
        favourite: fav.getAttribute("fill") === "var(--accent-500)",
        savedAt: Date.now()
    };
    try {
        localStorage.setItem(draftKey, JSON.stringify(draft));
        setDraftStatus("Draft saved on this device. It stays separate from your notes until you save it.", true);
    } catch (error) {
        setDraftStatus("Draft storage is unavailable in this browser session.", false);
    }
}

try {
    const savedDraft = JSON.parse(localStorage.getItem(draftKey) || "null");
    if (savedDraft && (savedDraft.title || savedDraft.content)) {
        title.value = savedDraft.title || "";
        content.value = savedDraft.content || "";
        if (savedDraft.favourite) {
            fav.setAttribute("fill", "var(--accent-500)");
            fav.setAttribute("stroke", "var(--accent-500)");
        }
        setDraftStatus("Draft restored from this device. It stays separate from your notes until you save it.", true);
    }
} catch (error) {
    setDraftStatus("Draft storage is unavailable in this browser session.", false);
}

function scheduleDraftSave() {
    window.clearTimeout(draftSaveTimer);
    draftSaveTimer = window.setTimeout(persistDraft, 250);
}

title.addEventListener("input", scheduleDraftSave);
content.addEventListener("input", scheduleDraftSave);
window.addEventListener("pagehide", persistDraft);

discardDraft.addEventListener("click", () => {
    window.clearTimeout(draftSaveTimer);
    title.value = "";
    content.value = "";
    fav.setAttribute("fill", "none");
    fav.setAttribute("stroke", "var(--neutral-700)");
    try { localStorage.removeItem(draftKey); } catch (error) { /* Storage can be disabled in private browsing. */ }
    setDraftStatus("Draft discarded.", false);
    title.focus();
});

fav.addEventListener("click", () => {
    if (fav.getAttribute("fill") === "var(--neutral-700)") {
        fav.setAttribute("fill", "none");
        fav.setAttribute("stroke", "var(--neutral-700)");
        fav.setAttribute("stroke-width", "1.5");
        fav.setAttribute("stroke-linejoin", "round");
    } else {
        fav.setAttribute("fill", "var(--accent-500)");
        fav.setAttribute("stroke", "var(--accent-500)");
        fav.setAttribute("stroke-width", "1.5");
        fav.setAttribute("stroke-linejoin", "round");
    }
    scheduleDraftSave();
});

const save = document.querySelector("#save");
save.addEventListener("click", async () => {
    const t = title.value;
    const c = content.value;
    const favourite = fav.getAttribute("fill") === "var(--accent-500)";
    const response = await fetch("/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t, content: c, favourite: favourite })
    });
    if (response.status === 400) {
        const dialog = document.getElementById("incomplete-data");
        dialog.showModal();
        setTimeout(() => { dialog.close(); }, 1500);
    }
    if (response.status === 200) {
        window.clearTimeout(draftSaveTimer);
        try { localStorage.removeItem(draftKey); } catch (error) { /* The note was saved; draft cleanup is best effort. */ }
        title.value = "";
        content.value = "";
        window.location.href = "/";
    }
});
