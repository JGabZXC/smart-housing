/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const getMessagesProject = async (projectid) => {
  try {
    console.log(projectid);
    const res = await axios({
      method: 'GET',
      url: `/api/v1/projects/${projectid}/messages/message`,
    });

    const messages = res.data.data.doc;
    console.log(messages);
    const messageContainer = document.querySelector('#forum-messages');
    messageContainer.innerHTML = '';

    if(messages.length > 0) {
    messages.forEach((message) => {
      const div = document.createElement('div');
      const date = new Date(message.date);
      console.log(date);
      const finalDate = date.toLocaleString("en-US", {timeZone: "Asia/Manila"});
      console.log(date);
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
  } catch (err) {
    if(err.response.data.status === 'error') {
      showAlert('error', err.response.data.message);
      window.setTimeout(() => {
        location.assign('/');
      }, 2000);
    }
  }
}