const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const axios = require('axios');
const moviesRouter = require('./movies');
const Movie = require('./model/movieModel');
const Ticket = require('./model/ticketModel');
const Balance = require('./model/balanceModel');

const mongoURI = 'mongodb://localhost:27017/seaCinema';
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware untuk mengatur kebijakan keamanan konten
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self' data: 'unsafe-inline'; img-src 'self' data: https://image.tmdb.org/ https://uploads-ssl.webflow.com/;"
  );
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/movies', moviesRouter);

app.get('/movies/:id/book', async (req, res) => {
  try {
    const { id } = req.params;
    const selectedMovie = await Movie.findById(id);

    const reservedSeats = await Ticket.find({ movieId: id, status: 'unpaid' })
      .distinct('seatNumbers')
      .exec();

    const availableSeats = selectedMovie.availableSeats.filter(
      (seat) => !reservedSeats.includes(seat.toString())
    );

    res.render('booking', {
      movie: selectedMovie,
      reservedSeats,
      availableSeats,
    });
  } catch (error) {
    console.error('Gagal mengambil data movie', error);
    res.status(500).send('Gagal mengambil data movie');
  }
});

app.get('/movies/:id/seats', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send('ID film tidak valid');
    }

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).send('Film tidak ditemukan');
    }

    const reservedSeats = await Ticket.find({ movieId: id, status: 'booked' })
      .distinct('seatNumbers')
      .exec();

    res.json({ availableSeats: movie.availableSeats, reservedSeats });
  } catch (error) {
    console.error('Gagal mengambil data kursi', error);
    res.status(500).send('Gagal mengambil data kursi');
  }
});

const updateSelectedSeats = async (id, seatNumbers) => {
  try {
    const response = await axios.put(`/movies/${id}/seats`, {
      seatNumbers,
    });

    if (response.status === 200) {
      console.log('Status kursi berhasil diperbarui');
    } else {
      console.error('Gagal memperbarui status kursi');
    }
  } catch (error) {
    console.error('Gagal memperbarui status kursi', error);
  }
};

axios.defaults.baseURL = 'http://localhost:3000';

app.post('/movies/:id/book', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, selectedSeats, confirmBooking } = req.body;

    if (!confirmBooking || confirmBooking !== 'true') {
      const errorMessage = 'Permintaan tidak valid';
      console.error(errorMessage);
      return res.status(400).send(errorMessage);
    }

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).send('Film tidak ditemukan');
    }

    const seatsArray = JSON.parse(selectedSeats);
    const seatNumbers = seatsArray.map((seat) => seat.replace('seat-', ''));

    const reservedSeats = await Ticket.find({ movieId: id })
      .distinct('seatNumbers')
      .exec();

    const isSeatBooked = (seatId) => {
      return reservedSeats.includes(seatId);
    };

    if (seatNumbers.some(isSeatBooked)) {
      return res
        .status(400)
        .send('Kursi telah dipesan. Silakan pilih kursi lain.');
    }

    // Pengecekan apakah kursi yang dipilih telah dipesan sebelumnya
    const existingTicket = await Ticket.findOne({
      movieId: id,
      seatNumbers: { $in: seatNumbers },
      status: 'unpaid',
    });

    if (existingTicket) {
      return res
        .status(400)
        .send('Kursi telah dipesan. Silakan pilih kursi lain.');
    }

    const updateSelectedSeats = async () => {
      try {
        const response = await axios.put(`/movies/${id}/seats`, {
          seatNumbers,
        });

        if (response.status === 200) {
          console.log('Status kursi berhasil diperbarui');
        } else {
          console.error('Gagal memperbarui status kursi');
        }
      } catch (error) {
        console.error('Gagal memperbarui status kursi', error);
      }
    };

    movie.availableSeats = movie.availableSeats.filter(
      (seat) => !seatNumbers.includes(seat.toString())
    );

    movie.bookedSeats.push(...seatNumbers);

    await movie.save();

    const ticket = new Ticket({
      bookerName: name,
      movieTitle: movie.title,
      seatNumbers: seatNumbers,
      totalCost: movie.ticketPrice * seatNumbers.length,
      status: 'unpaid',
      movieId: id,
    });

    await ticket.save();

    await updateSelectedSeats();

    return res.redirect(
      `/movies/${id}/payment?seatNumbers=${JSON.stringify(
        seatNumbers
      )}&ticketId=${ticket._id}`
    );
  } catch (error) {
    console.error('Gagal memesan tiket', error);
    return res.status(500).send('Gagal memesan tiket');
  }
});

app.put('/movies/:id/seats', async (req, res) => {
  try {
    const { id } = req.params;
    const { seatNumbers } = req.body;

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).send('Film tidak ditemukan');
    }

    const updatedSeats = movie.availableSeats.filter(
      (seat) => !seatNumbers.includes(seat.toString())
    );

    movie.availableSeats = updatedSeats;

    await movie.save();

    return res.status(200).send('Status kursi berhasil diperbarui');
  } catch (error) {
    console.error('Gagal memperbarui status kursi', error);
    return res.status(500).send('Gagal memperbarui status kursi');
  }
});

app.get('/balance', async (req, res) => {
  try {
    const balance = await Balance.findOne().exec();
    if (!balance) {
      // Jika tidak ada saldo dalam database, buat saldo awal
      const initialBalance = new Balance({ balance: 0 });
      await initialBalance.save();
      res.render('balance', { balance: initialBalance });
    } else {
      res.render('balance', { balance });
    }
  } catch (error) {
    console.error('Gagal mengambil data saldo', error);
    res.status(500).send('Gagal mengambil data saldo');
  }
});

app.post('/balance/topup', async (req, res) => {
  try {
    const { amount } = req.body;

    const balance = await Balance.findOne();
    balance.balance += parseInt(amount);
    await balance.save();

    res.redirect('/balance');
  } catch (error) {
    console.error('Gagal melakukan top-up saldo', error);
    res.status(500).send('Gagal melakukan top-up saldo');
  }
});

app.post('/balance/withdraw', async (req, res) => {
  try {
    const { amount } = req.body;

    const withdrawalAmount = parseInt(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
      return res.status(400).send('Jumlah penarikan tidak valid');
    }

    const balance = await Balance.findOne();
    const currentBalance = balance.balance;
    const maxWithdrawalAmount = Math.min(currentBalance, 500000);

    if (withdrawalAmount > maxWithdrawalAmount) {
      return res
        .status(400)
        .send(
          `Jumlah penarikan melebihi batas maksimum (${maxWithdrawalAmount})`
        );
    }

    balance.balance -= withdrawalAmount;
    await balance.save();

    res.redirect('/balance');
  } catch (error) {
    console.error('Gagal melakukan penarikan saldo', error);
    res.status(500).send('Gagal melakukan penarikan saldo');
  }
});

app.get('/movies/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { seatNumbers } = req.query;

    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).send('Film tidak ditemukan');
    }

    const seatNumbersArray = JSON.parse(seatNumbers).map((seat) =>
      parseInt(seat.replace('seat-', ''), 10)
    );

    const totalCost = movie.ticketPrice * seatNumbersArray.length;

    const balance = await Balance.findOne().exec();
    if (!balance) {
      return res.status(404).send('Saldo tidak ditemukan');
    }

    const ticket = await Ticket.findOne({
      movieId: id,
      seatNumbers: { $in: seatNumbersArray },
    }).exec();

    if (!ticket) {
      return res.status(404).send('Tiket tidak ditemukan');
    }

    return res.render('payment', {
      movie,
      seatNumbers: seatNumbersArray,
      totalCost,
      balance,
      ticket,
    });
  } catch (error) {
    console.error('Gagal mengambil data film', error);
    return res.status(500).send('Gagal mengambil data film');
  }
});

app.post('/payment', async (req, res) => {
  try {
    const { seatNumbers, ticketId } = req.body;
    let seatNumbersArray;

    console.log('seatNumbers:', seatNumbers);
    console.log('ticketId:', ticketId);

    try {
      seatNumbersArray = JSON.parse(seatNumbers);
    } catch (error) {
      console.error('Error parsing seatNumbers:', error);
      return res.status(400).send('Format seatNumbers tidak valid');
    }

    const ticket = await Ticket.findOneAndUpdate(
      { _id: ticketId, seatNumbers: { $in: seatNumbersArray } },
      { $set: { status: 'paid' } },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).send('Tiket tidak ditemukan');
    }

    const movie = await Movie.findById(ticket.movieId).exec();

    if (!movie) {
      return res.status(404).send('Film tidak ditemukan');
    }

    const balance = await Balance.findOne().exec();

    if (!balance) {
      return res.status(404).send('Saldo tidak ditemukan');
    }

    if (balance.balance < ticket.totalCost) {
      return res.status(400).send('Saldo tidak mencukupi');
    }

    balance.balance -= ticket.totalCost;
    await balance.save();

    res.render('payment-success', {
      movie,
      seatNumbers: seatNumbersArray,
      totalCost: ticket.totalCost,
      balance,
    });
  } catch (error) {
    console.error('Gagal melakukan pembayaran', error);
    res.status(500).send('Gagal melakukan pembayaran');
  }
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
