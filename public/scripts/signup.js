const nameInput = document.getElementById("name-input");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const form = document.getElementById("signup-form");
const button = document.getElementById("button-signup");
const message = document.getElementById("signup-message");
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
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    message.textContent = "";
    message.className = "auth-message";
    emailInput.style.borderColor = "";
    if (!name || !email || !password) {
        showMessage("Please fill in your name, email, and password.");
        return;
    }
    button.disabled = true;
    try {
        const response = await fetch("/signup", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });
        const result = await response.json().catch(() => ({}));
        if (response.status === 400 && result.code === 1) {
            emailInput.style.borderColor = "var(--error-500)";
            showMessage("An account with this email already exists. Try logging in instead.");
            emailInput.addEventListener("input", () => { emailInput.style.borderColor = ""; }, { once: true });
            return;
        }
        if (response.ok) {
            nameInput.value = "";
            emailInput.value = "";
            passwordInput.value = "";
            window.location.href = "/verify";
            return;
        }
        showMessage(result.error || "We couldn’t create your account. Please try again.");
    } catch (error) {
        showMessage("Could not connect to the server. Please try again.");
    } finally {
        button.disabled = false;
    }
});
