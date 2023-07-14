# Sea Cinema

Sea Cinema adalah sebuah aplikasi pemesanan tiket bioskop yang memungkinkan pengguna untuk melihat daftar film yang tersedia, memilih kursi, melakukan pembayaran, dan melihat riwayat transaksi. Aplikasi ini menggunakan konsep CRUD (Create, Read, Update, Delete) untuk mengelola data film, kursi, dan transaksi.

## Teknologi yang Digunakan

Aplikasi Sea Cinema dibangun menggunakan teknologi berikut:

- Node.js: untuk menjalankan sisi server aplikasi
- Express.js: sebagai kerangka kerja (framework) aplikasi web pada sisi server
- MongoDB: sebagai database untuk menyimpan data film, kursi, dan transaksi
- HTML, CSS, dan JavaScript: untuk mengembangkan antarmuka pengguna

## Panduan Pemasangan dan Menjalankan Proyek

Berikut ini adalah langkah-langkah untuk menginstal dan menjalankan proyek ini di lingkungan lokal Anda:

1. Pastikan Anda memiliki Node.js dan MongoDB terpasang di komputer Anda.
2. Clone repositori ini ke komputer lokal Anda.
3. Buka terminal dan arahkan ke direktori proyek.
4. Jalankan perintah `npm install` untuk menginstal semua dependensi yang diperlukan.
5. Buat file `.env` berdasarkan contoh `.env.example` dan sesuaikan konfigurasi sesuai kebutuhan Anda.
6. Jalankan perintah `npm start` untuk menjalankan aplikasi.
7. Buka browser dan akses http://localhost:3000 untuk melihat aplikasi Sea Cinema.

## Instruksi Penggunaan Aplikasi

Berikut adalah langkah-langkah untuk menggunakan aplikasi Sea Cinema:

1. Buka aplikasi Sea Cinema di browser.
2. Telusuri daftar film yang tersedia dan klik tombol "Book Now" untuk memesan tiket.
3. Pilih kursi yang tersedia dan isi informasi yang diminta (nama, usia).
4. Setelah memilih kursi, klik tombol "Confirm Booking" untuk mengonfirmasi pemesanan.
5. Lanjutkan ke halaman pembayaran untuk menyelesaikan transaksi.
6. Setelah pembayaran berhasil, Anda akan melihat halaman "Pembayaran Berhasil" dengan informasi tiket dan saldo terbaru.
7. Anda juga dapat mengakses halaman "Saldo" untuk melihat saldo Anda dan melakukan top-up atau penarikan saldo.

## Catatan

Aplikasi Sea Cinema masih dalam tahap pengembangan aktif. Beberapa fitur mungkin belum lengkap atau dapat ditingkatkan. Kami terus melakukan perbaikan dan peningkatan untuk memberikan pengalaman terbaik kepada pengguna.
