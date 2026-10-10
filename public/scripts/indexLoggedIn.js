const fav = document.querySelectorAll(".outside-element");
fav.forEach((star) => {
    const noteId = star.getAttribute("data-id");
    notesObject.forEach((note) => {
        if (note._id === noteId) {
            if (note.favourite) {
                star.setAttribute("fill", "var(--accent-500)");
                star.setAttribute("stroke", "var(--accent-500)");
                star.setAttribute("stroke-width", "1.5");
                star.setAttribute("stroke-linejoin", "round");
            }
        }
    });

    star.addEventListener("click", async () => {
        if (star.getAttribute("fill") === "var(--accent-500)") {
            star.setAttribute("fill", "none");
            star.setAttribute("stroke", "var(--primary-600)");
            star.setAttribute("stroke-width", "1.5");
            star.setAttribute("stroke-linejoin", "round");
            star.disabled = true;
            const response = await fetch(`/note/${noteId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ favourite: false })
            });
            star.disabled = false;
            if (response.status === 202 && location.pathname === "/fav") {
                location.reload();
            }
        } else {
            star.setAttribute("fill", "var(--accent-500)");
            star.setAttribute("stroke", "var(--accent-500)");
            star.setAttribute("stroke-width", "1.5");
            star.setAttribute("stroke-linejoin", "round");
            star.disabled = true;
            const response = await fetch(`/note/${noteId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ favourite: true })
            });
            star.disabled = false;
            if (response.status === 202 && location.pathname === "/fav") {
                location.reload();
            }
        }
    });
});

const pinButtons = document.querySelectorAll(".pin-button");
pinButtons.forEach((pin) => {
    const noteId = pin.getAttribute("data-id");
    notesObject.forEach((note) => {
        if (note._id === noteId && note.pinned) {
            pin.setAttribute("fill", "var(--neutral-800)");
        }
    });

    pin.addEventListener("click", async () => {
        if (pin.getAttribute("fill") === "var(--neutral-800)") {
            pin.setAttribute("fill", "none");
            pin.disabled = true;
            const response = await fetch(`/note/pin/${noteId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pinned: false })
            });
            pin.disabled = false;
            if (response.status === 202) {
                location.reload();
            }
        } else {
            pin.setAttribute("fill", "var(--neutral-800)");
            pin.disabled = true;
            const response = await fetch(`/note/pin/${noteId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pinned: true })
            });
            pin.disabled = false;
            if (response.status === 202) {
                location.reload();
            }
        }
    });
});

if (document.getElementById("form").getAttribute("data-form") === "grid") {
    notesObject.forEach((note, i) => {
        document.getElementById(`title-note-${i+1}`).innerText = `${note.title.length > 9 ? note.title.slice(0,9)+"..." : note.title}`;
        document.getElementById(`content-note-${i+1}`).innerText = `${note.content.length > 50 ? note.content.slice(0,50)+"..." : note.content}`;
    });
} else {
    notesObject.forEach((note, i) => {
        document.getElementById(`title-note-${i+1}`).innerText = `${note.title.length > 50 ? (note.title.slice(0,50) + "...") : note.title}`;
        document.getElementById(`content-note-${i+1}`).innerText = `${note.content.length > 200 ? note.content.slice(0,200)+"..." : note.content}`;
    });
}

const add = document.querySelector("#add");
if (add) {
    add.addEventListener("click", () => { window.location.href = "/add"; });
}

const grid = document.getElementById("grid-button");
const list = document.getElementById("list-button");
const form = document.getElementById("form");
const notes = document.querySelectorAll(".Note");

grid.addEventListener("click", () => {
    form.setAttribute("data-form", "grid");
    grid.setAttribute("data-select", "true");
    list.setAttribute("data-select", "false");
    notes.forEach((value) => { value.setAttribute("data-form", "grid"); });
    notesObject.forEach((note, i) => {
        document.getElementById(`title-note-${i+1}`).innerText = `${note.title.length > 9 ? note.title.slice(0,9)+"..." : note.title}`;
        document.getElementById(`content-note-${i+1}`).innerText = `${note.content.length > 50 ? note.content.slice(0,50)+"..." : note.content}`;
    });
});

list.addEventListener("click", () => {
    form.setAttribute("data-form", "list");
    grid.setAttribute("data-select", "false");
    list.setAttribute("data-select", "true");
    notes.forEach((value) => { value.setAttribute("data-form", "list"); });
    notesObject.forEach((note, i) => {
        document.getElementById(`title-note-${i+1}`).innerText = `${note.title.length > 50 ? (note.title.slice(0,50) + "...") : note.title}`;
        document.getElementById(`content-note-${i+1}`).innerText = `${note.content.length > 200 ? note.content.slice(0,200)+"..." : note.content}`;
    });
});

const deleteNote = document.querySelectorAll(".dustbin-icon");
deleteNote.forEach((icon) => {
    icon.addEventListener("click", () => {
        const noteId = icon.getAttribute("data-id");
        const dialog = document.getElementById(`${noteId}`);
        dialog.showModal();
        const no = dialog.lastElementChild;
        const yes = dialog.children[1];
        yes.addEventListener("click", async () => {
            const response = await fetch(`/note/trash/${noteId}`, { method: "PATCH" });
            if (response.ok) {
                dialog.close();
                location.reload();
            }
        }, { once: true });
        no.addEventListener("click", () => { dialog.close(); }, { once: true });
    });
});

document.getElementById("logout").addEventListener("click", async () => {
    const response = await fetch("/logout", { method: "POST" });
    if (response.ok) {
        window.location.href = "/";
    }
});
