// /api/lupapw.js

import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

// Pakai ENV sesuai yang abang punya
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  try {
    // CEK EMAIL DI TABEL ADMIN
    const { data: adminData, error: adminErr } = await supabase
      .from("admin")
      .select("*")
      .eq("email", email)
      .single();

    if (adminErr || !adminData) {
      return res.status(400).json({ error: "Email tidak ditemukan!" });
    }

    const admin_id = adminData.id_admin;

    // Generate 6 digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Expired 5 menit
    const expiredAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Simpan OTP ke Supabase
    const { error: otpErr } = await supabase.from("otp").insert([
      {
        otp_code: otpCode,
        id_admin: admin_id,
        is_used: false,
        expired_at: expiredAt,
      },
    ]);

    if (otpErr) {
      return res.status(500).json({ error: "Gagal simpan OTP ke Supabase" });
    }

    // --- KIRIM EMAIL PAKAI GMAIL ---
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // dari ENV
        pass: process.env.EMAIL_PASS, // dari ENV
      },
    });

    await transporter.sendMail({
      from: `Hot Chan's Motor <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Kode OTP Pemulihan Password",
      html: `
        <h2>Kode Verifikasi OTP</h2>
        <p>Gunakan kode berikut untuk memulihkan password akunmu:</p>
        <h1 style="font-size: 32px; letter-spacing: 6px;">${otpCode}</h1>
        <p>Kode ini berlaku selama <b>5 menit</b>.</p>
      `,
    });

    return res.status(200).json({
      message: "OTP berhasil dikirim ke email!",
      email: email,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Server error" });
  }
}
