import PouchDB from 'pouchdb-browser';

// Local-first database: everything is stored in the user's browser.
const db = new PouchDB('flipo_local_db');

// 1. Upsert user profile (Onboarding). Uses the fixed id 'user_profile'
//    so re-onboarding overwrites instead of creating duplicates.
export async function saveUserProfile(userName) {
  try {
    const existing = await db.get('user_profile').catch(() => null);
    const doc = existing
      ? { ...existing, name: userName, updatedAt: new Date().toISOString() }
      : {
          _id: 'user_profile',
          name: userName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
    await db.put(doc);
    return doc;
  } catch (err) {
    console.error('Gagal menyimpan profil:', err);
    throw err;
  }
}

export async function getUserProfile() {
  try {
    return await db.get('user_profile');
  } catch (err) {
    // Not found → no profile yet.
    return null;
  }
}

// 2. Save quiz result & score (after finishing a quiz).
export async function saveQuizResult(score, correctCount, wrongCount, wordsToReview) {
  try {
    const resultDoc = {
      _id: `result_${new Date().getTime()}`,
      type: 'history',
      score,
      correct: correctCount,
      wrong: wrongCount,
      needs_review: wordsToReview || [], // words answered incorrectly
      date: new Date().toISOString(),
    };
    await db.put(resultDoc);
    return resultDoc;
  } catch (err) {
    console.error('Gagal menyimpan riwayat:', err);
    throw err;
  }
}

// 3. Fetch all quiz history, newest first.
export async function getQuizHistory() {
  try {
    const result = await db.allDocs({
      include_docs: true,
      startkey: 'result_￿',
      endkey: 'result_',
      descending: true,
    });
    return result.rows
      .map((row) => row.doc)
      .filter((doc) => doc.type === 'history');
  } catch (err) {
    console.error('Gagal mengambil riwayat:', err);
    return [];
  }
}

export default db;