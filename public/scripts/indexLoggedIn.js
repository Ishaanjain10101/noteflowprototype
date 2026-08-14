const fav = document.querySelectorAll(".outside-element");
fav.forEach((star)=>{
    const noteId = star.getAttribute("data-id");
    notesObject.forEach((note)=>{
        if(note._id === noteId){
            if(note.favourite){ 
                star.setAttribute("fill","blue");
                star.setAttribute("stroke","blue");
                star.setAttribute("stroke-width","1.5");
                star.setAttribute("stroke-linejoin","round");
            }
        }
    })
    
    star.addEventListener("click",async ()=>{
        if(star.getAttribute("fill") === "blue"){
            star.setAttribute("fill","none");
            star.setAttribute("stroke","blue");
            star.setAttribute("stroke-width","1.5");
            star.setAttribute("stroke-linejoin","round");
            star.disabled = true;
            const response = await fetch(`/note/${noteId}`,{
                method:"PATCH",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    favourite:false
                })
            });
            star.disabled = false;
            if(response.status === 202 && location.pathname === "/fav"){
                location.reload();
            }
            star.disabled = false;
        }else{
            star.setAttribute("fill","blue");
            star.removeAttribute("stroke");
            star.removeAttribute("stroke-width");
            star.removeAttribute("stroke-linejoin");
            const noteId = star.getAttribute("data-id");
            star.disabled = true;
            const response = await fetch(`/note/${noteId}`,{
                method:"PATCH",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    favourite:true
                })
            });
            star.disabled = false;
            if(response.status === 202  && location.pathname === "/fav"){
                location.reload();
            }

        }
    });
})

const pinButtons = document.querySelectorAll(".pin-button");
pinButtons.forEach((pin)=>{
    const noteId = pin.getAttribute("data-id");
    notesObject.forEach((note)=>{
        if(note._id === noteId && note.pinned){
            pin.setAttribute("fill","black");
        }
    })
    pin.addEventListener("click",async ()=>{
        if(pin.getAttribute("fill") === "black"){
            pin.setAttribute("fill","none");
            pin.disabled = true;
            const response = await fetch(`/note/pin/${noteId}`,{
                method:"PATCH",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    pinned:false
                })
            });
            pin.disabled = false;
            if(response.status === 202){
                location.reload();
            }
        }else{
            pin.setAttribute("fill","black");
            pin.disabled = true;
            const response = await fetch(`/note/pin/${noteId}`,{
                method:"PATCH",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    pinned:true
                })
            });
            pin.disabled = false;
            if(response.status === 202){
                location.reload();
            }

        }
    });
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
                method:"PATCH"
            });
            if(response.ok){
                dialog.close(); 
                location.reload();
            }
        },{once:true});
        no.addEventListener("click",()=>{
            dialog.close();
        },{once:true});        
    })
    
})

document.getElementById("logout").addEventListener("click", async ()=>{
    const response = await fetch("/logout",{
        method:"POST"
    });
    if(response.ok){
        window.location.href = "/";
    }
})
