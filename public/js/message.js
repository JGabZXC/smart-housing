/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

let currentPage = 1;
const messagesPerPage = 10;
let hasNextPage = false;

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
        const date = new Date(message.date);
        const finalDate = date.toLocaleString('en-US', { timeZone: 'Asia/Manila' });
        div.innerHTML = `
          <p class="text-break" style="width: 80%">${message.user.name.split(' ')[0]} (${finalDate}): ${message.message}</p>
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
    renderPagination(totalPages);
  } catch (err) {
    if (err.response.data.status === 'error') {
      showAlert('error', err.response.data.message);
      window.setTimeout(() => {
        location.assign('/');
      }, 2000);
    }
  }
};

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

function renderPagination(totalPages) {
  const pagination = document.querySelector('.pagination');
  pagination.innerHTML = '';

  // Previous Button
  const prevButton = `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
    <a class="page-link" aria-label="Previous" onclick="changePage(${currentPage - 1})">
      <span aria-hidden="true">«</span>
    </a>
  </li>`;
  pagination.innerHTML += prevButton;

  // Page Numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageItem = `<li class="page-item ${i === currentPage ? 'active' : ''}">
      <a class="page-link" onclick="changePage(${i})">${i}</a>
    </li>`;
    pagination.innerHTML += pageItem;
  }

  // Next Button
  const nextButton = `<li class="page-item ${!hasNextPage ? 'disabled' : ''}">
    <a class="page-link" aria-label="Next" onclick="changePage(${currentPage + 1})">
      <span aria-hidden="true">»</span>
    </a>
  </li>`;
  pagination.innerHTML += nextButton;
}

window.changePage = function (newPage) {
  const projectId = document.querySelector('#project-id').dataset.projectid;
  if (newPage < 1) return; // Prevent going to page 0 or negative
  currentPage = newPage;
  getMessagesProject(projectId);
};