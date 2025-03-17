/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
import { renderPagination } from './_eventAndProjHelper';

let currentPage = 1;
const messagesPerPage = 10;
let hasNextPage = false;

let userID;
if (document.querySelector('#project-id')) {
  userID = document.querySelector('#project-id').dataset.userid;
}

const forumMessages = document.querySelector('#forum-messages');

async function handleMessageUpdate(target, message, prevValue, messageID) {
  if (!target.classList.contains('btn-success')) {
    target.innerHTML = '<i class="bi bi-check"></i> Confirm';
    target.classList.remove('btn-primary');
    target.classList.add('btn-success');
    message.innerHTML = `<input type="text" value="${prevValue}">`;
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
      await getMessagesProject(
        document.querySelector('#project-id').dataset.projectid,
      );
    }

    target.innerHTML = '<i class="bi bi-pencil">';
    target.classList.remove('btn-success');
    target.classList.add('btn-primary');
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}

async function handleMessageDelete(target, messageID) {
  if (target.classList.contains('for-delete')) {
    try {
      await axios({
        method: 'DELETE',
        url: `/api/v1/messages/${messageID}`,
      });
      showAlert('success', 'Message deleted!');
      await getMessagesProject(
        document.querySelector('#project-id').dataset.projectid,
      );
    } catch (err) {
      showAlert('error', err.response.data.message);
    }
  }
  target.innerHTML = '<i class="bi bi-check"></i> Confirm';
  target.classList.add('for-delete');
}

export const getMessagesProject = async (projectid) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/v1/projects/${projectid}/messages/message?page=${currentPage}&limit=${messagesPerPage}&sort=-date`,
    });

    const messages = res.data.messages;
    const totalPages = res.data.totalPages;
    const messageContainer = document.querySelector('#forum-messages');
    messageContainer.innerHTML = '';

    if (messages.length > 0) {
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
        messageContainer.appendChild(div);
      });
    } else {
      const div = document.createElement('div');
      div.innerHTML = `
        <p class="text-break" style="width: 80%">No messages yet!</p>
      `;
      messageContainer.appendChild(div);
    }

    // Infer hasNextPage
    hasNextPage = messages.length === messagesPerPage;

    // Render pagination
    renderPagination(totalPages, currentPage, hasNextPage, changePage);
  } catch (err) {
    if (err.response.data.status === 'error') {
      showAlert('error', err.response.data.message);
      window.setTimeout(() => {
        location.assign('/');
      }, 2000);
    }
  }
};

if (forumMessages) {
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

export const submitMessagesProject = async (projectid) => {
  try {
    const res = await axios({
      method: 'POST',
      url: `/api/v1/projects/${projectid}/messages`,
      data: {
        message: document.querySelector('#message').value,
      },
    });
    const message = res.data;

    if (message.status === 'success') {
      showAlert('success', 'Message uploaded!');
      document.querySelector('#message').value = '';
      await getMessagesProject(projectid);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

window.changePage = function (newPage) {
  const projectId = document.querySelector('#project-id').dataset.projectid;
  if (newPage < 1) return; // Prevent going to page 0 or negative
  currentPage = newPage;
  getMessagesProject(projectId);
};
