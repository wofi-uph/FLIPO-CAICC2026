<script setup>
import { computed } from 'vue';

const props = defineProps({
  result: { type: Object, required: true },
});

const emit = defineEmits(['retake', 'home']);

const message = computed(() => {
  const { score } = props.result;
  if (score === 100) return 'Sempurna! 🎉';
  if (score >= 75) return 'Hebat! Terus pertahankan 👏';
  if (score >= 50) return 'Bagus! Sedikit lagi 💪';
  return 'Tetap semangat, kamu pasti bisa 🔥';
});
</script>

<template>
  <div class="max-w-md mx-auto space-y-6">
    <div class="bg-secondary rounded-2xl p-8 border border-secondary text-center">
      <p class="text-soft/60 text-sm mb-2">Skor Kamu</p>
      <p class="text-6xl font-bold text-accent">{{ result.score }}</p>
      <p class="text-soft/60 text-sm mt-1">dari 100</p>

      <p class="mt-6 text-lg font-medium">{{ message }}</p>

      <div class="grid grid-cols-2 gap-3 mt-8">
        <div class="bg-primary rounded-xl p-4">
          <p class="text-2xl font-bold text-accent">{{ result.correct }}</p>
          <p class="text-xs text-soft/60 mt-1">Benar</p>
        </div>
        <div class="bg-primary rounded-xl p-4">
          <p class="text-2xl font-bold text-red-400">{{ result.wrong }}</p>
          <p class="text-xs text-soft/60 mt-1">Salah</p>
        </div>
      </div>
    </div>

    <div v-if="result.needsReview.length" class="bg-secondary rounded-2xl p-6 border border-secondary">
      <h3 class="font-semibold mb-4 flex items-center gap-2">
        <span>📚</span> Perlu Diulang
      </h3>
      <ul class="space-y-3">
        <li v-for="item in result.needsReview" :key="item.answer" class="text-sm">
          <p class="text-soft/80">{{ item.question }}</p>
          <p class="text-accent mt-0.5">→ {{ item.answer }}</p>
        </li>
      </ul>
    </div>

    <div class="flex gap-3">
      <button
        @click="emit('home')"
        class="flex-1 border border-secondary text-soft rounded-xl px-4 py-3 font-medium transition hover:text-accent"
      >
        Materi Baru
      </button>
      <button
        @click="emit('retake')"
        class="flex-1 bg-accent text-primary font-semibold rounded-xl px-4 py-3 transition hover:opacity-90"
      >
        Ulangi Kuis
      </button>
    </div>
  </div>
</template>