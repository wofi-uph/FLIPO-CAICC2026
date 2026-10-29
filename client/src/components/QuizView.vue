<script setup>
import { ref, computed } from 'vue';
import { saveQuizResult } from '../lib/db';

const props = defineProps({
  questions: { type: Array, required: true },
  flashcards: { type: Array, required: true },
});

const emit = defineEmits(['finished']);

const index = ref(0);
const answers = ref([]); // per-question user answer
const typingInput = ref('');

const current = computed(() => props.questions[index.value]);
const total = computed(() => props.questions.length);
const isLast = computed(() => index.value === total.value - 1);

function selectOption(option) {
  if (answers.value[index.value] !== undefined) return; // already answered
  answers.value[index.value] = option;
}

function submitTyping() {
  const val = typingInput.value.trim();
  if (!val) return;
  answers.value[index.value] = val;
  typingInput.value = '';
}

function isCorrect(i) {
  const q = props.questions[i];
  const a = answers.value[i];
  if (a === undefined) return false;
  const expected = (q.correct_answer || '').trim().toLowerCase();
  const given = String(a).trim().toLowerCase();
  return expected === given;
}

function next() {
  if (!isLast.value) {
    index.value += 1;
  } else {
    finish();
  }
}

async function finish() {
  const correctCount = props.questions.filter((_, i) => isCorrect(i)).length;
  const wrongCount = total.value - correctCount;
  const score = Math.round((correctCount / total.value) * 100);

  // Words answered incorrectly → fixed flashcard vocabulary for review.
  const wordsToReview = props.questions
    .filter((_, i) => !isCorrect(i))
    .map((q) => ({
      question: q.question,
      answer: q.correct_answer,
    }));

  await saveQuizResult(score, correctCount, wrongCount, wordsToReview);

  emit('finished', {
    score,
    correct: correctCount,
    wrong: wrongCount,
    needsReview: wordsToReview,
    total: total.value,
  });
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <p class="text-sm text-soft/60">Pertanyaan {{ index + 1 }} / {{ total }}</p>
      <div class="flex gap-1">
        <span
          v-for="(_, i) in questions"
          :key="i"
          class="w-6 h-1.5 rounded-full"
          :class="answers[i] !== undefined ? 'bg-accent' : 'bg-secondary'"
        ></span>
      </div>
    </div>

    <div class="bg-secondary rounded-2xl p-8 border border-secondary">
      <p class="text-lg font-medium leading-relaxed">{{ current.question }}</p>

      <!-- Multiple choice -->
      <div v-if="current.type === 'multiple_choice'" class="mt-6 space-y-3">
        <button
          v-for="option in current.options"
          :key="option"
          @click="selectOption(option)"
          :disabled="answers[index] !== undefined"
          class="w-full text-left border rounded-xl px-4 py-3 transition disabled:cursor-default"
          :class="answers[index] === option
            ? 'border-accent bg-primary text-accent'
            : 'border-secondary text-soft hover:border-accent/50'"
        >
          {{ option }}
        </button>
      </div>

      <!-- Typing -->
      <div v-else class="mt-6">
        <div class="flex gap-2">
          <input
            v-model="typingInput"
            type="text"
            placeholder="Ketik jawabanmu..."
            :disabled="answers[index] !== undefined"
            @keyup.enter="submitTyping"
            class="flex-1 bg-primary border border-secondary rounded-xl px-4 py-3 text-soft placeholder:text-soft/30 focus:outline-none focus:border-accent disabled:opacity-50"
          />
          <button
            @click="submitTyping"
            :disabled="answers[index] !== undefined || !typingInput.trim()"
            class="bg-accent text-primary font-semibold rounded-xl px-5 py-3 transition hover:opacity-90 disabled:opacity-40"
          >
            Jawab
          </button>
        </div>
      </div>

      <!-- Feedback -->
      <div
        v-if="answers[index] !== undefined"
        class="mt-6 pt-4 border-t border-secondary flex items-center gap-2"
      >
        <span v-if="isCorrect(index)" class="text-accent font-medium">✓ Benar!</span>
        <span v-else class="text-red-400 font-medium">✗ Jawaban benar: {{ current.correct_answer }}</span>
      </div>
    </div>

    <div class="flex justify-end">
      <button
        @click="next"
        :disabled="answers[index] === undefined"
        class="bg-accent text-primary font-semibold rounded-xl px-6 py-3 transition hover:opacity-90 disabled:opacity-40"
      >
        {{ isLast ? 'Lihat Hasil' : 'Berikutnya' }}
      </button>
    </div>
  </div>
</template>