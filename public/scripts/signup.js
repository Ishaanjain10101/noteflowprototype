const name = document.querySelector("#name-input");
name.focus();

const eye = document.querySelector("#eye");
eye.addEventListener("click", () => {
    const password = document.querySelector("#password-input");
    if (password.type === "password") {
        eye.classList.remove("fa-eye-slash");
        eye.classList.add("fa-eye");
        password.type = "text";
    } else {
        eye.classList.remove("fa-eye");
        eye.classList.add("fa-eye-slash");
        password.type = "password";
    }
});

const button = document.getElementById("button-signup");
button.addEventListener("click", async () => {
    const name = document.getElementById("name-input").value;
    const email = document.getElementById("email-input").value;
    const password = document.getElementById("password-input").value;
    if (name && email && password) {
        const result = await fetch("/signup", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });
        const msg = await result.json();
        if (result.status === 400 && msg.code === 1) {
            document.getElementById("email-input").style.borderColor = "red";
            document.getElementById("email-input").onchange = () => {
                document.getElementById("email-input").style.borderColor = "";
            };
        }
        if (result.status === 200) {
            document.getElementById("name-input").value = "";
            document.getElementById("email-input").value = "";
            document.getElementById("password-input").value = "";
            window.location.href = "/verify";
        }
    } else {
        alert("Please fill in all fields");
    }
});
