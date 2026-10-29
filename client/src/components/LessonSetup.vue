<script setup>
import { ref } from 'vue';
import { generateLesson } from '../lib/api';

const emit = defineEmits(['generated']);

const language = ref('English');
const level = ref('Beginner');
const goal = ref('');
const loading = ref(false);
const error = ref('');

const languages = [
  { value: 'English', label: 'English' },
  { value: 'Mandarin', label: 'Mandarin (中文)' },
];

const levels = ['Beginner', 'Intermediate', 'Advanced'];

async function onSubmit() {
  if (!goal.value.trim()) {
    error.value = 'Tolong tuliskan tujuan atau konteks belajarnya.';
    return;
  }
  error.value = '';
  loading.value = true;
  try {
    const data = await generateLesson({
      language: language.value,
      level: level.value,
      goal: goal.value.trim(),
    });
    emit('generated', data);
  } catch (err) {
    error.value = err.message || 'Gagal membuat materi. Coba lagi.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <div class="bg-secondary rounded-2xl p-8 border border-secondary">
      <h2 class="text-lg font-semibold mb-6">Apa yang ingin kamu pelajari hari ini?</h2>

      <form @submit.prevent="onSubmit" class="space-y-5">
        <div>
          <label class="block text-sm text-soft/60 mb-1.5">Bahasa</label>
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="lang in languages"
              :key="lang.value"
              type="button"
              @click="language = lang.value"
              class="rounded-xl px-4 py-3 text-sm font-medium border transition"
              :class="language === lang.value
                ? 'border-accent text-accent bg-primary'
                : 'border-secondary text-soft/60 hover:text-soft'"
            >
              {{ lang.label }}
            </button>
          </div>
        </div>

        <div>
          <label class="block text-sm text-soft/60 mb-1.5">Level</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="lvl in levels"
              :key="lvl"
              type="button"
              @click="level = lvl"
              class="rounded-full px-4 py-2 text-sm font-medium border transition"
              :class="level === lvl
                ? 'border-accent text-accent bg-primary'
                : 'border-secondary text-soft/60 hover:text-soft'"
            >
              {{ lvl }}
            </button>
          </div>
        </div>

        <div>
          <label for="goal" class="block text-sm text-soft/60 mb-1.5">
            Tujuan / Konteks
          </label>
          <textarea
            id="goal"
            v-model="goal"
            rows="3"
            placeholder="cth: percakapan sehari-hari saat traveling ke Beijing"
            class="w-full bg-primary border border-secondary rounded-xl px-4 py-3 text-soft placeholder:text-soft/30 resize-none focus:outline-none focus:border-accent"
          ></textarea>
        </div>

        <p v-if="error" class="text-sm text-red-400">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-accent text-primary font-semibold rounded-xl px-4 py-3 transition hover:opacity-90 disabled:opacity-50"
        >
          {{ loading ? 'AI sedang membuat materi...' : 'Generate Materi' }}
        </button>
      </form>
    </div>
  </div>
</template>