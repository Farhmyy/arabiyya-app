# Arabiyya App v2 — Design Spec
**Date:** 2026-05-30  
**Scope:** Auth (Google Login), Admin Dashboard + CMS, Mobile Responsive, Dark Mode

---

## 1. Overview

Menambahkan 4 fitur utama ke aplikasi pembelajaran bahasa Arab interaktif (BAB 3 "عيادة المريض") untuk MTs/SMP kelas 8:

1. **Autentikasi Gmail** — login siswa dengan Google, setup nickname, sinkronisasi progress ke cloud
2. **Dashboard Admin** — guru melihat progress semua siswa dan mengelola konten secara real-time
3. **Mobile Responsive** — viewport diperbaiki, layout adaptif untuk layar kecil
4. **Dark Mode** — toggle 🌙/☀️ di navbar, preferensi tersimpan di localStorage

---

## 2. Tech Stack Tambahan

| Layanan | Kegunaan |
|---|---|
| Firebase Authentication | Google Sign-In untuk siswa dan guru |
| Firebase Firestore | Database progress siswa + konten yang bisa diedit |
| Firebase Storage | Upload gambar untuk Mufrodat |
| Firebase SDK v9 (compat CDN) | Loaded via `<script>` tag, no build step |

Firebase project di-setup sekali oleh developer, konfigurasi disimpan di `js/firebase.js`.

---

## 3. Alur Pengguna

### 3.1 Siswa
1. Buka website → tampil **LoginScreen** (Hero kiri + Panel login kanan)
2. Klik "Masuk dengan Google" → Google OAuth popup
3. **Pertama kali:** diarahkan ke **NicknameScreen** untuk mengisi nama panggilan
4. Selanjutnya langsung ke HomeScreen dengan progress dari Firestore
5. Progress (XP, streak, chapter completion) tersimpan real-time ke Firestore

### 3.2 Tamu (tanpa login)
1. Buka website → klik "Lanjut tanpa akun" di LoginScreen
2. Langsung ke HomeScreen, progress tersimpan di **localStorage saja**
3. Progress tidak terlacak oleh guru, tidak sinkron antar device
4. Bisa login kapan saja — tapi progress tamu tidak dimigrasikan ke akun

### 3.3 Admin/Guru
1. Login dengan Gmail yang terdaftar sebagai admin di Firestore
2. `useAuth` mendeteksi role admin → diarahkan ke **AdminScreen** (bukan HomeScreen)
3. AdminScreen memiliki 4 tab: Ringkasan, Semua Siswa, Perlu Perhatian, Kelola Konten

---

## 4. Identifikasi Admin

Disimpan di Firestore: `admins/config` → field `emails: ["guru@gmail.com"]`

Saat login, `useAuth` hook mengecek apakah `currentUser.email` ada dalam array tersebut. Jika ya, `role = "admin"`. Penambahan/penghapusan admin dilakukan langsung di Firebase Console (tidak butuh UI khusus untuk skripsi ini).

---

## 5. Struktur Data Firestore

### `users/{uid}`
```
email:          string
nickname:       string
role:           "student"   // hanya siswa login yang disimpan; tamu tidak punya dokumen Firestore
createdAt:      timestamp
lastActiveDate: string (YYYY-MM-DD)
progress: {
  xp:     number
  streak: number
  chapters: {
    "3": {
      hiwar:      { completed: bool, score: number, maxScore: number }
      mufrodat:   { completed: bool, score: number, maxScore: number }
      tadribat_1: { completed: bool, score: number, maxScore: number }
      qawaid:     { completed: bool, score: number, maxScore: number }
      tadribat_2: { completed: bool, score: number, maxScore: number }
    }
  }
}
```

### `content/mufrodat`
```
words: [
  {
    id:       string
    arabic:   string
    meaning:  string
    example:  string   // kalimat contoh Arab
    image_url: string | null
  }
]
```

### `content/tadribat1`
```
questions: [ ...same structure as current DATA.chapters[3].tadribat_1.questions ]
```

### `content/tadribat2`
```
questions: [ ...same structure as current DATA.chapters[3].tadribat_2.questions ]
```

### `admins/config`
```
emails: ["guru@gmail.com"]
```

> **Phase 2 (tidak di skripsi ini):** `content/hiwar` dan `content/qawaid`

---

## 6. Firebase Storage

Path: `/mufrodat/{word_id}.{ext}`

Admin upload gambar via CMS → URL disimpan ke `content/mufrodat` di Firestore → app membaca URL tersebut saat render MufrodatScreen.

---

## 7. File Baru dan File yang Dimodifikasi

### File Baru
| File | Deskripsi |
|---|---|
| `js/firebase.js` | Inisialisasi Firebase app, export `auth`, `db`, `storage` |
| `js/hooks/useAuth.js` | Hook: `currentUser`, `role`, `login()`, `logout()`, `loading` |
| `js/hooks/useCloudProgress.js` | Progress berbasis Firestore; fallback ke localStorage untuk tamu |
| `js/screens/LoginScreen.jsx` | Halaman login: Hero kiri (gradient + konten BAB 3) + Panel kanan (tombol Google + skip) |
| `js/screens/NicknameScreen.jsx` | Form nickname setelah login pertama kali |
| `js/screens/AdminScreen.jsx` | Dashboard admin dengan 4 tab |
| `css/dark.css` | Token warna dark mode via `[data-theme="dark"]` |

### File Dimodifikasi
| File | Perubahan |
|---|---|
| `index.html` | Viewport `width=1280` → `device-width,initial-scale=1`; tambah Firebase SDK + dark.css |
| `js/app.jsx` | Tambah auth state check; routing ke LoginScreen / NicknameScreen / AdminScreen; provide dark mode context |
| `js/hooks/useProgress.js` | Tidak dihapus — tetap dipakai untuk mode tamu (localStorage); `useCloudProgress` membungkusnya untuk siswa login |
| `css/tokens.css` | Tambah dark mode token overrides di `[data-theme="dark"]` |
| `css/base.css` | Perbaikan responsivitas: grid → single column mobile, navbar bottom mobile |
| `js/components/Navbar.jsx` | Tambah toggle dark mode (🌙/☀️) + info user login (avatar, nickname) |

---

## 8. Dashboard Admin — 4 Tab

### Tab 1: Ringkasan
- 4 stat card: Total Siswa, Aktif Hari Ini, Selesai Semua, Belum Mulai
- Progress bar per bagian (% siswa yang sudah complete tiap section)

### Tab 2: Semua Siswa
- Tabel: Nama/Nickname, Email, XP, Streak, status tiap section (✅/🔄/—), % overall
- Sortable by XP atau nama

### Tab 3: Perlu Perhatian
- Siswa yang: belum mulai sama sekali, atau streak = 0 lebih dari 3 hari, atau < 20% progress
- Untuk memudahkan guru follow-up

### Tab 4: Kelola Konten (CMS)
- Sub-tab: **Mufrodat** | **Tadribat 1** | **Tadribat 2**
- **Mufrodat**: Tabel daftar kata → tombol Edit (modal) → form field: arab, arti, contoh, upload gambar → Simpan → update Firestore + Storage
- **Tadribat 1 & 2**: Tabel daftar soal → tombol Edit → form field sesuai tipe soal → Simpan → update Firestore
- Tombol "+ Tambah" untuk menambah item baru
- Perubahan tersimpan ke Firestore; siswa melihat konten terbaru saat membuka layar (fetch on mount, bukan live-stream onSnapshot — cukup untuk skenario 1 kelas)

---

## 9. Mobile Responsive

- **Breakpoint utama:** 640px
- **Perubahan layout:**
  - Section cards dari grid 2-kolom → single column
  - LoginScreen: Hero + Panel dari side-by-side → stacked (panel di bawah hero)
  - AdminScreen: Tabel dengan horizontal scroll di mobile
  - Navbar desktop → Navbar bottom (ikon Home, Belajar, Profil) di ≤640px
- **Touch targets:** minimal 44×44px untuk semua tombol interaktif
- **Font sizes:** sudah ada override di `tokens.css @media (max-width: 640px)` — tidak perlu diubah

---

## 10. Dark Mode

- Toggle button di Navbar kanan atas (☀️ saat dark, 🌙 saat light)
- Class `data-theme="dark"` ditambahkan ke `<html>` element
- Preferensi disimpan di `localStorage` key `arabiyya_theme`
- `css/dark.css` mendefinisikan override token:
  - `--color-bg` → `#0f172a`
  - `--color-surface` → `#1e293b`
  - `--color-text-primary` → `#e2e8f0`
  - `--color-border` → `#334155`
  - `--color-primary` → `#5eead4` (teal lebih terang untuk kontras)
  - dll.

---

## 11. Scope Batasan

- **Phase 1 (spec ini):** Auth + progress cloud + admin dashboard + CMS Mufrodat/Tadribat + mobile + dark mode
- **Phase 2 (di luar skripsi):** CMS untuk Hiwar dan Qawaid, export laporan nilai, notifikasi
- **Tidak ada** password reset, email/password login, atau registrasi manual — hanya Google Sign-In
- **Tidak ada** backend server — seluruhnya Firebase (BaaS)
- Progress tamu **tidak dimigrasikan** ke akun saat login

---

## 12. Inisialisasi Data

Saat deployment pertama, konten dari `js/data.js` perlu di-seed ke Firestore (`content/mufrodat`, `content/tadribat1`, `content/tadribat2`). Ini dilakukan sekali via script atau Firebase Console.

App membaca Mufrodat/Tadribat dari Firestore. `data.js` tetap dipertahankan untuk konten yang belum di-CMS-kan (Hiwar, Qawaid, UI strings) dan sebagai referensi seed — bukan runtime fallback jaringan.
