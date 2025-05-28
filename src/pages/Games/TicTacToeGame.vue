<template>
  <q-page class="q-pa-md row q-col-gutter-xl">
    <div class="col-12 col-md-8 column items-center">
      <div class="text-h5 q-mb-md">❌⭕ Tic Tac Toe</div>

      <div class="q-gutter-sm q-mb-md">
        Au tour de : <strong>{{ currentPlayer }}</strong>
      </div>

      <div class="tictactoe-grid">
        <div v-for="(cell, index) in board" :key="index" class="cell" @click="makeMove(index)">
          {{ cell }}
        </div>
      </div>

      <div v-if="winner" class="q-mt-md text-h6 text-positive">
        {{ winner === 'Draw' ? 'Match nul !' : `Gagnant : ${winner}` }}
      </div>

      <q-btn label="Recommencer" color="primary" class="q-mt-md" @click="resetGame" />
    </div>

    <div class="col-12 col-md-4 q-mt-md">
      <div class="text-h6 q-mb-sm text-center">🏆 Score</div>
      <div class="score-box q-pa-sm q-mb-sm">
        <div class="score-line">❌ <span>X</span> : {{ score.X }}</div>
        <div class="score-line">⭕ <span>O</span> : {{ score.O }}</div>
        <div class="score-line">🤝 <span>Nul</span> : {{ score.draw }}</div>
      </div>
      <q-btn
        label="Réinitialiser le score"
        color="negative"
        class="full-width"
        @click="resetScore"
        flat
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { supabase } from 'boot/supabase';

const board = ref<('X' | 'O' | null)[]>(Array(9).fill(null));
const currentPlayer = ref<'X' | 'O'>('X');
const winner = ref<string | null>(null);
const score = ref<{ X: number; O: number; draw: number }>({ X: 0, O: 0, draw: 0 });
const userId = ref<string | null>(null);

function makeMove(index: number) {
  if (board.value[index] !== null || winner.value) return;
  board.value[index] = currentPlayer.value;
  checkWinner();
  if (!winner.value) {
    currentPlayer.value = currentPlayer.value === 'X' ? 'O' : 'X';
  }
}

function checkWinner() {
  const combos: [number, number, number][] = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of combos) {
    const va = board.value[a];
    if (va && va === board.value[b] && va === board.value[c]) {
      winner.value = va;
      score.value[va]++;
      void updateScoreInDb();
      return;
    }
  }

  if (board.value.every((cell) => cell !== null)) {
    winner.value = 'Draw';
    score.value.draw++;
    void updateScoreInDb();
  }
}

function resetGame() {
  board.value = Array(9).fill(null);
  currentPlayer.value = 'X';
  winner.value = null;
}

async function resetScore() {
  score.value = { X: 0, O: 0, draw: 0 };
  if (!userId.value) return;
  await supabase.from('scores_tictactoe').delete().eq('user_id', userId.value);
  void updateScoreInDb();
}

async function loadScore() {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user?.id) return;
  userId.value = auth.user.id;

  const { data } = await supabase
    .from('scores_tictactoe')
    .select('*')
    .eq('user_id', userId.value)
    .order('created_at', { ascending: false })
    .limit(1);

  if (data?.[0]) {
    score.value = {
      X: data[0].x,
      O: data[0].o,
      draw: data[0].draw,
    };
  }
}

async function updateScoreInDb() {
  if (!userId.value) return;
  await supabase.from('scores_tictactoe').insert([
    {
      user_id: userId.value,
      x: score.value.X,
      o: score.value.O,
      draw: score.value.draw,
    },
  ]);
}

onMounted(() => {
  void loadScore();
});
</script>

<style scoped>
.tictactoe-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(60px, 1fr));
  grid-template-rows: repeat(3, minmax(60px, 1fr));
  gap: 8px;
  max-width: 100%;
}

.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: #f2f2f2;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  font-weight: bold;
  transition: background 0.2s ease;
}

.cell:hover {
  background: #e0e0e0;
}

.score-box {
  background: #fafafa;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.score-line {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 16px;
  padding: 4px 8px;
  border-bottom: 1px solid #eee;
}

.score-line:last-child {
  border-bottom: none;
}
</style>
