// assets/js/otp.js

document.addEventListener('DOMContentLoaded', () => {
    const otpInputs = document.querySelectorAll(".otp-input");
    const confirmOtpButton = document.getElementById("confirm-otp");
    const timerDisplay = document.getElementById("timer");
    const resendLink = document.getElementById("resend-link");

    // Variabel Timer OTP
    let otpTimerInterval;
    const initialTimeInSeconds = 5 * 60; // 5 menit (300 detik)
    const displayStartTimeInSeconds = (4 * 60) + 49; // 4 menit 49 detik (289 detik)

    // ====================================
    // LOGIKA INPUT OTP & VALIDASI (6 DIGIT)
    // ====================================

    otpInputs.forEach((input, index) => {
        // Navigasi Otomatis dan Validasi Input
        input.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            
            // Hanya izinkan angka
            if (/\D/.test(value)) {
                e.target.value = '';
                return;
            }

            // Pindah ke kotak berikutnya
            if (value && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
            checkOtpInputs();
        });

        // Navigasi Backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });

    // Cek HANYA 6 digit pertama yang terisi
    function checkOtpInputs() {
        let requiredDigitsFilled = true;
        // Hanya cek 6 input pertama (index 0 - 5)
        for (let i = 0; i < 6; i++) { 
            if (!otpInputs[i] || otpInputs[i].value.length === 0) {
                requiredDigitsFilled = false;
                break;
            }
        }
        confirmOtpButton.disabled = !requiredDigitsFilled;
    }

    // ====================================
    // LOGIKA TIMER & RESEND
    // ====================================

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    function startTimer(timeInSeconds) {
        clearInterval(otpTimerInterval);
        resendLink.classList.add('resend-link-disabled');
        timerDisplay.textContent = formatTime(timeInSeconds);

        // Menggunakan waktu 4:49 untuk tampilan awal
        if (timeInSeconds === initialTimeInSeconds) {
            timeInSeconds = displayStartTimeInSeconds;
            timerDisplay.textContent = formatTime(timeInSeconds);
        }

        otpTimerInterval = setInterval(() => {
            timeInSeconds--;
            timerDisplay.textContent = formatTime(timeInSeconds);

            if (timeInSeconds <= 0) {
                clearInterval(otpTimerInterval);
                timerDisplay.textContent = '00:00';
                resendLink.classList.remove('resend-link-disabled');
            }
        }, 1000);
    }

    // Event Kirim Ulang
    if (resendLink) {
        resendLink.addEventListener('click', (e) => {
            if (!resendLink.classList.contains('resend-link-disabled')) {
                e.preventDefault();
                alert('Permintaan kirim ulang kode terkirim! Timer dimulai lagi.');
                // Kosongkan input dan mulai timer
                otpInputs.forEach(input => input.value = '');
                confirmOtpButton.disabled = true;
                startTimer(initialTimeInSeconds);
                if (otpInputs.length > 0) otpInputs[0].focus();
            }
        });
    }

    // Event Konfirmasi OTP -> Redirect ke Halaman Password Baru
    if (confirmOtpButton) {
        confirmOtpButton.addEventListener("click", () => {
            // Mengambil 6 digit OTP
            const otpCode = Array.from(otpInputs).slice(0, 6).map(input => input.value).join('');
            console.log(`Verifikasi OTP 6-Digit: ${otpCode}`);
            
            // Redirect ke halaman passwordbaru.html
            window.location.href = 'passwordbaru.html'; 
        });
    }
    
    // Mulai timer saat halaman dimuat
    startTimer(initialTimeInSeconds);
});
