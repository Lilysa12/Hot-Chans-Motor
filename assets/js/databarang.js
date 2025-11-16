document.addEventListener("DOMContentLoaded", () => {
  // === 1. LOGIKA SIDEBAR === //
  const currentLocation = window.location.href;
  const menuItems = document.querySelectorAll(".nav-menu .nav-item");

  menuItems.forEach((item) => {
    // Mengecek jika href item ada di dalam URL saat ini
    if (currentLocation.includes(item.getAttribute("href"))) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // === 2. LOGIKA MODAL (POP-UP) === //
  const modalOverlay = document.getElementById("modal-overlay");
  const dataTableBody = document.getElementById("dataTableBody");

  // Modal Edit
  const editModal = document.getElementById("edit-modal");
  const cancelEditButton = document.getElementById("cancelEdit");
  const editForm = document.getElementById("editForm");

  // Modal Hapus
  const deleteModal = document.getElementById("delete-modal");
  const cancelDeleteButton = document.getElementById("cancelDelete");
  const confirmDeleteButton = document.getElementById("confirmDelete");

  // Fungsi untuk membuka modal
  window.openModal = (modal) => { // Dibuat global agar bisa dipanggil backend.js
    if (modal) {
      modal.classList.remove("hidden");
      modalOverlay.classList.remove("hidden");
    }
  };

  // Fungsi untuk menutup modal
  window.closeModal = (modal) => { // Dibuat global agar bisa dipanggil backend.js
    if (modal) {
      modal.classList.add("hidden");
      modalOverlay.classList.add("hidden");
    }
  };

  // --- Event Delegation untuk Tombol di Tabel ---
  if (dataTableBody) {
    dataTableBody.addEventListener("click", (event) => {
      
      // --- Tombol EDIT diklik ---
      const editButton = event.target.closest(".btn-edit");
      if (editButton) {
        const row = editButton.closest("tr");
        
        // Ambil data dari sel tabel
        const kode = row.cells[0].textContent;
        const nama = row.cells[1].textContent;
        const merek = row.cells[3].textContent;
        const hargaBeli = row.cells[4].textContent.replace(/\./g, ''); // Hapus titik
        const hargaJual = row.cells[5].textContent.replace(/\./g, ''); // Hapus titik
        const stok = row.cells[6].textContent;

        // Isi form modal
        document.getElementById("editKode").value = kode;
        document.getElementById("editNama").value = nama;
        document.getElementById("editMerek").value = merek;
        document.getElementById("editHargaBeli").value = hargaBeli;
        document.getElementById("editHargaJual").value = hargaJual;
        document.getElementById("editStok").value = stok;

        openModal(editModal);
      }

      // --- Tombol HAPUS diklik ---
      const deleteButton = event.target.closest(".btn-delete");
      if (deleteButton) {
        // Simpan ID (kode barang) di tombol konfirmasi
        const id = deleteButton.dataset.id;
        confirmDeleteButton.dataset.id = id; 
        openModal(deleteModal);
      }
    });
  }
  
  // --- Event tombol TUTUP (modal edit dan hapus) ---
  if (cancelEditButton) {
    cancelEditButton.addEventListener("click", () => closeModal(editModal));
  }
  
  if (cancelDeleteButton) {
    cancelDeleteButton.addEventListener("click", () => closeModal(deleteModal));
  }

  // --- Event klik overlay untuk menutup modal ---
  if (modalOverlay) {
    modalOverlay.addEventListener("click", () => {
      closeModal(editModal);
      closeModal(deleteModal);
    });
  }

  // --- Event Form Submit (Edit) ---
  // Ditangani di backend/dataBarang.js
  
  // --- Event Tombol Konfirmasi Hapus ---
  // Ditangani di backend/dataBarang.js
});