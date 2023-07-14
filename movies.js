const express = require('express');
const router = express.Router();
const axios = require('axios');
const Movie = require('./model/movieModel');

router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find();
    res.render('movies', { movies });
  } catch (error) {
    console.error('Gagal mengambil data movie', error);
    res.status(500).send('Gagal mengambil data movie');
  }
});

router.get('/fetchAndSaveMovies', async (req, res) => {
  try {
    const response = await axios.get(
      'https://seleksi-sea-2023.vercel.app/api/movies'
    );
    const movies = response.data;
    await Movie.deleteMany({});
    await Movie.insertMany(movies);
    console.log('Data movie berhasil disimpan di MongoDB');
    const savedMovies = await Movie.find();
    console.log('Data movie yang tersimpan:', savedMovies);
    res.redirect('/movies');
  } catch (error) {
    console.error('Gagal mengambil data movie', error);
    res.status(500).send('Gagal mengambil data movie');
  }
});

module.exports = router;
