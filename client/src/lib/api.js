// Proxy call to the Express backend, which hides the DeepSeek API key.
export async function generateLesson({ language, level, goal }) {
  const res = await fetch('/api/generate-lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, level, goal }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request gagal (${res.status})`);
  }

  return res.json();
}