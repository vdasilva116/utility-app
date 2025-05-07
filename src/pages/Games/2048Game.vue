<template>
  <q-page class="q-pa-md row justify-center">
    <div class="column items-center col-8">
      <div class="row items-center justify-between full-width q-mb-sm">
        <div class="text-h5">🧩 Jeu 2048</div>
        <q-btn label="Relancer" color="secondary" @click="resetGame" />
      </div>

      <div class="text-caption q-mb-md">Score : {{ score }}</div>

      <div class="q-mb-md">
        <div class="grid-container">
          <div v-for="(val, i) in grid" :key="i" class="tile">
            {{ val || '' }}
          </div>
        </div>
      </div>

      <div v-if="gameOver" class="q-mt-md text-negative">
        💀 Partie terminée !
        <q-input v-model="playerName" label="Ton nom" class="q-mt-md" outlined dense />
        <q-btn label="Enregistrer le score" color="primary" class="q-mt-sm" @click="saveScore" />
      </div>
    </div>

    <div class="col-4 q-ml-md">
      <div class="text-h6">🏆 Meilleurs scores</div>
      <q-list bordered separator class="q-mt-sm">
        <q-item v-for="(s, i) in leaderboard" :key="i">
          <q-item-section>{{ s.name }}</q-item-section>
          <q-item-section>{{ s.score }}</q-item-section>
        </q-item>
      </q-list>
      <q-btn flat label="Reset scores" color="negative" class="q-mt-sm" @click="clearLeaderboard" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface ScoreEntry {
  name: string;
  score: number;
}

const gridSize = 4;
const grid = ref<number[]>(Array(gridSize * gridSize).fill(0));
const score = ref(0);
const playerName = ref('');
const gameOver = ref(false);
const leaderboard = ref<ScoreEntry[]>([]);

function getIndex(x: number, y: number): number {
  return y * gridSize + x;
}

function addRandomTile() {
  const empty = grid.value.map((v, i) => (v === 0 ? i : -1)).filter((i) => i !== -1);
  if (empty.length === 0) return;
  const i = empty[Math.floor(Math.random() * empty.length)]!;
  grid.value[i] = Math.random() < 0.9 ? 2 : 4;
}

function combine(row: number[]): number[] {
  const filtered = row.filter((n): n is number => n !== undefined && n !== 0);
  for (let i = 0; i < filtered.length - 1; i++) {
    if (
      filtered[i] !== undefined &&
      filtered[i + 1] !== undefined &&
      filtered[i] === filtered[i + 1]
    ) {
      const newVal = filtered[i]! * 2;
      filtered[i] = newVal;
      score.value += newVal;
      filtered.splice(i + 1, 1);
    }
  }
  return [...filtered, ...Array(gridSize - filtered.length).fill(0)];
}

function handleMove(direction: 'up' | 'down' | 'left' | 'right') {
  let moved = false;
  const newGrid = [...grid.value];

  for (let y = 0; y < gridSize; y++) {
    const row: number[] = [];
    for (let x = 0; x < gridSize; x++) {
      const idx = direction === 'left' || direction === 'right' ? getIndex(x, y) : getIndex(y, x);
      row.push(grid.value[idx]!);
    }

    const newRow =
      direction === 'left'
        ? combine(row)
        : direction === 'right'
          ? combine(row.reverse()).reverse()
          : direction === 'up'
            ? combine(row)
            : combine(row.reverse()).reverse();

    for (let x = 0; x < gridSize; x++) {
      const newVal = newRow[x];
      const idx = direction === 'left' || direction === 'right' ? getIndex(x, y) : getIndex(y, x);
      if (grid.value[idx] !== newVal) {
        newGrid[idx] = newVal!;
        moved = true;
      }
    }
  }

  if (moved) {
    grid.value = newGrid;
    addRandomTile();
    if (!grid.value.includes(0) && !canMove()) {
      gameOver.value = true;
    }
  }
}

function canMove(): boolean {
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const val = grid.value[getIndex(x, y)];
      if (x < gridSize - 1 && val === grid.value[getIndex(x + 1, y)]) return true;
      if (y < gridSize - 1 && val === grid.value[getIndex(x, y + 1)]) return true;
    }
  }
  return false;
}

function resetGame() {
  grid.value = Array(gridSize * gridSize).fill(0);
  score.value = 0;
  gameOver.value = false;
  playerName.value = '';
  addRandomTile();
  addRandomTile();
}

function saveScore() {
  if (!playerName.value.trim()) return;
  leaderboard.value.push({ name: playerName.value.trim(), score: score.value });
  leaderboard.value.sort((a, b) => b.score - a.score);
  leaderboard.value = leaderboard.value.slice(0, 5);
  localStorage.setItem('game2048Scores', JSON.stringify(leaderboard.value));
  resetGame();
}

function clearLeaderboard() {
  leaderboard.value = [];
  localStorage.removeItem('game2048Scores');
}

onMounted(() => {
  const stored = localStorage.getItem('game2048Scores');
  if (stored) leaderboard.value = JSON.parse(stored);
  resetGame();
  window.addEventListener('keydown', (e) => {
    if (gameOver.value) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      handleMove(e.key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right');
    }
  });
});
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 60px);
  gap: 8px;
}

.tile {
  width: 60px;
  height: 60px;
  background-color: #ececec;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-radius: 6px;
}
</style>
