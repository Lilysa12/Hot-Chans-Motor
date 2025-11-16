document.addEventListener("DOMContentLoaded", async () => {
    // ==========================
    // KONFIGURASI SUPABASE
    // ==========================
    const SUPABASE_URL = "https://cwvcprzdovbpteiuuvgj.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3dmNwcnpkb3ZicHRlaXV1dmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzEwODYsImV4cCI6MjA3ODM0NzA4Nn0.Poi74Rm2rWUWGeoUTmP2CR5zlT_YqnY9j_OdjVz3tFw";
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // ==========================
    // DEKLARASI VARIABEL UNTUK PAGINATION & SEARCH
    // ==========================
    const tableBody = document.getElementById("table-body");
    // ID disinkronkan: rows-per-page
    const rowsPerPageSelect = document.getElementById("rows-per-page"); 
    const searchInput = document.getElementById("searchInput"); 
    // ID disinkronkan: pagination-controls
    const paginationControls = document.getElementById("pagination-controls"); 
    const totalBarangElement = document.getElementById("total-barang");

    if (!tableBody || !rowsPerPageSelect || !searchInput || !paginationControls || !totalBarangElement) {
        console.error("Error: Salah satu elemen kontrol tabel (tbody, select, input search, atau pagination) tidak ditemukan. Pastikan ID HTML sudah benar!");
        return; 
    }

    let currentPage = 1;
    let currentLimit = parseInt(rowsPerPageSelect.value || '10'); 

    // --- Helper Function untuk Pindah Halaman ---
    async function goToPage(page) {
        // Ambil totalRows global untuk menghitung totalPages
        const { count: totalRows } = await supabase.from("barang_keluar").select(`id_barangkeluar`, { count: 'exact' });

        const totalPages = Math.ceil(totalRows / currentLimit);

        if (page < 1 || page > totalPages) return;

        currentPage = page;
        await loadBarangKeluar(currentPage, currentLimit, searchInput.value.trim()); 
    }

    // --- Fungsi Pembantu Pagination: Membuat Tombol Angka ---
    function createPageButton(pageNumber, container) {
        const pageBtn = document.createElement('span');
        pageBtn.textContent = String(pageNumber).padStart(2, '0');
        
        if (pageNumber === currentPage) {
            pageBtn.classList.add('active'); 
        } else {
            pageBtn.addEventListener('click', () => goToPage(pageNumber));
        }
        container.appendChild(pageBtn);
    }

    // --- Fungsi Pembantu Pagination: Menambahkan Elipsis (...) ---
    function appendEllipsis(container) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.style.padding = '0 5px';
        ellipsis.style.pointerEvents = 'none'; 
        ellipsis.style.opacity = '0.7'; 
        container.appendChild(ellipsis);
    }

    // --- Helper Function untuk Membuat Kontrol Pagination (Batasan 5 Tombol) ---
    function updatePaginationControls(totalRows) {
        const totalPages = Math.ceil(totalRows / currentLimit);
        paginationControls.innerHTML = ''; 

        if (totalRows === 0 || totalPages <= 1) {
            paginationControls.innerHTML = '';
            return; 
        }

        const maxPageButtons = 5; 
        let startPage, endPage;

        if (totalPages <= maxPageButtons) {
            startPage = 1;
            endPage = totalPages;
        } else {
            const halfLimit = Math.floor(maxPageButtons / 2);
            startPage = currentPage - halfLimit;
            endPage = currentPage + halfLimit;

            if (startPage < 1) {
                startPage = 1;
                endPage = maxPageButtons;
            }

            if (endPage > totalPages) {
                endPage = totalPages;
                startPage = totalPages - maxPageButtons + 1;
            }
        }
        
        // Tombol SEBELUMNYA
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Sebelumnya';
        prevBtn.classList.add('page-nav', 'prev');
        prevBtn.disabled = currentPage === 1;
        if (currentPage > 1) {
            prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
        }
        paginationControls.appendChild(prevBtn);

        // Wadah Angka Halaman
        const pageNumbersDiv = document.createElement('div');
        pageNumbersDiv.classList.add('page-numbers');

        // Tombol '1' dan Elipsis Awal
        if (startPage > 1) {
            createPageButton(1, pageNumbersDiv);
            if (startPage > 2) {
                appendEllipsis(pageNumbersDiv); 
            }
        }

        // Tombol Halaman dalam Range
        for (let i = startPage; i <= endPage; i++) {
            createPageButton(i, pageNumbersDiv);
        }

        // Elipsis dan Tombol 'totalPages' Akhir
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                appendEllipsis(pageNumbersDiv); 
            }
            createPageButton(totalPages, pageNumbersDiv);
        }
        
        paginationControls.appendChild(pageNumbersDiv);

        // Tombol SELANJUTNYA
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Selanjutnya';
        nextBtn.classList.add('page-nav', 'next');
        nextBtn.disabled = currentPage === totalPages;
        if (currentPage < totalPages) {
            nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
        }
        paginationControls.appendChild(nextBtn);
    }

    // ==========================
    // FUNGSI LOAD DATA (READ) DENGAN PAGINATION & SEARCH
    // ==========================
    async function loadBarangKeluar(page = 1, limit = currentLimit, searchTerm = '') {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit - 1;

        // Query utama dengan relasi ke data_barang dan count
        let query = supabase
            .from("barang_keluar")
            .select(`*, data_barang!inner(nama_barang, kode_barang)`, { count: 'exact' });

        if (searchTerm) {
            const searchPattern = `%${searchTerm}%`;
            query = query.or(
                `data_barang.nama_barang.ilike.${searchPattern}, data_barang.kode_barang.ilike.${searchPattern}`
            );
        }

        const { data, error, count: totalRowsFiltered } = await query
            .order("tanggal", { ascending: false })
            .range(startIndex, endIndex);

        if (error) {
            console.error("❌ Gagal memuat data:", error);
            tableBody.innerHTML = `<tr><td colspan="6">Gagal memuat data 😢</td></tr>`;
            return;
        }

        tableBody.innerHTML = "";
        
        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6">Belum ada data barang keluar.</td></tr>`;
            totalBarangElement.textContent = "0";
            updatePaginationControls(0);
            return;
        }

        // Dapatkan Total Barang Keluar Global (untuk kartu summary)
        let totalKeluar = 0;
        const { data: allData, error: totalError } = await supabase.from("barang_keluar").select(`jumlah_keluar`);
         if (allData && !totalError) {
            totalKeluar = allData.reduce((sum, item) => sum + (item.jumlah_keluar || 0), 0);
         }
        

        data.forEach((item) => {
            const tanggal = item.tanggal ? new Date(item.tanggal) : null;
            const tanggalFormat = tanggal ? tanggal.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "N/A";
            const waktuFormat = tanggal ? tanggal.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }).replace(/\./g, ':') : "00:00";
            const jumlah = item.jumlah_keluar || 0;

            const kodeBarang = item.data_barang?.kode_barang || item.kode_barang || "-";
            const namaBarang = item.data_barang?.nama_barang || item.nama_barang || "-";
            
            const row = `
            <tr>
                <td>${kodeBarang}</td>
                <td>${namaBarang}</td>
                <td><span class="date-highlight">${tanggalFormat}</span></td>
                <td>${waktuFormat}</td>
                <td>${jumlah}</td>
                <td class="action-col">
                    <img src="../assets/gambar/icons/edit.png" alt="Edit" class="action-icon open-edit-modal" data-id="${item.id_barangkeluar}">
                    <img src="../assets/gambar/icons/delete.png" alt="Delete" class="action-icon open-delete-modal" data-id="${item.id_barangkeluar}">
                </td>
            </tr>
            `;
            tableBody.insertAdjacentHTML("beforeend", row);
        });

        // Tampilkan total barang keluar global
        totalBarangElement.textContent = totalKeluar.toLocaleString("id-ID");
        
        // Update kontrol pagination berdasarkan jumlah baris yang difilter/dicari
        updatePaginationControls(totalRowsFiltered || 0); 
    }
    
    // ==========================
    // FUNGSI TAMBAH BARANG (CREATE)
    // ==========================
    // Catatan: Asumsi fungsi 'combineDateTime' dan 'closeModal' tersedia di assets/js/barangkeluar.js atau global
    async function handleAddSubmit(event) {
        event.preventDefault();
        
        const kode = document.getElementById('add-kode').value;
        const nama = document.getElementById('add-nama').value;
        const tanggal = document.getElementById('add-tanggal').value;
        const waktu = document.getElementById('add-waktu').value;
        const jumlah = parseInt(document.getElementById('add-jumlah').value) || 0;

        const timestamp = combineDateTime(tanggal, waktu); 

        const { error } = await supabase
            .from('barang_keluar')
            .insert([{
                kode_barang: kode,
                nama_barang: nama,
                tanggal: timestamp,
                jumlah_keluar: jumlah
            }]);

        if (error) {
            console.error("Gagal menambah data:", error);
            alert(`GAGAL MENAMBAH DATA:\n${error.message}`);
        } else {
            document.getElementById('add-form').reset();
            closeModal(); 
            // Refresh ke halaman 1 setelah tambah data
            currentPage = 1;
            loadBarangKeluar(currentPage, currentLimit, searchInput.value.trim()); 
        }
    }

    // ==========================
    // FUNGSI EDIT BARANG (UPDATE)
    // ==========================
    async function handleEditSubmit(event) {
        event.preventDefault();

        const id = document.getElementById('edit-id').value; 
        if (!id) {
            alert("ID barang tidak ditemukan, tidak bisa mengedit.");
            return;
        }
        
        const kode = document.getElementById('edit-kode').value;
        const nama = document.getElementById('edit-nama').value;
        const tanggal = document.getElementById('edit-tanggal').value;
        const waktu = document.getElementById('edit-waktu').value;
        const jumlah = parseInt(document.getElementById('edit-jumlah').value) || 0;

        const timestamp = combineDateTime(tanggal, waktu); 

        const { error } = await supabase
            .from('barang_keluar')
            .update({
                kode_barang: kode,
                nama_barang: nama,
                tanggal: timestamp,
                jumlah_keluar: jumlah
            })
            .eq('id_barangkeluar', id); 

        if (error) {
            console.error("Gagal mengedit data:", error);
            alert(`GAGAL MENGEDIT DATA:\n${error.message}`);
        } else {
            closeModal(); 
            // Refresh tabel
            loadBarangKeluar(currentPage, currentLimit, searchInput.value.trim()); 
        }
    }

    // ==========================
    // FUNGSI HAPUS BARANG (DELETE)
    // ==========================
    async function handleDelete(id) {
        if (!id) {
            console.error("ID barang tidak ditemukan.");
            return;
        }

        const { error } = await supabase
            .from('barang_keluar')
            .delete()
            .eq('id_barangkeluar', id); 

        if (error) {
            console.error("Gagal menghapus data:", error);
            alert(`GAGAL MENGHAPUS DATA:\n${error.message}`);
        } else {
            closeModal(); 
            // Refresh tabel
            loadBarangKeluar(currentPage, currentLimit, searchInput.value.trim()); 
        }
    }

    // ==========================
    // EVENT LISTENER UNTUK PAGINATION (LIHAT N)
    // ==========================
    rowsPerPageSelect.addEventListener('change', async () => {
        currentLimit = parseInt(rowsPerPageSelect.value);
        currentPage = 1; 
        await loadBarangKeluar(currentPage, currentLimit, searchInput.value.trim());
    });

    // ==========================
    // EVENT LISTENER UNTUK PENCARIAN (CARI)
    // ==========================
    searchInput.addEventListener('input', async () => {
        const searchTerm = searchInput.value.trim();
        currentPage = 1; 
        await loadBarangKeluar(currentPage, currentLimit, searchTerm);
    });

    // ==========================
    // INISIALISASI
    // ==========================
    const addForm = document.getElementById("add-form");
    if (addForm) addForm.addEventListener("submit", handleAddSubmit);

    const editForm = document.getElementById("edit-form");
    if (editForm) editForm.addEventListener("submit", handleEditSubmit);
    
    await loadBarangKeluar(currentPage, currentLimit, searchInput.value.trim()); 
});