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
            const response = await fetch(`/note/trash/${noteId}`, { method: "DELETE" });
            if (response.ok) {
                dialog.close();
                location.reload();
            }
        }, { once: true });
        no.addEventListener("click", () => { dialog.close(); }, { once: true });
    });
});

const recoverNote = document.querySelectorAll(".recover-icon");
recoverNote.forEach((icon) => {
    icon.addEventListener("click", async () => {
        const noteId = icon.getAttribute("data-id");
        const response = await fetch(`/note/trash/recover/${noteId}`, { method: "PATCH" });
        if (response.ok) {
            location.reload();
        }
    }, { once: true });
});

document.getElementById("logout").addEventListener("click", async () => {
    const response = await fetch("/logout", { method: "POST" });
    if (response.ok) {
        location.reload();
    }
});
