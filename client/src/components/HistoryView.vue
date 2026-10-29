<script setup>
import { ref, onMounted } from 'vue';
import { getQuizHistory } from '../lib/db';

const emit = defineEmits(['home']);

const history = ref([]);
const loading = ref(true);

function formatDate(iso) {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

onMounted(async () => {
  history.value = await getQuizHistory();
  loading.value = false;
});
</script>

<template>
  <div class="space-y-4">
    <p v-if="loading" class="text-soft/60 text-sm">Memuat riwayat...</p>

    <p v-else-if="!history.length" class="text-soft/60 text-sm">
      Belum ada riwayat. Mulai belajar dengan membuat materi baru!
      <button @click="emit('home')" class="text-accent hover:underline">Buat materi</button>
    </p>

    <ul v-else class="space-y-3">
      <li
        v-for="item in history"
        :key="item._id"
        class="bg-secondary rounded-xl p-4 flex items-center justify-between border border-secondary"
      >
        <div>
          <p class="font-semibold" :class="item.score >= 75 ? 'text-accent' : 'text-soft'">
            {{ item.score }}
          </p>
          <p class="text-xs text-soft/50 mt-0.5">{{ formatDate(item.date) }}</p>
        </div>
        <div class="text-right text-sm">
          <p class="text-soft/70">
            <span class="text-accent">{{ item.correct }}</span> benar ·
            <span class="text-red-400">{{ item.wrong }}</span> salah
          </p>
          <p v-if="item.needs_review?.length" class="text-soft/40 text-xs mt-0.5">
            {{ item.needs_review.length }} kata perlu diulang
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>