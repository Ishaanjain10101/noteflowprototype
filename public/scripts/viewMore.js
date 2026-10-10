const title = document.getElementById("title");
const content = document.querySelector("#content");
const update = document.querySelector("#update");
const edit = document.querySelector("#edit");

title.disabled = true;
content.disabled = true;
update.disabled = true;

edit.addEventListener("click", () => {
    title.disabled = false;
    content.disabled = false;
    update.disabled = false;
    title.focus();
});

update.addEventListener("click", async () => {
    const t = title.value;
    const c = content.value;
    const containerNote = document.getElementById("container-note");
    const noteId = containerNote.getAttribute("data-id");
    const response = await fetch(`/note/updateData/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t, content: c })
    });
    if (response.status === 200) {
        title.disabled = true;
        content.disabled = true;
        update.disabled = true;
    }
});
