document.addEventListener("DOMContentLoaded", function() {

    const editModal = document.getElementById("edit-toko-modal");
    const openBtn = document.getElementById("edit-toko-btn");
    
    if (editModal && openBtn) {
        
        const closeBtn = editModal.querySelector(".close-btn");
        const cancelBtn = editModal.querySelector(".btn-cancel");
        const editForm = document.getElementById("edit-toko-form");

        function openModal() {
            editModal.style.display = "flex";
        }

        function closeModal() {
            editModal.style.display = "none";
        }

        openBtn.onclick = function() {
            openModal();
        }

        if (closeBtn) {
            closeBtn.onclick = function() {
                closeModal();
            }
        }
        
        if (cancelBtn) {
            cancelBtn.onclick = function() {
                closeModal();
            }
        }
        
        window.onclick = function(event) {
            if (event.target == editModal) {
                closeModal();
            }
        }
        
        if (editForm) {
            editForm.onsubmit = function(e) {
                e.preventDefault(); 
                alert("Perubahan disimpan!"); 
                closeModal(); 
            }
        }
    }
});