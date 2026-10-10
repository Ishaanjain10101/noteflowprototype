const title = document.getElementById("title");
title.focus();
const content = document.querySelector("#content");
const fav = document.getElementById("star");

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
        title.value = "";
        content.value = "";
        window.location.href = "/";
    }
});

document.getElementById("logout").addEventListener("click", async () => {
    const response = await fetch("/logout", { method: "POST" });
    if (response.ok) {
        window.location.href = "/";
    }
});
