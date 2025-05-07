<template>
  <q-page class="q-pa-md row q-col-gutter-xl">
    <div class="col-8">
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

    <div class="col-4">
      <div class="text-h6 q-mb-sm">🏆 Score</div>
      <q-list bordered separator>
        <q-item>
          <q-item-section>❌ X : {{ score.X }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>⭕ O : {{ score.O }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>Matchs nuls : {{ score.draw }}</q-item-section>
        </q-item>
      </q-list>
      <q-btn
        label="Réinitialiser le score"
        color="negative"
        class="q-mt-md"
        @click="resetScore"
        flat
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const board = ref<('X' | 'O' | null)[]>(Array(9).fill(null));
const currentPlayer = ref<'X' | 'O'>('X');
const winner = ref<string | null>(null);

const storedScore = localStorage.getItem('tictactoe-score');
const score = ref<{ X: number; O: number; draw: number }>(
  storedScore ? JSON.parse(storedScore) : { X: 0, O: 0, draw: 0 },
);

watch(
  score,
  (val) => {
    localStorage.setItem('tictactoe-score', JSON.stringify(val));
  },
  { deep: true },
);

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
    const vb = board.value[b];
    const vc = board.value[c];
    if (va && va === vb && va === vc) {
      winner.value = va;
      score.value[va]++;
      return;
    }
  }

  if (board.value.every((cell) => cell !== null)) {
    winner.value = 'Draw';
    score.value.draw++;
  }
}

function resetGame() {
  board.value = Array(9).fill(null);
  currentPlayer.value = 'X';
  winner.value = null;
}

function resetScore() {
  score.value = { X: 0, O: 0, draw: 0 };
  localStorage.setItem('tictactoe-score', JSON.stringify(score.value));
}
</script>

<style scoped>
.tictactoe-grid {
  display: grid;
  grid-template-columns: repeat(3, 80px);
  grid-template-rows: repeat(3, 80px);
  gap: 8px;
}
.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: #f2f2f2;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  font-weight: bold;
  transition: background 0.2s ease;
}
.cell:hover {
  background: #e0e0e0;
}
</style>
