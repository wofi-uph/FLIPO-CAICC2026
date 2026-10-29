<script setup>
import { ref } from 'vue';
import { saveUserProfile } from '../lib/db';

const emit = defineEmits(['saved']);

const name = ref('');
const saving = ref(false);
const error = ref('');

async function onSubmit() {
  if (!name.value.trim()) {
    error.value = 'Tolong isi namamu dulu.';
    return;
  }
  error.value = '';
  saving.value = true;
  try {
    const profile = await saveUserProfile(name.value.trim());
    emit('saved', profile);
  } catch {
    error.value = 'Gagal menyimpan profil. Coba lagi.';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <div class="bg-secondary rounded-2xl p-8 border border-secondary">
      <div class="text-4xl mb-3">👋</div>
      <h2 class="text-xl font-semibold mb-2">Kenalan dulu, yuk!</h2>
      <p class="text-soft/60 text-sm mb-6">
        Masukkan namamu. Profil ini hanya disimpan di browser-mu saja — bukan di server.
      </p>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <div>
          <label for="name" class="block text-sm text-soft/60 mb-1.5">Nama kamu</label>
          <input
            id="name"
            v-model="name"
            type="text"
            autocomplete="nickname"
            placeholder="cth: Dinda"
            class="w-full bg-primary border border-secondary rounded-xl px-4 py-3 text-soft placeholder:text-soft/30 focus:outline-none focus:border-accent"
          />
        </div>

        <p v-if="error" class="text-sm text-red-400">{{ error }}</p>

        <button
          type="submit"
          :disabled="saving"
          class="w-full bg-accent text-primary font-semibold rounded-xl px-4 py-3 transition hover:opacity-90 disabled:opacity-50"
        >
          {{ saving ? 'Menyimpan...' : 'Mulai Belajar' }}
        </button>
      </form>
    </div>
  </div>
</template>