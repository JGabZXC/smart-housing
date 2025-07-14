/* eslint-disable */

import { deleteData } from '../../utils/http.js';

export function deleteModalFunc (type, url) {
  const confirmModal = `
    <div class="modal fade" id="deleteConfirmModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">Delete Confirmation</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete this ${type}?</p>
            <p>This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmDelete">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', confirmModal);
  const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));

  // Add reset form behavior before modal closes
  document.getElementById('deleteConfirmModal').addEventListener('hide.bs.modal', () => {
    document.getElementById('deleteConfirmModal').remove();
  });

  deleteModal.show();

  // Handle delete confirmation
  document.getElementById('confirmDelete').addEventListener('click', async () => {
    try {
      await deleteData(url);

      deleteModal.hide();
      // Remove modal cleanup as it's now handled in hide.bs.modal event

      // Show success notification modal
      this.showNotificationModal('Success', `${type} deleted successfully`, 'success');
      this.loadCollections();
    } catch (err) {
      deleteModal.hide();
      // Remove modal cleanup as it's now handled in hide.bs.modal event
      this.showNotificationModal('Error', `Error deleting ${type}`, 'danger');
    }
  });
}