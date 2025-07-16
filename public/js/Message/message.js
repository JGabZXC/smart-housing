/* eslint-disable */
import { showAlert } from '../utils/alerts.js';
import { renderPagination } from '../utils/renderPagination.js';
import { buttonSpinner, spinner } from '../utils/spinner.js';
import { fetchData } from '../utils/http.js';

const typeSingleContainer = document.querySelector('#type-single-container');
const userID = typeSingleContainer && typeSingleContainer.dataset.userid;
const typeID = typeSingleContainer && typeSingleContainer.dataset.typeid;
const type = typeSingleContainer && typeSingleContainer.dataset.type;

const forumMessages = document.querySelector('#forum-messages');
const formMessage = document.querySelector('#form-message');
const submitMessageBtn = document.querySelector('#submit-message-btn');
const commentPaginationType = document.querySelector('#comment-pagination-type')

let abortController;

let currentPage = 1;
const messagesPerPage = 10;
let hasNextPage = false;

function formatMessageDate(messageDate) {
  const now = new Date();
  const msgDate = new Date(messageDate);
  const diffTime = Math.abs(now - msgDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Check if message is from today
  const isToday = now.toDateString() === msgDate.toDateString();

  if (isToday) {
    return `Today ${msgDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Manila'
    })}`;
  } else if (diffDays === 1) {
    return '1d';
  } else if (diffDays < 7) {
    return `${diffDays}d`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}w`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months}mo`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years}y`;
  }
}

function createDeleteDialog(messageID) {
  return new Promise((resolve) => {
    // Remove existing dialog if any
    const existingDialog = document.querySelector('#delete-message-dialog');
    if (existingDialog) existingDialog.remove();

    // Create dialog HTML
    const dialogHTML = `
      <div class="modal fade" id="delete-message-dialog" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Delete Message</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>Are you sure you want to delete this message? This action cannot be undone.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-danger" id="confirm-delete-btn">
                <i class="bi bi-trash me-2"></i>Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Add dialog to DOM
    document.body.insertAdjacentHTML('beforeend', dialogHTML);

    const dialog = document.querySelector('#delete-message-dialog');
    const confirmBtn = document.querySelector('#confirm-delete-btn');
    const modal = new bootstrap.Modal(dialog);

    // Handle confirm delete
    confirmBtn.addEventListener('click', async () => {
      try {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Deleting...';

        await axios({
          method: 'DELETE',
          url: `/api/v1/messages/${messageID}`,
        });

        showAlert('success', 'Message deleted!');
        modal.hide();
        resolve(true);
      } catch (err) {
        showAlert('error', err.response?.data.message || "Something went wrong!");
        modal.hide();
        resolve(false);
      }
    });

    // Handle dialog close
    dialog.addEventListener('hidden.bs.modal', () => {
      dialog.remove();
      resolve(false);
    });

    modal.show();
  });
}

async function getMessages(type, id) {
  try {
    spinner(forumMessages, 'Loading messages');
    if (currentPage === 1) commentPaginationType.innerHTML = '';
    if (abortController) abortController.abort();

    abortController = new AbortController();

    const res = await axios({
      method: 'GET',
      url: `/api/v1/${type}/${id}/messages/message?page=${currentPage}&limit=${messagesPerPage}&sort=-date`,
      signal: abortController.signal,
    });

    const messages = res.data.messages;
    const totalPages = res.data.totalPages;

    if (messages.length > 0) {
      forumMessages.innerHTML = '';
      messages.forEach((message) => {
        const div = document.createElement('div');
        div.classList.add(
          'd-flex',
          'flex-column',
          'mb-2',
        );
        const finalDate = formatMessageDate(message.date);

        div.innerHTML = `
          <div class="message-card p-2 rounded">
            <div class="d-flex justify-content-between gap-2 align-items-center mb-2">
              <p class="top-message fw-bold m-0">${message.user.name.split(' ')[0]} <span class="date-message">(${finalDate})</span></p>
              ${
          message.user._id === userID
            ? `
                <div class="dropdown">
                  <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-three-dots"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li><button class="dropdown-item edit-message" data-id="${message._id}"><i class="bi bi-pencil me-2"></i>Edit</button></li>
                    <li><button class="dropdown-item text-danger delete-message" data-id="${message._id}"><i class="bi bi-trash me-2"></i>Delete</button></li>
                  </ul>
                </div>
                `
            : ''
        }
            </div>
            <p class="text-break bottom-message">${message.message}</p>
          </div>
        `;
        forumMessages.appendChild(div);
      });
    } else {
      forumMessages.innerHTML = `<p class="text-break" style="width: 80%">No messages yet!</p>`;
    }

    // Infer hasNextPage
    hasNextPage = currentPage < totalPages;

    // Render pagination
    if(totalPages >= 1) renderPagination(totalPages, currentPage, hasNextPage, changeMessagePage);
  } catch (err) {
    if (err.response?.data.status === 'error') {
      showAlert('error', err.response.data.message);
    } else if(err.name !== "CanceledError") {
      showAlert('error', 'Something went wrong!');
    }
  }
}

async function handleMessageDelete(messageID) {
  const confirmed = await createDeleteDialog(messageID);

  if (confirmed) {
    const res = await fetchData(`/api/v1/${type}/${typeID}/messages/message?page=${currentPage}&limit=${messagesPerPage}&sort=-date`);
    const messages = res.messages;

    if (messages.length === 0 && currentPage > 1) {
      currentPage--; // Move to the previous page
    }
    await getMessages(type, typeID);
  }
}

async function handleMessageUpdate(target, message, messagePrevVal, messageID) {
  // Check if already in edit mode
  if (message.querySelector('.edit-message-form')) {
    return; // Prevent multiple edits
  }

  if (!target.classList.contains('btn-success')) {
    // Escape HTML characters in the message value
    const escapedMessage = messagePrevVal.replace(/"/g, '&quot;');

    // Create edit form with better styling
    const editForm = `
      <div class="edit-message-form">
        <div class="input-group">
          <input type="text" class="form-control" value="${escapedMessage}" id="edit-input-${messageID}" data-original="${escapedMessage}">
          <button class="btn btn-success btn-sm confirm-edit" type="button" data-id="${messageID}">
            <i class="bi bi-check"></i>
          </button>
          <button class="btn btn-secondary btn-sm cancel-edit" type="button" data-original="${escapedMessage}">
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>
    `;

    message.innerHTML = editForm;

    // Focus on input and select all text
    const input = document.querySelector(`#edit-input-${messageID}`);
    input.focus();
    input.select();

    // Disable all edit buttons for this message
    const messageCard = target.closest('.message-card');
    const editBtn = messageCard.querySelector('.edit-message');
    editBtn.style.pointerEvents = 'none';
    editBtn.style.opacity = '0.5';

    // Hide the dropdown
    const dropdown = target.closest('.dropdown');
    const dropdownBtn = dropdown.querySelector('.dropdown-toggle');
    dropdownBtn.click(); // Close dropdown

    return;
  }

  const input = message.querySelector('input');
  const newMessage = input.value.trim();
  const originalMessage = input.dataset.original;

  // Validate input
  if (!newMessage) {
    showAlert('error', 'Message cannot be empty');
    return;
  }

  if (newMessage === originalMessage) {
    // No changes made, just cancel
    message.innerHTML = originalMessage;

    // Re-enable edit button
    const messageCard = target.closest('.message-card');
    const editBtn = messageCard.querySelector('.edit-message');
    editBtn.style.pointerEvents = 'auto';
    editBtn.style.opacity = '1';
    return;
  }

  try {
    target.disabled = true;
    target.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/messages/${messageID}`,
      data: {
        message: newMessage,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Message updated!');
      await getMessages(type, typeID);
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message || 'Failed to update message');
    // Restore original message on error
    message.innerHTML = originalMessage;

    // Re-enable edit button
    const messageCard = target.closest('.message-card');
    const editBtn = messageCard.querySelector('.edit-message');
    editBtn.style.pointerEvents = 'auto';
    editBtn.style.opacity = '1';
  }
}

if(typeSingleContainer) {
  getMessages(type, typeID);
}

if(forumMessages) {
  forumMessages.addEventListener('click', async (e) => {
    let target = e.target;
    if (target.tagName.toLowerCase() === 'i') target = target.parentElement;
    const messageCard = target.closest('.message-card');
    const messageID = target.dataset.id;

    if (target.classList.contains('edit-message')) {
      const message = messageCard.querySelector('.bottom-message');
      const messagePrevVal = message.textContent;

      await handleMessageUpdate(target, message, messagePrevVal, messageID);
    }

    if (target.classList.contains('confirm-edit')) {
      const message = messageCard.querySelector('.bottom-message');
      const input = message.querySelector('input');
      const newMessage = input.value.trim();
      const originalMessage = input.dataset.original;

      // Validate input
      if (!newMessage) {
        showAlert('error', 'Message cannot be empty');
        return;
      }

      if (newMessage === originalMessage) {
        // No changes made, just cancel
        message.innerHTML = originalMessage;

        // Re-enable edit button
        const editBtn = messageCard.querySelector('.edit-message');
        editBtn.style.pointerEvents = 'auto';
        editBtn.style.opacity = '1';
        return;
      }

      try {
        target.disabled = true;
        target.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

        const res = await axios({
          method: 'PATCH',
          url: `/api/v1/messages/${messageID}`,
          data: {
            message: newMessage,
          },
        });

        if (res.data.status === 'success') {
          showAlert('success', 'Message updated!');
          await getMessages(type, typeID);
        }
      } catch (err) {
        showAlert('error', err.response?.data?.message || 'Failed to update message');
        // Restore original message on error
        message.innerHTML = originalMessage;

        // Re-enable edit button
        const editBtn = messageCard.querySelector('.edit-message');
        editBtn.style.pointerEvents = 'auto';
        editBtn.style.opacity = '1';
      }
    }

    if (target.classList.contains('cancel-edit')) {
      const message = messageCard.querySelector('.bottom-message');
      const originalMessage = target.dataset.original;
      message.innerHTML = originalMessage;

      // Re-enable edit button
      const editBtn = messageCard.querySelector('.edit-message');
      editBtn.style.pointerEvents = 'auto';
      editBtn.style.opacity = '1';
    }

    if (target.classList.contains('delete-message')) {
      await handleMessageDelete(messageID);
    }
  });
}

if(formMessage) {
  formMessage.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(formMessage);

    if(abortController) abortController

    try {
      buttonSpinner(submitMessageBtn, 'Submit', 'Submitting')
      const res = await axios({
        method: 'POST',
        url: `/api/v1/${type}/${typeID}/messages`,
        data: { message: formData.get('comment') },
        signal: abortController ? abortController.signal : undefined,
      });
      const message = res.data;
      console.log(message);
      if (message.status === 'success') {
        showAlert('success', 'Message uploaded!');
        document.querySelector('#message').value = '';
        await getMessages(type, typeID);
      }
    } catch (err) {
      showAlert('error', err.response.data.message);
    } finally {
      buttonSpinner(submitMessageBtn, 'Submit', 'Submitting')
    }
  })
}

window.changeMessagePage = function (newPage) {
  if (newPage < 1) return;
  currentPage = newPage;
  getMessages(type, typeID);
}