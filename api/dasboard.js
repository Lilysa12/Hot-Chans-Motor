// === Import library Supabase ===
import { createClient } from '@supabase/supabase-js'

// === Konfigurasi koneksi Supabase ===
const SUPABASE_URL = "https://cwvcprzdovbpteiuuvgj.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3dmNwcnpkb3ZicHRlaXV1dmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzEwODYsImV4cCI6MjA3ODM0NzA4Nn0.Poi74Rm2rWUWGeoUTmP2CR5zlT_YqnY9j_OdjVz3tFw";
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// === Fungsi: Update Dashboard ===
async function updateDashboardCards() {
  try {
    // Hitung total barang masuk
    const { data: masukData, error: masukError } = await supabase
      .from('barang_masuk')
      .select('stok_barang')

    if (masukError) throw masukError

    const totalBarangMasuk = masukData.reduce((acc, item) => acc + (item.stok_barang || 0), 0)

    // Hitung total barang keluar
    const { data: keluarData, error: keluarError } = await supabase
      .from('barang_keluar')
      .select('stok_barang')

    if (keluarError) throw keluarError

    const totalBarangKeluar = keluarData.reduce((acc, item) => acc + (item.stok_barang || 0), 0)

    // Hitung total stok barang
    const { data: barangData, error: barangError } = await supabase
      .from('barang')
      .select('stok_barang')

    if (barangError) throw barangError

    const totalStokBarang = barangData.reduce((acc, item) => acc + (item.stok_barang || 0), 0)

    console.log('=== HASIL DASHBOARD ===')
    console.log('Total Barang:', totalStokBarang)
    console.log('Barang Masuk:', totalBarangMasuk)
    console.log('Barang Keluar:', totalBarangKeluar)

  } catch (error) {
    console.error('Gagal memuat data dashboard:', error)
  }
}

// === Jalankan ===
updateDashboardCards()
