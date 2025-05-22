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
import { supabase } from 'boot/supabase';

const route = useRoute();
const router = useRouter();
const noteId = route.params.id as string;
const noteContent = ref('');
const noteTitle = ref('');

function goBack() {
  void router.push('/listnote');
}

async function fetchNote() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  noteContent.value = data.content || '';
  noteTitle.value = data.title || '';
}

async function saveNote() {
  const { error } = await supabase
    .from('notes')
    .update({ content: noteContent.value })
    .eq('id', noteId);

  if (error) {
    console.error('Erreur sauvegarde note :', error);
  }
}

async function deleteNote() {
  await supabase.from('notes').delete().eq('id', noteId);
  await router.push('/listnote');
}

onMounted(() => {
  void fetchNote();
});
</script>

<style scoped>
.q-input {
  font-size: 16px;
}
</style>
