const title = document.getElementById("title");
title.focus();
const content = document.querySelector("#content");
const fav = document.getElementById("star");

fav.addEventListener("click",()=>{
    if(fav.getAttribute("fill") ==="#12305c"){
        fav.setAttribute("fill","none");
        fav.setAttribute("stroke","#12305c");
        fav.setAttribute("stroke-width","1.5");
        fav.setAttribute("stroke-linejoin","round");
    }else{
        fav.setAttribute("fill","#12305c");
        fav.removeAttribute("stroke",);
        fav.removeAttribute("stroke-width");
        fav.removeAttribute("stroke-linejoin");
    }
})

const save = document.querySelector("#save");
save.addEventListener("click",async ()=>{
    const t = title.value;
    const c = content.value;
    const favourite = fav.getAttribute("fill") === "#12305c";
    const response = await fetch("/add",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            title:t,
            content:c,
            favourite:favourite,
        })
    })
    if(response.status === 400){
        const dialog = document.getElementById("incomplete-data");
        dialog.style = "margin:auto";
        dialog.showModal();
        setTimeout(()=>{
            dialog.close();
        },1500)
    }
    if(response.status === 200){
        title.value = "";
        content.value = "";
        window.location.href = "/";
    }
});

document.addEventListener('selectstart', function(e) {
    e.preventDefault();
});

document.getElementById("logout").addEventListener("click", async ()=>{
    const response = await fetch("/logout",{
        method:"POST"
    });
    if(response.ok){
        location.reload();
    }
})