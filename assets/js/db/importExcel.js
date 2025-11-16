// importExcel.js
const mysql = require('mysql2');
const xlsx = require('xlsx');

// --- Koneksi ke Database MySQL ---
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'hot chans',       // ubah sesuai user MySQL kamu
  password: 'hotchans123',       // ubah jika pakai password
  database: 'hotchans_motor' // ganti sesuai nama database kamu
});

// --- Baca file Excel ---
const workbook = xlsx.readFile('Database.xlsx');
const sheet = workbook.Sheets['Sheet1']; // ambil sheet pertama
const data = xlsx.utils.sheet_to_json(sheet);

// --- Import data ke tabel barang ---
data.forEach((row) => {
  const sql = `
    INSERT INTO barang (kode_barang, nama_barang, merek, harga_beli, harga_jual, stock)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  connection.query(
    sql,
    [
      row['Kode Barang'],
      row['Nama Barang'],
      row['Merek'],
      row['Harga Beli'],
      row['Harga Jual'],
      row['Stock'] || 0
    ],
    (err) => {
      if (err) console.error('❌ Gagal import:', err.message);
    }
  );
});

console.log('✅ Import selesai!');
connection.end();
