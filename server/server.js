import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

app.use(cors());
app.use(express.json());

const AI_API_URL = process.env.AI_API_URL;
const AI_API_KEY = process.env.AI_API_KEY;
const MODEL = process.env.AI_MODEL;

const SYSTEM_PROMPT = `Kamu adalah FLIPO, AI Tutor bahasa yang ahli. Tugasmu adalah membuat materi pembelajaran dalam format JSON yang ketat.
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
}`;

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/generate-lesson', async (req, res) => {
  const { language, level, goal } = req.body;

  if (!language || !level || !goal) {
    return res.status(400).json({ error: 'language, level, dan goal wajib diisi' });
  }

  if (!AI_API_KEY) {
    return res.status(500).json({ error: 'API key belum dikonfigurasi di server' });
  }

  if (!AI_API_URL) {
    return res.status(500).json({ error: 'Host API belum dikonfigurasi di server' });
  }

  if (!MODEL) {
    return res.status(500).json({ error: 'Model belum dikonfigurasi di server' });
  }

  const userPrompt = `Bahasa: ${language}, Level: ${level}, Tujuan: ${goal}`;

  try {
    const response = await axios.post(
      AI_API_URL,
      {
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          Authorization: `Bearer ${AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    const raw = response.data.choices?.[0]?.message?.content;
    if (!raw) {
      return res.status(502).json({ error: 'Respons AI kosong' });
    }

    const aiData = JSON.parse(raw);
    res.json(aiData);
  } catch (error) {
    const status = error.response?.status || 500;
    const detail = error.response?.data || error.message;
    console.error(
      `Error memanggil API (${AI_API_URL}, model ${MODEL}):`,
      JSON.stringify(detail, null, 2)
    );
    res.status(status).json({
      error:
        detail?.error?.message ||
        detail?.message ||
        'Gagal menghasilkan materi pembelajaran',
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FLIPO Backend Proxy berjalan di http://localhost:${PORT}`);
  console.log(`AI endpoint: ${AI_API_URL} · model: ${MODEL}`);
});