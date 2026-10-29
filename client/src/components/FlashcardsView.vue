<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  cards: { type: Array, required: true },
});

const emit = defineEmits(['complete']);

const index = ref(0);
const flipped = ref(false);

const current = computed(() => props.cards[index.value]);
const total = computed(() => props.cards.length);

function flip() {
  flipped.value = !flipped.value;
}

function next() {
  if (index.value < total.value - 1) {
    index.value += 1;
    flipped.value = false;
  } else {
    emit('complete');
  }
}

function prev() {
  if (index.value > 0) {
    index.value -= 1;
    flipped.value = false;
  }
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <p class="text-sm text-soft/60">
        Kartu {{ index + 1 }} / {{ total }}
      </p>
      <button @click="flip" class="text-sm text-accent hover:underline">
        Balik kartu
      </button>
    </div>

    <div class="perspective-1000">
      <div
        class="relative h-80 cursor-pointer preserve-3d transition-transform duration-500"
        :class="{ 'rotate-y-180': flipped }"
        @click="flip"
      >
        <!-- Front: word -->
        <div class="absolute inset-0 backface-hidden bg-secondary rounded-2xl p-8 flex flex-col items-center justify-center text-center border border-secondary">
          <span class="text-soft/40 text-xs uppercase tracking-widest mb-3">Kata</span>
          <h2 class="text-4xl font-bold mb-3">{{ current.word }}</h2>
          <p class="text-accent text-lg">{{ current.phonetics }}</p>
          <p class="mt-6 text-soft/40 text-sm absolute bottom-6">Klik untuk melihat arti</p>
        </div>

        <!-- Back: translation + example -->
        <div class="absolute inset-0 backface-hidden rotate-y-180 bg-secondary rounded-2xl p-8 flex flex-col justify-center text-center border border-secondary">
          <span class="text-soft/40 text-xs uppercase tracking-widest mb-3">Arti</span>
          <h2 class="text-2xl font-bold mb-4">{{ current.translation }}</h2>
          <div class="mt-4 pt-4 border-t border-secondary">
            <p class="text-soft mb-1">{{ current.example_sentence }}</p>
            <p class="text-soft/50 text-sm italic">{{ current.example_translation }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-between gap-3">
      <button
        @click="prev"
        :disabled="index === 0"
        class="flex-1 border border-secondary text-soft rounded-xl px-4 py-3 font-medium transition hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Sebelumnya
      </button>
      <button
        @click="next"
        class="flex-1 bg-accent text-primary font-semibold rounded-xl px-4 py-3 transition hover:opacity-90"
      >
        {{ index === total - 1 ? 'Lanjut ke Kuis' : 'Berikutnya' }}
      </button>
    </div>
  </div>
</template>