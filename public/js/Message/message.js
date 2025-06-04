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
const messagesPerPage = 1;
let hasNextPage = false;

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
          'justify-content-between',
          'align-items-center',
          'mb-2',
          'gap-1',
        );
        const date = new Date(message.date);
        const finalDate = date.toLocaleString('en-US', {
          timeZone: 'Asia/Manila',
        });
        div.innerHTML = `
          <div class="d-flex gap-1">
            <p class="top-message">${message.user.name.split(' ')[0]} <span class="date-message">(${finalDate})</span>: </p>
            <p class="text-break bottom-message">${message.message}</p>
          </div>
            ${
          message.user._id === userID
            ? `
          <div class="d-flex gap-2 btn-actions">
            <button class="btn btn-primary edit-message" data-id="${message._id}"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-danger delete-message" data-id="${message._id}"><i class="bi bi-trash"></i></button>
          </div>
          `
            : ''
        }
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

async function handleMessageDelete(target, messageID) {
  if (target.classList.contains('for-delete')) {
    try {
      target.disabled = true;
      target.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Deleting...';
      await axios({
        method: 'DELETE',
        url: `/api/v1/messages/${messageID}`,
      });
      showAlert('success', 'Message deleted!');

      const res = await fetchData(`/api/v1/${type}/${typeID}/messages/message?page=${currentPage}&limit=${messagesPerPage}&sort=-date`);
      const messages = res.messages;

      if (messages.length === 0 && currentPage > 1) {
        currentPage--; // Move to the previous page
      }
      await getMessages(
        type,
        typeID
      );
    } catch (err) {
      showAlert('error', err.response?.data.message || "Something went wrong!");
    }
  }
  target.innerHTML = '<i class="bi bi-check"></i> Confirm';
  target.classList.add('for-delete');
}

async function handleMessageUpdate(target, message, messagePrevVal, messageID) {
  if (!target.classList.contains('btn-success')) {
    target.innerHTML = '<i class="bi bi-check"></i> Confirm';
    target.classList.remove('btn-primary');
    target.classList.add('btn-success');
    message.innerHTML = `<input type="text" value="${messagePrevVal}">`;
    return;
  }

  const newMessage = message.querySelector('input').value;
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/messages/${messageID}`,
      data: {
        message: newMessage,
      },
    });

    message.innerHTML = '';
    if (res.data.status === 'success') {
      showAlert('success', 'Message updated!');
      await getMessages(
        type,
        typeID
      );
    }

    target.innerHTML = '<i class="bi bi-pencil">';
    target.classList.remove('btn-success');
    target.classList.add('btn-primary');
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}

if(typeSingleContainer) {
  getMessages(type, typeID);
}

if(forumMessages) {
  forumMessages.addEventListener('click', async (e) => {
    let target = e.target;
    if (target.tagName.toLowerCase() === 'i') target = target.parentElement;
    const parentOfParentElement = target.parentElement.parentElement;
    const messageID = target.dataset.id;

    if (target.classList.contains('edit-message')) {
      const message = parentOfParentElement.querySelector('.bottom-message');
      const messagePrevVal = message.innerHTML;

      await handleMessageUpdate(target, message, messagePrevVal, messageID);
    }

    if (target.classList.contains('delete-message')) {
      await handleMessageDelete(target, messageID);
    }
  });
}

if(formMessage) {
  formMessage.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(formMessage);

    try {
      buttonSpinner(submitMessageBtn, 'Submit', 'Submitting')
      const res = await axios({
        method: 'POST',
        url: `/api/v1/${type}/${typeID}/messages`,
        data: { message: formData.get('comment') },
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