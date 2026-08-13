const button = document.getElementById("button-login");

const email = document.querySelector("#email-input");
email.focus();

const eye = document.querySelector("#eye");
eye.addEventListener("click",()=>{
    const password = document.querySelector("#password-input");
    if(password.type === "password"){
        eye.classList.remove("fa-eye-slash");
        eye.classList.add("fa-eye");
        password.type = "text";
    }
    else{
        eye.classList.remove("fa-eye");
        eye.classList.add("fa-eye-slash");
        password.type = "password"
    }
})
document.addEventListener('selectstart', function(e) {
    e.preventDefault();
});

button.addEventListener("click",async ()=>{
    const email = document.getElementById("email-input").value;
    const password = document.getElementById("password-input").value;
    if(email && password){
        const response = await fetch("/login",{
            method:"POST",
            headers:{
                "Content-type" : "application/json"
            },
            body:JSON.stringify({email,password})
        })
        if(response.status === 200){
            document.getElementById("email-input").value= "";
            document.getElementById("password-input").value= "";
            window.location.href= "/";
        }

    }
    else{
        alert("incomplete data");
    }
    
})
