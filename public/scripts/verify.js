(async function name() {
    await fetch("/verify/sendEmail",{
        method:"POST"
    });
})();


const input = [...document.querySelectorAll(".code-input")];
document.addEventListener("keydown",(e)=>{
    if(!("1234567890".includes(e.key) || e.key === "Backspace" || e.key === "Enter")){
        e.preventDefault();
    }
    const isDisabledAndFilled = (element)=>{
        return (element.disabled === true && element.value !=="");
    }
    const isDisabledAndNotFilled = (element)=>{
        return (element.disabled === true && element.value ==="");
    }
    if(e.key === "Backspace" && input.every(isDisabledAndFilled)){
        input.at(-1).disabled = false;
        input.at(-1).value="";
        input.at(-1).focus();
    }
    if(e.key === "Backspace" && input.every(isDisabledAndNotFilled)){
        input.at(0).disabled = false;
        input.at(0).focus();
    }
});

document.addEventListener("selectstart",(e)=>{
    e.preventDefault();
})

function repeat(element,index,e){
    if("1234567890".includes(e.key)){
        e.preventDefault();
        element.value = e.key;
        element.disabled = true;
        if(index+1 === 6){
        }else{
            input[index+1].disabled = false;
            input[index+1].value = "";
            input[index+1].focus();
        }
    }
    if(e.key === "Backspace"){
        e.preventDefault();
        element.disabled = true;
        if(index === 0){
            input[0].focus();
        }else{
            input[index-1].disabled = false;
            input[index-1].value = "";
            input[index-1].focus();
        }
    }

    
}
input.forEach((element,index)=>{
    if(index !==0){
        element.disabled = true;
    }
    else{
        element.focus();
    }
})
input.forEach((element,index)=>{
    element.addEventListener("keydown",(e)=>{
        repeat(element,index,e);
    })
});



const verifyButton = document.getElementById("button-verify");
verifyButton.addEventListener("click",async ()=>{
    let code = "";
    input.forEach((e)=>{
        code = code + e.value;
    });
    console.log(code);
    const response = await fetch("/verify",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            code:code
        })
    });
    if(response.status === 201){
        window.location.href = "/login";
    }
    if(response.status === 429){
        document.getElementById("exhausted").showModal();
        setTimeout(()=>{
            document.getElementById("exhausted").close();
            window.location.href = "/signup";
        },1500);
    }
    console.log(response.status);
})