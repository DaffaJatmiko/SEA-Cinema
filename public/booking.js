document.addEventListener('DOMContentLoaded', () => {
  const seats = document.querySelectorAll('.seat');
  const selectedSeats = [];
  let reservedSeats = [];

  const isSeatBooked = (seatId) => {
    return reservedSeats.includes(seatId);
  };

  const isSeatSelected = (seatId) => {
    return selectedSeats.includes(seatId);
  };

  const initSelectedSeats = () => {
    const selectedSeatsInput = document.getElementById('selectedSeats');
    const seatsValue = selectedSeatsInput.value;

    if (seatsValue) {
      selectedSeats.push(...JSON.parse(seatsValue));
    }
  };

  const updateSeatStatus = () => {
    seats.forEach((seat) => {
      const seatId = seat.id;

      if (isSeatSelected(seatId)) {
        seat.classList.add('selected');
        seat.style.backgroundColor = 'red';
        seat.disabled = true;
      } else if (isSeatBooked(seatId)) {
        seat.classList.add('booked');
        seat.disabled = true;
      } else {
        seat.classList.remove('selected', 'booked');
        seat.style.backgroundColor = '';
        seat.disabled = selectedSeats.length >= 6;
      }
    });
  };

  const updateSelectedSeats = async () => {
    const movieIdInput = document.querySelector('input[name="movieId"]');
    const movieId = movieIdInput.value;

    const response = await fetch(`/movies/${movieId}/seats`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ seatNumbers: selectedSeats }),
    });

    if (response.ok) {
      console.log('Status kursi berhasil diperbarui');
    } else {
      console.error('Gagal memperbarui status kursi');
    }
  };

  const continueToPayment = async () => {
    if (selectedSeats.length === 0) {
      console.log('Silakan pilih kursi terlebih dahulu.');
    } else {
      const movieIdInput = document.querySelector('input[name="movieId"]');
      const movieId = movieIdInput.value;
      const url = `/movies/${movieId}/payment?seatNumbers=${JSON.stringify(
        selectedSeats
      )}`;

      await updateSelectedSeats();

      window.location.href = url;
    }
  };

  const fetchReservedSeats = async () => {
    try {
      const seatContainer = document.getElementById('seat-container');
      const movieIdInput = document.querySelector('input[name="movieId"]');
      const movieId = movieIdInput.value;

      if (!movieId || movieId.length !== 24) {
        console.error('ID film tidak valid');
        return;
      }

      const response = await fetch(`/movies/${movieId}/seats`);
      const data = await response.json();

      reservedSeats = data.reservedSeats;

      updateSeatStatus();
    } catch (error) {
      console.error('Gagal mengambil data kursi', error);
    }
  };

  initSelectedSeats();
  fetchReservedSeats();

  const continueToPaymentButton = document.getElementById(
    'continueToPaymentButton'
  );
  continueToPaymentButton.addEventListener('click', continueToPayment);

  seats.forEach((seat) => {
    seat.addEventListener('click', () => {
      const seatId = seat.id;

      if (isSeatSelected(seatId)) {
        const index = selectedSeats.indexOf(seatId);
        selectedSeats.splice(index, 1);
      } else if (isSeatBooked(seatId)) {
        console.log('Kursi ini telah dipesan. Silakan pilih kursi lain.');
      } else if (selectedSeats.length >= 6) {
        console.log('Anda hanya dapat memilih maksimal 6 kursi.');
      } else {
        selectedSeats.push(seatId);
      }

      updateSeatStatus();

      const selectedSeatsInput = document.getElementById('selectedSeats');
      selectedSeatsInput.value = JSON.stringify(selectedSeats);
    });
  });
});
