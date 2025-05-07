<template>
  <q-page class="q-pa-md">
    <q-btn flat dense icon="arrow_back" label="Retour" @click="goBack" class="q-mb-md" />

    <q-input
      v-model="noteContent"
      filled
      type="textarea"
      autogrow
      placeholder="Commence à écrire ta note..."
      @keyup="saveNote"
    />

    <q-btn color="negative" label="Supprimer la note" flat class="q-mt-md" @click="deleteNote" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

interface Note {
  title: string;
  content: string;
}

const route = useRoute();
const router = useRouter();
const noteIndex = parseInt(route.params.index as string);
const noteContent = ref('');

const notes = ref<Note[]>([]);

onMounted(() => {
  const stored = localStorage.getItem('notes');
  try {
    const parsed = JSON.parse(stored || '[]');
    if (Array.isArray(parsed)) {
      notes.value = parsed;
      noteContent.value = parsed[noteIndex]?.content || '';
    }
  } catch {
    notes.value = [];
  }
});

function saveNote() {
  if (notes.value[noteIndex]) {
    notes.value[noteIndex].content = noteContent.value;
    localStorage.setItem('notes', JSON.stringify(notes.value));
  }
}

function deleteNote() {
  notes.value.splice(noteIndex, 1);
  localStorage.setItem('notes', JSON.stringify(notes.value));
  void router.push('/listnote');
}

function goBack() {
  void router.push('/listnote');
}
</script>

<style scoped>
.q-input {
  font-size: 16px;
}
</style>
