// --- Supabase Config ---
const SUPABASE_URL = "https://cwvcprzdovbpteiuuvgj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3dmNwcnpkb3ZicHRlaXV1dmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzEwODYsImV4cCI6MjA3ODM0NzA4Nn0.Poi74Rm2rWUWGeoUTmP2CR5zlT_YqnY9j_OdjVz3tFw";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- Admin Statis (untuk testing lokal) ---
const STATIC_ADMIN = {
  id_admin: "27",
  username: "hotchans",
  email: "hotchansmotor@gmail.com",
  password: "hotchans123"
};

// --- Element Refs ---
const loginForm = document.getElementById("login-form");
const loginEmail = document.getElementById("login-email");
const loginPassword = document.getElementById("login-password");

// --- Utility Log ---
function showDebug(...msg) {
  console.log("[LOGIN DEBUG]", ...msg);
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const usernameInput = (loginEmail.value || "").trim();
    const passwordInput = (loginPassword.value || "").trim();

    if (!usernameInput || !passwordInput) {
      alert(" Harap isi username dan password!");
      return;
    }

    // --- Cek admin statis ---
    if (
      (usernameInput === STATIC_ADMIN.username ||
        usernameInput === STATIC_ADMIN.email ||
        usernameInput === STATIC_ADMIN.id_admin) &&
      passwordInput === STATIC_ADMIN.password
    ) {
      showDebug("Login via STATIC_ADMIN sukses");
      localStorage.setItem(
        "admin_login",
        JSON.stringify({
          id_admin: STATIC_ADMIN.id_admin,
          username: STATIC_ADMIN.username,
          email: STATIC_ADMIN.email,
          source: "static",
        })
      );
      alert("✅ Login berhasil (Admin Statis)!");
      window.location.href = "dashboard.html";
      return;
    }

    // --- Cek dari Supabase ---
    try {
      let { data, error } = await supabase
        .from("admin")
        .select("*")
        .or(`username.eq.${usernameInput},email.eq.${usernameInput},id_admin.eq.${usernameInput}`)
        .maybeSingle();

      if (error) {
        console.error("Supabase error:", error.message);
        alert("❌ Gagal menghubungkan ke database Supabase!");
        return;
      }

      if (!data) {
        alert("❌ Username tidak ditemukan!");
        return;
      }

      if (data.password !== passwordInput) {
        alert("❌ Password salah!");
        return;
      }

      // Simpan data login ke localStorage
      localStorage.setItem(
        "admin_login",
        JSON.stringify({
          id_admin: data.id_admin,
          username: data.username,
          email: data.email,
          source: "supabase",
        })
      );

      alert("✅ Login berhasil!");
      window.location.href = "dashboard.html";
    } catch (err) {
      console.error("Kesalahan saat login:", err);
      alert("⚠ Terjadi kesalahan. Lihat console untuk detailnya.");
    }
  });
}

// --- Cegah redirect otomatis dari session lama ---
document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("admin_login");
  if (user) {
    console.log("✅ Sudah login, redirect ke dashboard...");
  } else {
    console.log("🕓 Belum login, tetap di halaman login.");
  }
});
