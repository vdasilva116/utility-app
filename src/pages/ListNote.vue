<template>
  <q-page class="q-pa-md">
    <div class="row items-end q-gutter-sm q-mb-md">
      <q-input
        v-model="newNoteTitle"
        label="Titre de la note"
        outlined
        class="col"
        dense
        @keyup.enter="createNote"
      />
      <q-btn label="Ajouter" color="primary" @click="createNote" />
    </div>

    <q-list bordered separator>
      <q-item v-for="(note, index) in notes" :key="index" clickable @click="editNote(index)">
        <q-item-section>
          {{ note.title || '(Note sans titre)' }}
        </q-item-section>
        <q-item-section side>
          <q-icon name="chevron_right" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

interface Note {
  title: string;
  content: string;
}

const stored = localStorage.getItem('notes');
let parsed: Note[] = [];

try {
  parsed = JSON.parse(stored || '[]');
  if (!Array.isArray(parsed) || !parsed.every((n) => 'title' in n && 'content' in n)) {
    parsed = [];
  }
} catch {
  parsed = [];
}

const notes = ref<Note[]>(parsed);
const newNoteTitle = ref('');
const router = useRouter();

function createNote() {
  const title = newNoteTitle.value.trim();
  if (!title) return;
  notes.value.unshift({ title, content: '' });
  newNoteTitle.value = '';
  localStorage.setItem('notes', JSON.stringify(notes.value));
}

function editNote(index: number) {
  void router.push(`/notepad/${index}`);
}

watch(
  notes,
  (val) => {
    localStorage.setItem('notes', JSON.stringify(val));
  },
  { deep: true },
);
</script>

<style scoped>
.q-item {
  cursor: pointer;
}
</style>
