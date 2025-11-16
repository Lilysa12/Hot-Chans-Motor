// === server.js ===
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Koneksi ke Supabase ---
const SUPABASE_URL = "https://cwvcprzdovbpteiuuvgj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3dmNwcnpkb3ZicHRlaXV1dmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzEwODYsImV4cCI6MjA3ODM0NzA4Nn0.Poi74Rm2rWUWGeoUTmP2CR5zlT_YqnY9j_OdjVz3tFw";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ✅ EDIT PROFIL TOKO
app.put("/api/profile/admin", async (req, res) => {
  const { nama_toko, peran1, peran2 } = req.body;

  const { data, error } = await supabase
    .from("admin_profile")
    .update({
      nama_toko,
      peran1,
      peran2,
    })
    .eq("id", 1) // ← sesuaikan ID admin kamu
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Profil toko diperbarui", data });
});

// ✅ EDIT INFORMASI PRIBADI
app.put("/api/profile/personal", async (req, res) => {
  const { nama_depan, nama_belakang, email, no_hp, bio } = req.body;

  const { data, error } = await supabase
    .from("personal_info")
    .update({
      nama_depan,
      nama_belakang,
      email,
      no_hp,
      bio,
    })
    .eq("id", 1);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Informasi pribadi diperbarui", data });
});

// ✅ EDIT ALAMAT
app.put("/api/profile/address", async (req, res) => {
  const { provinsi, kota, kecamatan, kode_pos, bio } = req.body;

  const { data, error } = await supabase
    .from("alamat")
    .update({
      provinsi,
      kota,
      kecamatan,
      kode_pos,
      bio,
    })
    .eq("id", 1);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Alamat diperbarui", data });
});

app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
