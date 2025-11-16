// /api/verifotp.js

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ error: "Email dan OTP wajib diisi" });

  try {
    // 1️⃣ Ambil OTP terbaru berdasarkan email
    const { data: otpData, error } = await supabase
      .from("otp")
      .select("*")
      .eq("email", email)
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (error || !otpData)
      return res.status(400).json({ error: "OTP tidak ditemukan" });

    // 2️⃣ Cek kode OTP
    if (otpData.kode !== otp)
      return res.status(400).json({ error: "Kode OTP salah" });

    // 3️⃣ (OPSIONAL) Cek kadaluwarsa
    const created = new Date(otpData.created_at);
    const now = new Date();
    const selisihMenit = (now - created) / 1000 / 60;

    if (selisihMenit > 5)
      return res.status(400).json({ error: "Kode OTP sudah kadaluarsa" });

    // 4️⃣ Selesai → OTP valid
    return res.status(200).json({ message: "OTP valid, lanjutkan reset password" });

  } catch (err) {
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
