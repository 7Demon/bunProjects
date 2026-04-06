# RESTful API dengan ElysiaJS, Bun, dan Drizzle ORM

Proyek ini adalah backend RESTful API modern yang dibangun menggunakan ekosistem terbaru Javascript tingkat server, mengutamakan performa tinggi dan _Developer Experience_ (DX) yang luar biasa.

Proyek ini dirancang agar mudah dibaca dan diekstensikan, sehingga cocok untuk dipelajari oleh *Junior Programmer* yang ingin memahami konsep backend modern.

---

## 🛠️ Stack Teknologi (Tech Stack)

Backend ini menggunakan _tools_ yang sangat cepat dan ringan:

- **[Bun](https://bun.sh/)**: Runtime JavaScript (pengganti Node.js) sekaligus Package Manager. Sangat cepat dan sudah mendukung TypeScript/ESModules secara *native*.
- **[ElysiaJS](https://elysiajs.com/)**: Framework web untuk Bun. Sangat ringan, cepat, dan memiliki _Type Inference_ yang hebat. Berperan seperti ExpressJS tapi jauh lebih modern.
- **[Drizzle ORM](https://orm.drizzle.team/)**: _Object Relational Mapper_ (ORM) yang ramah TypeScript dan sangat SQL-like. Digunakan untuk berinteraksi dengan database tanpa perlu menulis kueri SQL mentah.
- **MySQL**: Sistem manajemen database relasional (RDBMS) yang digunakan untuk menyimpan data.

---

## 🏗️ Arsitektur Proyek

Proyek ini menggunakan pola **Route-Service-Repository** (disesuaikan untuk skalabilitas ringan). Tujuan dari pemisahan ini adalah menjaga agar kode tetap rapi (*Clean Code*).

```text
bunProjects/
├── src/
│   ├── db/
│   │   ├── index.js      # Konfigurasi koneksi database MySQL & Drizzle
│   │   └── schema.js     # Definisi struktur tabel database (Users & Sessions)
│   ├── routes/
│   │   └── users-route.js # Menangani HTTP Request, Header, Middleware (Elysia)
│   ├── services/
│   │   └── users-service.js # Logika bisnis (Validasi, Login, Hapus, dll)
│   └── index.js          # Entry point utama, inisialisasi App dan Error Handler
├── tests/
│   └── users.test.js     # Integrasi testing (Bun Test)
├── drizzle/              # Folder hasil generate migrasi database otomatis
├── .env                  # Environment Variables (koneksi & kredensial)
└── package.json          # List dependensi dan script
```

### Konsep Pemisahan:
1. **Routes (`src/routes`)**: Hanya bertugas menerima *request* masuk (seperti dari Postman/Frontend), memecah parameter/body/header, lalu mengoperkannya ke *Service*. Route tidak boleh bicara langsung dengan Database.
2. **Services (`src/services`)**: Otak aplikasi. Logika bisnis berjalan di sini (misal mengecek apakah password benar, mengatur session). Service memanggil *Database/Drizzle* untuk mengambil atau memanipulasi data.
3. **Database Layer (`src/db`)**: Hanya mendefinisikan *schema* supaya selaras dengan struktur di MySQL.

---

## 🗄️ Struktur Database (Schema)

Terdapat dua tabel utama:
1. **`users`**: Menyimpan data profil (id, nama, email unik, dan _hashed_ password).
2. **`sessions`**: Menyimpan sesi bagi pengguna yang sedang _Login_ (id, token uuid, user_id).
    * _Catatan_: Tabel `sessions` memiliki relasi `ON DELETE CASCADE` ke `users`. Artinya, jika sebuah akun `User` dihapus, maka semua `Sessions` miliknya di database otomatis terhapus, sehingga kode backend tidak perlu susah-payah menghapus satu per satu.

---

## 🚀 Cara Menjalankan Proyek Secara Lokal

Ikuti langkah demi langkah ini untuk menjalankan aplikasi di komputermu:

### 1. Persiapan Basis
- Pastikan [Bun](https://bun.sh/) sudah ter-install di komputermu.
- Pastikan kamu memiliki server MySQL (misal dari XAMPP, Laragon, MySQL Workbench, atau Docker) yang sedang menyala.

### 2. Instalasi Dependensi
Buka terminal di root proyek folder ini dan jalankan:
```bash
bun install
```

### 3. Konfigurasi Environment Variable (`.env`)
Buat file bernama `.env` di root direktori (sejajar dengan package.json). Isi dengan string koneksi database MySQL milikmu:
```env
DATABASE_URL="mysql://root:password@localhost:3306/nama_database_kamu"
PORT=3000
```
*(Ganti `root`, `password`, dan `nama_database_kamu` sesuai keadaan MySQL-mu)*

### 4. Migrasi Database (Wajib)
Jalankan perintah ini agar Drizzle membuat tabel-tabel di MySQL kamu secara otomatis:
```bash
# Membuat file migrasi dari schema.js
bun run db:generate 

# Mengaplikasikan migrasi ke MySQL
bun run db:push
```

### 5. Jalankan Server Development 
```bash
bun run dev
```
Maka, `🦊 Elysia is running at localhost:3000` akan muncul d terminal. Servermu sudah aktif!

---

## 🧪 Testing (Pengujian Terotomatisasi)

Kami telah menyiapkan _Integration Testing_ untuk seluruh endpoint API. Test ini menguji apakah input, logika logika service, dan output ke database bekerja persis seperti yang direncakan.

Jalankan:
```bash
bun test
```
Kamu akan melihat centang hijau jika code berjalan sempurna!

---

## 📡 Daftar API yang Tersedia

Berikut endpoint yang bisa digunakan (misal via Postman). Base URL: `http://localhost:3000`

### 1. Register Akun
- **Endpoint:** `POST /api/users`
- **Tujuan:** Mendaftarkan pengguna baru ke database.
- **Body (JSON):**
  ```json
  {
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "rahasia_password"
  }
  ```

### 2. Login Akun (Buka Sesi)
- **Endpoint:** `POST /api/users/login`
- **Tujuan:** Verifikasi pengguna, dan mengembalikan string _Token Sesi_ yang digunakan akses API terbatas ke depannya.
- **Body (JSON):**
  ```json
  {
    "email": "johndoe@example.com",
    "password": "rahasia_password"
  }
  ```
- **Response Sukses:** Akan mendapat `{"data": "8df20b08-...-..."}` (Inilah bearernya).

### 3. Get All Users (Publik)
- **Endpoint:** `GET /api/users`
- **Tujuan:** Melihat daftar semua pengguna.

### 4. Get User By ID (Publik)
- **Endpoint:** `GET /api/users/:id`  (Ganti `:id` dengan angka, misal `/12`)
- **Tujuan:** Melihat spesifik pengguna.

### 5. Get Current Profil (🚨 Butuh Otorisasi Token)
- **Endpoint:** `GET /api/users/current`
- **Syarat Headers:** 
  - `Authorization`: `Bearer <TOKEN_HASIL_LOGIN>`
- **Tujuan:** Melihat profil yang sedang login berdasarkan input token.

### 6. Delete Akun Sendiri (🚨 Butuh Otorisasi Token)
- **Endpoint:** `DELETE /api/users/current`
- **Syarat Headers:** 
  - `Authorization`: `Bearer <TOKEN_HASIL_LOGIN>`
- **Tujuan:** Menghapus permanen anggota (user) juga melengserkan sesi di semua perangkat.
