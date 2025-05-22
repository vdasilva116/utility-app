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
      <q-item v-for="note in notes" :key="note.id" clickable @click="editNote(note.id)">
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from 'boot/supabase';

interface Note {
  id: string;
  title: string;
  content: string;
}

const notes = ref<Note[]>([]);
const newNoteTitle = ref('');
const router = useRouter();

function editNote(id: string) {
  void router.push(`/note/${id}`);
}

async function loadNotes() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', user.id)
    .order('id', { ascending: false });

  if (!error && data) {
    notes.value = data;
  }
}

async function createNote() {
  const title = newNoteTitle.value.trim();
  if (!title) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('notes')
    .insert([{ user_id: user.id, title, content: '' }])
    .select()
    .single();

  if (!error && data) {
    notes.value.unshift(data);
    newNoteTitle.value = '';
    void router.push(`/note/${data.id}`);
  }
}

onMounted(() => {
  void loadNotes();
});
</script>

<style scoped>
.q-item {
  cursor: pointer;
}
</style>
