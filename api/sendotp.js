import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cwvcprzdovbpteiuuvgj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3dmNwcnpkb3ZicHRlaXV1dmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzEwODYsImV4cCI6MjA3ODM0NzA4Nn0.Poi74Rm2rWUWGeoUTmP2CR5zlT_YqnY9j_OdjVz3tFw";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email wajib diisi" });
        }

        // 1️⃣ Ambil OTP terbaru dari Supabase
        const { data: otpData, error } = await supabase
            .from("otp")
            .select("kode")
            .eq("email", email)
            .order("id", { ascending: false })
            .limit(1)
            .single();

        if (error || !otpData) {
            return res.status(400).json({ message: "OTP tidak ditemukan" });
        }

        const kodeOtp = otpData.kode;

        // 2️⃣ Kirim email pakai Nodemailer
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "hotchansmotor@gmail.com",
                pass: "cvme mfgn dzkt cigs", // SANDI APLIKASI GMAIL
            },
        });

        await transporter.sendMail({
            from: `"Hotchans Motor" <hotchansmotor@gmail.com>`,
            to: email,
            subject: "Kode Verifikasi OTP Anda",
            html: `
                <h2>Kode Verifikasi Anda</h2>
                <p>Gunakan kode berikut untuk verifikasi:</p>
                <h1 style="font-size: 35px; letter-spacing: 5px;">${kodeOtp}</h1>
                <p>Kode ini berlaku 5 menit.</p>
            `,
        });

        return res.status(200).json({ message: "OTP berhasil dikirim" });

    } catch (err) {
        return res.status(500).json({ message: "Server error", err: err.message });
    }
}
