const Event = require('../models/eventModel');
const EventResident = require('../models/eventResidentModel');
const Garbage = require('../models/garbageModel');
const House = require('../models/houseModel');
const Message = require('../models/messageModel');
const Payment = require('../models/paymentModel');
const Project = require('../models/projectModel');
const User = require('../models/userModel');

async function GetIds(type, object) {
  if (type === 'event') return await Event.find(object).select('id');
  if (type === 'eventResident') return await EventResident.find(object).select('id');
  if (type === 'garbage') return await Garbage.find(object).select('id');
  if (type === 'house') return await House.find(object).select('id');
  if (type === 'message') return await Message.find(object).select('id');
  if (type === 'payment') return await Payment.find(object).select('id');
  if (type === 'project') return await Project.find(object).select('id');
  if (type === 'user') return await User.find(object).select('id');
}

module.exports = GetIds;
