# FLIPO — Study-Flashcard Generator AI

Aplikasi pembuat flashcard & kuis interaktif berbasis AI untuk belajar bahasa (Inggris & Mandarin), dengan arsitektur **local-first** (data tersimpan di browser via PouchDB).

## Struktur

```
client/   Vue 3 + Vite + Tailwind CSS (frontend)
server/   Node.js + Express (proxy untuk menyembunyikan API key DeepSeek)
```

## Prasyarat

- Node.js ≥ 18
- API key DeepSeek

## Menjalankan Backend

```bash
cd server
npm install
cp .env.example .env
# isi variabel berikut di file .env:
#   DEEPSEEK_API_KEY   (wajib)
#   DEEPSEEK_API_URL   (opsional — host/endpoint API)
#   DEEPSEEK_MODEL     (opsional — nama model)
npm run dev
```

Proxy berjalan di `http://localhost:3000`.

## Menjalankan Frontend

```bash
cd client
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173` (Vite mem-proxy `/api` ke backend di port 3000).

## Cara pakai

1. Isi nama (profil tersimpan lokal di browser).
2. Pilih bahasa, level, dan tulis tujuan belajarmu.
3. AI membuat 5 flashcard + 3 soal kuis.
4. Pelajari flashcard (klik untuk membalik), lalu jawab kuis.
5. Skor & riwayat tersimpan otomatis di PouchDB (`flipo_local_db`).