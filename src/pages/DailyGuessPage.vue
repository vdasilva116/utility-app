<template>
  <q-page class="q-pa-md">
    <q-form @submit.prevent="submitGuess">
      <div class="row q-col-gutter-sm items-center q-mb-md sticky-bar">
        <div class="col">
          <q-input
            v-model="dailyGuess"
            label="Essayez une phrase"
            outlined
            dense
            :rules="[
              (val) =>
                val.split(' ').length === wordCount ||
                'La phrase doit contenir ' + wordCount + ' mots.',
            ]"
            :disable="hasGuessed"
          />
        </div>
        <div class="col-auto">
          <q-btn
            class="q-mb-md"
            label="Valider"
            type="submit"
            color="primary"
            :disable="hasGuessed"
          />
        </div>
      </div>
    </q-form>

    <div class="text-subtitle1 q-mb-md">
      Nombre de mots attendus : <strong>{{ wordCount }}</strong>
    </div>

    <q-banner v-if="hasGuessed" class="bg-grey-3 q-my-md">
      Vous avez déjà proposé une phrase pour aujourd’hui.
    </q-banner>

    <div v-if="guessHistory.length">
      <div class="text-h6 q-mb-sm">Historique de vos propositions</div>
      <q-list bordered separator>
        <q-item v-for="(guess, index) in guessHistory" :key="index">
          <q-item-section>
            <div
              :class="{
                'text-positive': guess.matched_count === wordCount,
                'text-weight-bold': guess.matched_count === wordCount,
              }"
            >
              {{ guess.guess }}
            </div>
            <div class="text-caption text-grey">
              📅 {{ guess.date }} — ✅ {{ guess.matched_count }} mot(s) correct(s)
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { supabase } from 'boot/supabase';
import { date } from 'quasar';

const today = date.formatDate(new Date(), 'YYYY-MM-DD');
const dailyGuess = ref('');
const guessHistory = ref<{ guess: string; date: string; matched_count: number }[]>([]);
const wordCount = ref(0);
const hasGuessed = ref(false);
const userId = ref<string | null>(null);

async function fetchDailyPhrase() {
  const { data } = await supabase.from('daily_phrase').select('phrase').eq('date', today).single();

  if (data?.phrase) {
    wordCount.value = data.phrase.trim().split(' ').length;
  } else {
    console.warn('Pas de phrase du jour trouvée.');
    wordCount.value = 0;
  }
}

async function fetchGuessHistory() {
  if (!userId.value) return;

  const { data, error } = await supabase
    .from('daily_guesses')
    .select('guess, date, matched_count')
    .eq('user_id', userId.value)
    .order('date', { ascending: false });

  if (data && !error) {
    guessHistory.value = data;
    hasGuessed.value = data.some((g) => g.date === today);
  }
}

async function submitGuess() {
  const trimmed = dailyGuess.value.trim();
  const guessWords = trimmed.toLowerCase().split(/\s+/);

  if (!trimmed || guessWords.length !== wordCount.value || !userId.value) return;

  const { data: phraseData } = await supabase
    .from('daily_phrase')
    .select('phrase')
    .eq('date', today)
    .single();

  if (!phraseData?.phrase) {
    alert('Phrase du jour introuvable.');
    return;
  }

  const targetWords = phraseData.phrase.toLowerCase().split(/\s+/);
  const matchedCount = guessWords.filter((word) => targetWords.includes(word)).length;

  const { error } = await supabase.from('daily_guesses').insert({
    user_id: userId.value,
    guess: trimmed,
    date: today,
    matched_count: matchedCount,
  });

  if (!error) {
    const isCorrect = matchedCount === wordCount.value;

    guessHistory.value.unshift({
      guess: trimmed,
      date: today,
      matched_count: matchedCount,
    });

    hasGuessed.value = true;
    dailyGuess.value = '';

    if (isCorrect) {
      alert('🎉 Félicitations ! Vous avez trouvé la phrase exacte.');
    }
  } else {
    alert('Erreur lors de l’enregistrement.');
  }
}

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  userId.value = user.id;

  await fetchDailyPhrase();
  await fetchGuessHistory();
});
</script>

<style scoped>
.text-h6 {
  font-weight: 600;
}

.sticky-bar {
  position: sticky;
  top: 55px;
  background: white;
  z-index: 100;
  padding: 1rem 0;
  border-bottom: 1px solid #ccc;
}
</style>
