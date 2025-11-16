// assets/js/passwordbaru.js

document.addEventListener('DOMContentLoaded', () => {
    const newPasswordForm = document.getElementById('new-password-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordError = document.getElementById('password-error');

    function validatePasswordMatch() {
        if (passwordInput.value !== confirmPasswordInput.value) {
            passwordError.textContent = "Konfirmasi password tidak cocok.";
            confirmPasswordInput.setCustomValidity("Mismatch");
            return false;
        } else {
            passwordError.textContent = "";
            confirmPasswordInput.setCustomValidity("");
            return true;
        }
    }

    // Cek setiap kali input berubah
    if (passwordInput) passwordInput.addEventListener('input', validatePasswordMatch);
    if (confirmPasswordInput) confirmPasswordInput.addEventListener('input', validatePasswordMatch);

    if (newPasswordForm) {
        newPasswordForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            
            // Pastikan validasi dijalankan saat submit
            if (!validatePasswordMatch()) {
                alert("Mohon perbaiki kesalahan input password.");
                return;
            }

            // SIMULASI BERHASIL:
            alert("Password baru berhasil disimpan!");
            
            // REDIRECT KE HALAMAN SUKSES (sesuai struktur /pages/sukses.html)
            window.location.href = 'sukses.html'; 
        });
    }
});