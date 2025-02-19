/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const server = require('./app');

mongoose.connect(process.env.MONGODB_LOCALHOST).then(() => {
  console.log('DB connection successful!');
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});

process.on('unhandledRejection', (err) => {
  // eslint-disable-next-line no-console
  console.log('UNHANDLED REJECTION! Shutting down...');
  // eslint-disable-next-line no-console
  console.log(err.name, err.message);

  // After the server is closed, then we exit the process
  server.close(() => {
    process.exit(1);
  });
});
