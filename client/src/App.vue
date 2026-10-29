<script setup>
import { ref, onMounted, computed } from 'vue';
import Onboarding from './components/Onboarding.vue';
import LessonSetup from './components/LessonSetup.vue';
import FlashcardsView from './components/FlashcardsView.vue';
import QuizView from './components/QuizView.vue';
import ResultView from './components/ResultView.vue';
import HistoryView from './components/HistoryView.vue';
import { getUserProfile } from './lib/db';

const view = ref('loading');
const user = ref(null);
const lesson = ref(null);
const quizResult = ref(null);

onMounted(async () => {
  user.value = await getUserProfile();
  view.value = user.value ? 'setup' : 'onboarding';
});

const title = computed(() => {
  switch (view.value) {
    case 'onboarding': return 'Selamat Datang';
    case 'setup': return 'Buat Materi Belajar';
    case 'flashcards': return 'Flashcards';
    case 'quiz': return 'Kuis';
    case 'result': return 'Hasil';
    case 'history': return 'Riwayat Belajar';
    default: return 'FLIPO';
  }
});

function handleProfileSaved(profile) {
  user.value = profile;
  view.value = 'setup';
}

function handleLessonGenerated(data) {
  lesson.value = data;
  view.value = 'flashcards';
}

function startQuiz() {
  view.value = 'quiz';
}

function handleQuizFinished(result) {
  quizResult.value = result;
  view.value = 'result';
}

function backToSetup() {
  lesson.value = null;
  quizResult.value = null;
  view.value = 'setup';
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-40 border-b border-secondary bg-primary/90 backdrop-blur">
      <div class="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="#282D2A" />
            <path d="M10 8 L24 16 L10 24 Z" fill="#A3FF63" />
          </svg>
          <span class="text-lg font-bold tracking-tight">FLIPO</span>
        </div>

        <div class="flex items-center gap-3">
          <span v-if="user" class="hidden sm:inline text-sm text-soft/60">
            Hi, {{ user.name }}
          </span>

          <nav class="flex items-center gap-1">
            <button
              @click="view = 'setup'"
              class="px-3 py-1.5 rounded-lg text-sm"
              :class="view === 'setup' ? 'bg-secondary text-accent' : 'text-soft/60 hover:text-soft'"
            >
              Belajar
            </button>
            <button
              @click="view = 'history'"
              class="px-3 py-1.5 rounded-lg text-sm"
              :class="view === 'history' ? 'bg-secondary text-accent' : 'text-soft/60 hover:text-soft'"
            >
              Riwayat
            </button>
          </nav>
        </div>
      </div>
    </header>

    <main class="flex-1 mx-auto w-full max-w-3xl px-4 py-8">
      <h1 v-if="view !== 'flashcards'" class="text-2xl font-bold mb-6">{{ title }}</h1>

      <Onboarding
        v-if="view === 'onboarding'"
        @saved="handleProfileSaved"
      />
      <LessonSetup
        v-else-if="view === 'setup'"
        @generated="handleLessonGenerated"
      />
      <FlashcardsView
        v-else-if="view === 'flashcards'"
        :cards="lesson.flashcards"
        @complete="startQuiz"
      />
      <QuizView
        v-else-if="view === 'quiz'"
        :questions="lesson.quiz"
        :flashcards="lesson.flashcards"
        @finished="handleQuizFinished"
      />
      <ResultView
        v-else-if="view === 'result'"
        :result="quizResult"
        @retake="startQuiz"
        @home="backToSetup"
      />
      <HistoryView
        v-else-if="view === 'history'"
        @home="backToSetup"
      />
    </main>

    <footer class="border-t border-secondary py-6 text-center text-xs text-soft/40">
      FLIPO · Study-Flashcard Generator AI · Data tersimpan lokal di browser Anda
    </footer>
  </div>
</template>