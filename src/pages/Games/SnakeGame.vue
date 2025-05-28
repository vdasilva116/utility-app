<template>
  <q-page class="q-pa-md">
    <div class="q-gutter-md row items-start justify-center">
      <div class="col-12 col-md-8 column items-center">
        <div class="text-h5 q-mb-md text-center">🐍 Snake</div>

        <canvas ref="canvas" width="400" height="400" class="snake-canvas q-mb-md" />

        <div class="text-subtitle2 q-mb-sm">Score : {{ score }}</div>
        <div class="text-subtitle2">Temps : {{ elapsedTime }}s</div>

        <div v-if="gameOver" class="q-mt-md text-center">
          <div class="text-h6 text-negative">💀 Partie terminée !</div>
          <q-input v-model="playerName" label="Votre nom" dense outlined class="q-mt-sm" />
          <q-btn label="Sauvegarder" color="primary" @click="saveScore" class="q-mt-sm" />
        </div>

        <q-btn label="Rejouer" color="primary" class="q-mt-md" @click="initGame" />
      </div>

      <div class="col-12 col-md-4">
        <div class="text-h6 q-mb-sm text-center">🏆 Meilleurs scores</div>
        <q-list bordered separator class="score-list">
          <q-item v-for="(s, i) in bestScores" :key="i">
            <q-item-section>{{ s.name || 'Anonyme' }}</q-item-section>
            <q-item-section class="text-right">{{ s.score }} pts - {{ s.time }}s</q-item-section>
          </q-item>
        </q-list>
        <q-btn
          label="Réinitialiser le classement"
          color="negative"
          class="q-mt-md full-width"
          @click="resetScores"
          flat
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { supabase } from 'boot/supabase';

interface ScoreEntry {
  name: string;
  score: number;
  time: number;
}

const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const gridSize = 20;
const snake = ref<{ x: number; y: number }[]>([]);
const direction = ref<'up' | 'down' | 'left' | 'right'>('right');
const apple = ref<{ x: number; y: number }>({ x: 0, y: 0 });
const score = ref(0);
const playerName = ref('');
const elapsedTime = ref(0);
const bestScores = ref<ScoreEntry[]>([]);
const gameOver = ref(false);

let interval: ReturnType<typeof setInterval> | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

function initGame() {
  snake.value = [{ x: 5, y: 5 }];
  direction.value = 'right';
  score.value = 0;
  playerName.value = '';
  elapsedTime.value = 0;
  gameOver.value = false;
  placeApple();
  if (interval) clearInterval(interval);
  if (timer) clearInterval(timer);
  interval = setInterval(move, 150);
  timer = setInterval(() => elapsedTime.value++, 1000);
}

function placeApple() {
  apple.value = {
    x: Math.floor(Math.random() * (400 / gridSize)),
    y: Math.floor(Math.random() * (400 / gridSize)),
  };
}

function move() {
  const headSegment = snake.value[0];
  if (!headSegment) return;
  const [headX, headY] = [headSegment.x, headSegment.y];
  const head: { x: number; y: number } = { x: headX, y: headY };

  switch (direction.value) {
    case 'up':
      head.y--;
      break;
    case 'down':
      head.y++;
      break;
    case 'left':
      head.x--;
      break;
    case 'right':
      head.x++;
      break;
  }

  if (
    head.x < 0 ||
    head.x >= 400 / gridSize ||
    head.y < 0 ||
    head.y >= 400 / gridSize ||
    snake.value.some((s) => s.x === head.x && s.y === head.y)
  ) {
    clearInterval(interval!);
    clearInterval(timer!);
    gameOver.value = true;
    return;
  }

  snake.value.unshift(head);
  if (head.x === apple.value.x && head.y === apple.value.y) {
    score.value++;
    placeApple();
  } else {
    snake.value.pop();
  }

  draw();
}

function draw() {
  if (!ctx.value) return;
  ctx.value.clearRect(0, 0, 400, 400);
  ctx.value.fillStyle = '#4caf50';
  for (const s of snake.value) {
    ctx.value.fillRect(s.x * gridSize, s.y * gridSize, gridSize - 2, gridSize - 2);
  }
  ctx.value.fillStyle = '#f44336';
  ctx.value.fillRect(
    apple.value.x * gridSize,
    apple.value.y * gridSize,
    gridSize - 2,
    gridSize - 2,
  );
}

function handleKey(e: KeyboardEvent) {
  const dir = direction.value;
  if (e.key === 'ArrowUp' && dir !== 'down') direction.value = 'up';
  else if (e.key === 'ArrowDown' && dir !== 'up') direction.value = 'down';
  else if (e.key === 'ArrowLeft' && dir !== 'right') direction.value = 'left';
  else if (e.key === 'ArrowRight' && dir !== 'left') direction.value = 'right';
}

async function saveScore() {
  const name = playerName.value.trim() || 'Anonyme';
  if (!userId.value) return;

  const { error } = await supabase.from('scores_snake').insert({
    name,
    score: score.value,
    time: elapsedTime.value,
    user_id: userId.value,
  });

  if (error) {
    console.error('Erreur lors de l’enregistrement du score :', error);
  }

  await fetchLeaderboard();
  gameOver.value = false;
}

async function resetScores() {
  if (!userId.value) return;

  const { error } = await supabase.from('scores_snake').delete().eq('user_id', userId.value);

  if (error) {
    console.error('Erreur lors de la réinitialisation des scores :', error);
  }

  bestScores.value = [];
}

async function fetchLeaderboard() {
  if (!userId.value) return;

  const { data, error } = await supabase
    .from('scores_snake')
    .select('*')
    .eq('user_id', userId.value)
    .order('score', { ascending: false })
    .order('time', { ascending: true })
    .limit(5);

  if (!error && data) {
    bestScores.value = data;
  }
}

const userId = ref<string | null>(null);

onMounted(async () => {
  const { data } = await supabase.auth.getUser();
  userId.value = data.user?.id || null;

  if (canvas.value) {
    ctx.value = canvas.value.getContext('2d');
    window.addEventListener('keydown', handleKey);
    initGame();
    await fetchLeaderboard();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKey);
  if (interval) clearInterval(interval);
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
.snake-canvas {
  border: 2px solid #ccc;
  background-color: #fefefe;
}
</style>
