const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  bookerName: {
    type: String,
    required: true,
  },
  movieTitle: {
    type: String,
    required: true,
  },
  seatNumbers: {
    type: [Number],
    required: true,
  },
  totalCost: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: 'unpaid',
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
