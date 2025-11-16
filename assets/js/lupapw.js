document.getElementById("forgotPasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;

    const response = await fetch("/api/lupapw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (response.ok) {
        alert("Kode OTP berhasil dikirim ke email!");
        localStorage.setItem("reset_email", email);
        window.location.href = "verifotp.html";
    } else {
        alert(result.error || "Terjadi kesalahan");
    }
});
