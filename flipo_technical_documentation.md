# FLIPO - Study-Flashcard Generator AI

**Dokumentasi Teknis & Panduan Implementasi**

## 1. Konsep Aplikasi

**FLIPO** adalah aplikasi pembuat flashcard dan kuis interaktif berbasis AI yang dirancang untuk membantu pengguna belajar bahasa (Inggris & Mandarin) sesuai dengan tingkat kemampuan dan tujuan spesifik mereka.

## 2. Arsitektur Sistem (Local-First Architecture)

Aplikasi ini menggunakan pendekatan *Local-First* di mana tidak ada data riwayat pengguna yang disimpan di server eksternal, melainkan langsung di browser pengguna menggunakan PouchDB.

* **Frontend:** Vue.js + Tailwind CSS (Menangani UI/UX, animasi flip, logika kuis, penyimpanan lokal).
* **Database:** PouchDB (Penyimpanan lokal di sisi *client* untuk nama pengguna, skor, dan riwayat belajar).
* **Backend (Proxy):** Node.js + Express.js (Hanya bertindak sebagai perantara untuk menyembunyikan API Key).
* **AI Model:** DeepSeek-V4-Pro-0813 (Digunakan untuk men-generate JSON terstruktur berisi flashcard dan kuis).

## 3. System Prompt (AI Prompt Engineering)

Gunakan prompt ini di backend Express.js untuk memastikan DeepSeek mengembalikan format JSON yang valid tanpa teks tambahan.

```text
Kamu adalah FLIPO, AI Tutor bahasa yang ahli. Tugasmu adalah membuat materi pembelajaran dalam format JSON yang ketat.
Jangan berikan teks apapun sebelum atau sesudah blok JSON. Hanya kembalikan output JSON yang valid.

Parameter Pembelajaran:
- Bahasa: {Bahasa}
- Level: {Level}
- Tujuan/Konteks: {Tujuan}

Buatkan 5 flashcard dan 3 pertanyaan kuis interaktif berdasarkan konteks di atas.

Struktur JSON yang WAJIB kamu ikuti:
{
  "flashcards": [
    {
      "id": "1",
      "word": "[Kata dalam karakter/tulisan asli]",
      "phonetics": "[Pinyin untuk Mandarin atau cara baca/fonetik untuk English]",
      "translation": "[Terjemahan Bahasa Indonesia]",
      "example_sentence": "[Contoh kalimat yang natural sesuai konteks]",
      "example_translation": "[Terjemahan contoh kalimat]"
    }
  ],
  "quiz": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "[Pertanyaan menebak arti atau melengkapi kalimat]",
      "options": ["[Opsi A]", "[Opsi B]", "[Opsi C]", "[Opsi D]"],
      "correct_answer": "[Jawaban yang benar dari salah satu opsi]"
    },
    {
      "id": "q2",
      "type": "typing",
      "question": "Ketik terjemahan dari kata berikut: '[Kata/Kalimat]'",
      "correct_answer": "[Jawaban teks yang diharapkan]"
    }
  ]
}
```

## 4. Implementasi Frontend (Vue.js + PouchDB)

Kode berikut adalah gambaran fungsi penyimpanan lokal untuk profil dan histori kuis di sisi Vue.js.

```javascript
// Install library: npm install pouchdb
import PouchDB from 'pouchdb';

// Inisialisasi Database Lokal
const db = new PouchDB('flipo_local_db');

// 1. Simpan Profil User (Onboarding)
export async function saveUserProfile(userName) {
  try {
    await db.put({
      _id: 'user_profile',
      name: userName,
      createdAt: new Date().toISOString()
    });
    console.log('Profil berhasil disimpan secara lokal');
  } catch (err) {
    console.error('Gagal menyimpan profil:', err);
  }
}

// 2. Simpan Riwayat Kuis & Skor (Selesai Kuis)
export async function saveQuizResult(score, correctCount, wrongCount, wordsToReview) {
  try {
    const resultDoc = {
      _id: `result_${new Date().getTime()}`,
      type: 'history',
      score: score,
      correct: correctCount,
      wrong: wrongCount,
      needs_review: wordsToReview, // Array kosakata yang salah dijawab
      date: new Date().toISOString()
    };
    await db.put(resultDoc);
    console.log('Riwayat kuis berhasil disimpan');
  } catch (err) {
    console.error('Gagal menyimpan riwayat:', err);
  }
}
```

## 5. Implementasi Backend (Node.js + Express.js)

Backend ringan ini berfungsi menjembatani Frontend Vue.js dengan API DeepSeek.

```javascript
// Install library: npm install express cors axios
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "API_KEY_ANDA_DISINI";

app.post('/api/generate-lesson', async (req, res) => {
    const { language, level, goal } = req.body;
    
    const systemPrompt = `... (Masukkan system prompt lengkap di sini) ...`;
    const userPrompt = `Bahasa: ${language}, Level: ${level}, Tujuan: ${goal}`;

    try {
        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
            model: "deepseek-v4-pro-0813",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" } // Memaksa output menjadi JSON
        }, {
            headers: {
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const aiData = JSON.parse(response.data.choices[0].message.content);
        res.json(aiData);

    } catch (error) {
        console.error("Error memanggil API DeepSeek:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Gagal menghasilkan materi pembelajaran" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FLIPO Backend Proxy berjalan di http://localhost:${PORT}`));
```

## 6. UI/UX & Tailwind Color Palette

Implementasikan warna berikut di class Tailwind Vue.js Anda:
* **Primary (Background Utama):** `bg-[#101211]` - Hitam pekat agar tidak menyilaukan mata.
* **Secondary (Kartu & Panel):** `bg-[#282D2A]` - Abu-abu gelap untuk membedakan elemen dari background.
* **Accent (CTA & Highlight):** `text-[#A3FF63] bg-[#A3FF63] border-[#A3FF63]` - Hijau Neon untuk tombol utama, progress bar, dan skor akhir.
* **Text (Teks Utama & Judul):** `text-[#F3F5F2]` - Putih pudar agar nyaman dibaca (Off White).

## 7. Development Docker (Node.js Slim)

Untuk kemudahan pengembangan, kita menggunakan Docker dengan base image `node:20-slim`. Image ini jauh lebih ringan dari standard image dan sudah cukup untuk menjalankan Vue dan Express.

### Struktur Folder
Pastikan struktur folder Anda seperti ini sebelum menjalankan Docker:
```text
/flipo-project
  /frontend (Kode Vue.js)
  /backend (Kode Express.js)
  docker-compose.yml
```

### 7.1. Dockerfile untuk Backend (`/backend/Dockerfile`)
Buat file bernama `Dockerfile` di dalam folder `backend/`:
```dockerfile
# Gunakan slim image Node.js
FROM node:20-slim

WORKDIR /app

# Copy package.json dan install dependency
COPY package*.json ./
RUN npm install

# Copy seluruh source code
COPY . .

EXPOSE 3000

# Jalankan server (pastikan ada script "dev": "nodemon index.js" di package.json)
CMD ["npm", "run", "dev"]
```

### 7.2. Dockerfile untuk Frontend (`/frontend/Dockerfile`)
Buat file bernama `Dockerfile` di dalam folder `frontend/`:
```dockerfile
# Gunakan slim image Node.js
FROM node:20-slim

WORKDIR /app

# Copy package.json dan install dependency
COPY package*.json ./
RUN npm install

# Copy seluruh source code
COPY . .

# Port default Vite/Vue
EXPOSE 5173 

# Jalankan vite dev server
CMD ["npm", "run", "dev"]
```

### 7.3. Konfigurasi `docker-compose.yml`
Buat file `docker-compose.yml` di *root* folder proyek:
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
    ports:
      - "3000:3000"
    volumes:
      # Mount folder backend untuk Hot-Reloading tanpa perlu rebuild image
      - ./backend:/app
      # Hindari menimpa node_modules di dalam container dengan folder host
      - /app/node_modules
    environment:
      - PORT=3000
      - DEEPSEEK_API_KEY=API_KEY_ANDA_DISINI # Ganti saat development

  frontend:
    build:
      context: ./frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      # Dibutuhkan oleh Vite agar mendeteksi perubahan file di dalam Docker (Hot-Reload)
      - CHOKIDAR_USEPOLLING=true 
```

### 7.4. Cara Menjalankan
Buka terminal di *root* folder dan ketikkan perintah berikut:
```bash
# Untuk menjalankan container di background
docker-compose up -d

# Untuk melihat log jika ada error
docker-compose logs -f
```
Aplikasi Anda kini bisa diakses di:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`