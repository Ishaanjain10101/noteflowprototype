const form = document.getElementById("login-form");
const button = document.getElementById("button-login");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const message = document.getElementById("login-message");
const eyeButton = document.querySelector("#eye");
const eyeIcon = eyeButton.querySelector("i");
eyeButton.addEventListener("click", () => {
    const showingPassword = passwordInput.type === "password";
    eyeIcon.classList.toggle("fa-eye-slash", !showingPassword);
    eyeIcon.classList.toggle("fa-eye", showingPassword);
    passwordInput.type = showingPassword ? "text" : "password";
    eyeButton.setAttribute("aria-label", showingPassword ? "Hide password" : "Show password");
    eyeButton.setAttribute("aria-pressed", String(showingPassword));
});

function showMessage(text) {
    message.textContent = text;
    message.className = "auth-message error";
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    message.textContent = "";
    message.className = "auth-message";
    if (!email || !password) {
        showMessage("Enter your email and password to log in.");
        return;
    }
    button.disabled = true;
    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        if (response.ok) {
            emailInput.value = "";
            passwordInput.value = "";
            window.location.href = "/";
            return;
        }
        showMessage(response.status === 400 || response.status === 404
            ? "Incorrect email or password. Please try again."
            : "We couldn’t log you in right now. Please try again.");
    } catch (error) {
        showMessage("Could not connect to the server. Please try again.");
    } finally {
        button.disabled = false;
    }
});
