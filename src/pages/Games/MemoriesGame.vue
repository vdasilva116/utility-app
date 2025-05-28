<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md q-gutter-md justify-center">
      <div class="col-12 col-md-8 column items-center">
        <div class="row items-center justify-between full-width q-mb-sm">
          <div class="text-h5">🧠 Jeu de Memory</div>
          <q-btn label="Relancer" color="secondary" @click="resetGame" />
        </div>

        <div class="text-caption q-mb-md">Temps : {{ elapsedSeconds }}s</div>

        <div class="row q-gutter-sm justify-center" style="max-width: 400px">
          <q-btn
            v-for="(card, index) in displayedCards"
            :key="index"
            class="memory-card"
            @click="flipCard(index)"
            :disable="matched[index] || flippedIndices.includes(index)"
          >
            <span class="text-h4">
              {{ matched[index] || flippedIndices.includes(index) ? card : '❓' }}
            </span>
          </q-btn>
        </div>

        <div v-if="allMatched" class="q-mt-lg text-positive text-center">
          🎉 Bravo ! Tu as tout trouvé en {{ moves }} coups et {{ elapsedSeconds }}s !
          <q-input v-model="playerName" label="Ton nom" class="q-mt-md" outlined dense />
          <q-btn label="Enregistrer" color="primary" class="q-mt-sm" @click="saveScore" />
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="text-h6 text-center">🏆 Meilleurs scores</div>
        <q-list bordered separator class="q-mt-sm score-list">
          <q-item v-for="(s, i) in leaderboard" :key="i">
            <q-item-section>{{ s.name }}</q-item-section>
            <q-item-section class="text-right">
              {{ s.moves }} coups - {{ s.time }}s
            </q-item-section>
          </q-item>
        </q-list>
        <q-btn
          flat
          label="Reset scores"
          color="negative"
          class="q-mt-sm full-width"
          @click="clearLeaderboard"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { supabase } from 'boot/supabase';

interface ScoreEntry {
  name: string;
  moves: number;
  time: number;
}

const rawCards = ['🐶', '🐱', '🦊', '🐻', '🐼', '🐸', '🐵', '🐔', '🐷', '🐮', '🐯', '🦁'];
const displayedCards = ref<string[]>([]);
const matched = ref<boolean[]>([]);
const flippedIndices = ref<number[]>([]);
const moves = ref(0);
const startTime = ref<number>(0);
const elapsedSeconds = ref(0);
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null);
const gameFinished = ref(false);
const playerName = ref('');
const leaderboard = ref<ScoreEntry[]>([]);
const allMatched = computed(() => matched.value.every((v) => v));

function shuffle() {
  const all = [...rawCards, ...rawCards];
  return all.sort(() => 0.5 - Math.random());
}

function startGame() {
  displayedCards.value = shuffle();
  matched.value = Array(displayedCards.value.length).fill(false);
  flippedIndices.value = [];
  moves.value = 0;
  elapsedSeconds.value = 0;
  gameFinished.value = false;
  startTime.value = Date.now();
  if (timerInterval.value) clearInterval(timerInterval.value);
  timerInterval.value = setInterval(() => {
    elapsedSeconds.value = Math.floor((Date.now() - startTime.value) / 1000);
  }, 1000);
}

function flipCard(index: number) {
  if (flippedIndices.value.length >= 2 || flippedIndices.value.includes(index)) return;
  flippedIndices.value.push(index);

  if (flippedIndices.value.length === 2) {
    moves.value++;
    const [i1, i2] = flippedIndices.value;
    if (
      i1 !== undefined &&
      i2 !== undefined &&
      displayedCards.value[i1] === displayedCards.value[i2]
    ) {
      matched.value[i1] = true;
      matched.value[i2] = true;
      flippedIndices.value = [];
    } else {
      setTimeout(() => {
        flippedIndices.value = [];
      }, 800);
    }
  }

  if (allMatched.value && !gameFinished.value) {
    gameFinished.value = true;
    clearInterval(timerInterval.value!);
  }
}

function resetGame() {
  playerName.value = '';
  startGame();
}

async function saveScore() {
  if (!playerName.value.trim() || !userId.value) return;

  const { error } = await supabase.from('scores_memory').insert({
    name: playerName.value.trim(),
    moves: moves.value,
    time: elapsedSeconds.value,
    user_id: userId.value,
  });

  if (error) {
    console.error('Erreur enregistrement score memory', error);
  }

  await fetchLeaderboard();
  resetGame();
}

async function clearLeaderboard() {
  if (!userId.value) return;

  const { error } = await supabase.from('scores_memory').delete().eq('user_id', userId.value);

  if (error) {
    console.error('Erreur suppression scores memory', error);
  }

  leaderboard.value = [];
}

async function fetchLeaderboard() {
  if (!userId.value) return;

  const { data, error } = await supabase
    .from('scores_memory')
    .select('*')
    .eq('user_id', userId.value)
    .order('moves', { ascending: true })
    .order('time', { ascending: true })
    .limit(5);

  if (!error && data) {
    leaderboard.value = data;
  }
}

const userId = ref<string | null>(null);

onMounted(async () => {
  const { data } = await supabase.auth.getUser();
  userId.value = data.user?.id || null;

  startGame();
  await fetchLeaderboard();
});

onBeforeUnmount(() => {
  if (timerInterval.value) clearInterval(timerInterval.value);
});
</script>

<style scoped>
.memory-card {
  width: 60px;
  height: 60px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  border-radius: 8px;
}

.score-list {
  max-height: 300px;
  overflow-y: auto;
}
</style>
