const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: String,
  description: String,
  ageRating: {
    type: Number,
    alias: 'age_rating',
  },
  ticketPrice: {
    type: Number,
    alias: 'ticket_price',
  },
  poster_url: {
    type: String,
    alias: 'posterUrl',
  },
  availableSeats: [Number],
  bookedSeats: [Number],
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = mongoose.model('Movie', movieSchema);
