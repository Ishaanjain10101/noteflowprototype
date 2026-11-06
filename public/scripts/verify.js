(async function () {
    try { await fetch("/verify/sendEmail", { method: "POST" }); } catch (_) {}
})();

const codeInputs = [...document.querySelectorAll(".code-input")];
const verifyButton = document.getElementById("button-verify");
const verifyMessage = document.getElementById("verify-message");
const codeDialog = document.getElementById("exhausted");

function distributeCode(startIndex, value) {
    const digits = value.replace(/\D/g, "").slice(0, codeInputs.length - startIndex);
    digits.split("").forEach((digit, offset) => {
        codeInputs[startIndex + offset].value = digit;
    });
    const nextIndex = Math.min(startIndex + digits.length, codeInputs.length - 1);
    codeInputs[nextIndex].focus();
}

codeInputs.forEach((field, index) => {
    field.addEventListener("input", () => {
        const digits = field.value.replace(/\D/g, "");
        if (digits.length > 1 || (index === 0 && digits.length === 6)) {
            codeInputs.forEach((input) => { input.value = ""; });
            distributeCode(0, digits);
            return;
        }
        field.value = digits.slice(0, 1);
        if (field.value && index < codeInputs.length - 1) codeInputs[index + 1].focus();
    });
    field.addEventListener("paste", (event) => {
        const pasted = event.clipboardData?.getData("text") || "";
        const digits = pasted.replace(/\D/g, "");
        if (!digits) return;
        event.preventDefault();
        codeInputs.forEach((input) => { input.value = ""; });
        distributeCode(0, digits);
    });
    field.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            verifyButton.click();
        } else if (event.key === "Backspace" && !field.value && index > 0) {
            event.preventDefault();
            codeInputs[index - 1].value = "";
            codeInputs[index - 1].focus();
        } else if (event.key.length === 1 && !/\d/.test(event.key) && !event.metaKey && !event.ctrlKey) {
            event.preventDefault();
        }
    });
});

verifyButton.addEventListener("click", async () => {
    const code = codeInputs.map((field) => field.value).join("");
    verifyMessage.className = "auth-message";
    if (!/^\d{6}$/.test(code)) {
        verifyMessage.textContent = "Enter all six digits to continue.";
        codeInputs.find((field) => !field.value)?.focus();
        return;
    }
    verifyButton.disabled = true;
    verifyMessage.textContent = "Checking your code…";
    try {
        const response = await fetch("/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code })
        });
        if (response.status === 200) {
            window.location.href = "/";
            return;
        }
        if (response.status === 429) {
            verifyMessage.textContent = "You have used all verification attempts.";
            codeDialog.showModal();
            setTimeout(() => {
                codeDialog.close();
                window.location.href = "/signup";
            }, 1500);
            return;
        }
        verifyMessage.textContent = "That code did not work. Check it and try again.";
    } catch (_) {
        verifyMessage.textContent = "Could not connect. Check your connection and try again.";
    } finally {
        verifyButton.disabled = false;
    }
});
