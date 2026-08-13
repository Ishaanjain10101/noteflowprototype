if(document.getElementById("form").getAttribute("data-form") === "grid"){
    notesObject.forEach((note,i)=>{
        document.getElementById(`title-note-${i+1}`).innerText = `${note.title.length > 9 ? note.title.slice(0,9)+"..." : note.title}`;
        document.getElementById(`content-note-${i+1}`).innerText = `${note.content.length > 50 ? note.content.slice(0,50)+"..." : note.content}`;
    })
}else{
    notesObject.forEach((note,i)=>{
        document.getElementById(`title-note-${i+1}`).innerText = `${note.title.length > 50 ? (note.title.slice(0,50) + "...") : note.title}`;
        document.getElementById(`content-note-${i+1}`).innerText = `${note.content.length > 200 ? note.content.slice(0,200)+"..." : note.content}`;
    })
}

const add = document.querySelector("#add");
add.addEventListener("click",()=>{
    window.location.href = "/add";
})

document.addEventListener('selectstart', function(e) {
    e.preventDefault();
});

const grid = document.getElementById("grid-button");
const list = document.getElementById("list-button");
const form = document.getElementById("form");
const notes = document.querySelectorAll(".Note");

grid.addEventListener("click",()=>{
    form.setAttribute("data-form","grid");
    const listButton = document.getElementById("list-button");
    const gridButton = document.getElementById("grid-button");
    gridButton.setAttribute("data-select","true");
    listButton.setAttribute("data-select","false");
    notes.forEach((value,index)=>{
        value.setAttribute("data-form","grid");
    })
     if(document.getElementById("form").getAttribute("data-form") === "grid"){
        notesObject.forEach((note,i)=>{
            document.getElementById(`title-note-${i+1}`).innerText = `${note.title.length > 9 ? note.title.slice(0,9)+"..." : note.title}`;
            document.getElementById(`content-note-${i+1}`).innerText = `${note.content.length > 50 ? note.content.slice(0,50)+"..." : note.content}`;
        })
    }else{
        notesObject.forEach((note,i)=>{
            document.getElementById(`title-note-${i+1}`).innerText = `${note.title.length > 50 ? (note.title.slice(0,50) + "...") : note.title}`;
            document.getElementById(`content-note-${i+1}`).innerText = `${note.content.length > 200 ? note.content.slice(0,200)+"..." : note.content}`;
        })
    }
});

list.addEventListener("click",()=>{
    form.setAttribute("data-form","list");
    const gridButton = document.getElementById("grid-button");
    const listButton = document.getElementById("list-button");
    gridButton.setAttribute("data-select","false");
    listButton.setAttribute("data-select","true");
    notes.forEach((value,index)=>{
        value.setAttribute("data-form","list");
    })
    if(document.getElementById("form").getAttribute("data-form") === "grid"){
        notesObject.forEach((note,i)=>{
            document.getElementById(`title-note-${i+1}`).innerText = `${note.title.length > 12 ? note.title.slice(0,12)+"..." : note.title}`;
            document.getElementById(`content-note-${i+1}`).innerText = `${note.content.length > 50 ? note.content.slice(0,50)+"..." : note.content}`;
        
        })
    }else{
        notesObject.forEach((note,i)=>{
            document.getElementById(`title-note-${i+1}`).innerText = `${note.title.length > 50 ? (note.title.slice(0,50) + "...") : note.title}`;
            document.getElementById(`content-note-${i+1}`).innerText = `${note.content.length > 200 ? note.content.slice(0,200)+"..." : note.content}`;
        })
    }
})

const deleteNote = document.querySelectorAll(".dustbin-icon");

deleteNote.forEach((icon)=>{
    icon.addEventListener("click",()=>{
        const noteId = icon.getAttribute("data-id");
        const dialog = document.getElementById(`${noteId}`);
        dialog.showModal();
        const no = dialog.lastElementChild;
        const yes = dialog.children[1];
        yes.addEventListener("click",async ()=>{
            const response = await fetch(`/note/trash/${noteId}`,{
                method:"DELETE"
            });
            if(response.ok){
                dialog.close(); 
                location.reload();
            }
            if(response.status === 404){
                console.log(response);
            }
        },{once:true});
        no.addEventListener("click",()=>{
            dialog.close();
        },{once:true});        
    })
})

const recoverNote = document.querySelectorAll(".recover-icon");

recoverNote.forEach((icon)=>{
    icon.addEventListener("click",async ()=>{
        const noteId = icon.getAttribute("data-id");
        const response = await fetch(`/note/trash/recover/${noteId}`,{
            method:"PATCH"
        });
        if(response.ok){
            location.reload();
        }
    },{once:true});
})

document.getElementById("logout").addEventListener("click", async ()=>{
    const response = await fetch("/logout",{
        method:"POST"
    });
    if(response.ok){
        location.reload();
    }
})  