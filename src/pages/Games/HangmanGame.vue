<template>
  <q-page class="q-pa-md">
    <div v-if="!gameStarted">
      <div class="text-h6 q-mb-md">🎮 Choisis un mode de jeu</div>
      <q-btn label="Mode solo" color="primary" class="q-mr-sm" @click="startSolo" />
      <q-btn label="Mode à deux" color="secondary" class="q-ml-sm" @click="selectDuo" />

      <div v-if="duoSelected" class="q-mt-md">
        <q-input v-model="customWord" label="Mot à deviner" outlined class="q-mb-sm" />
        <q-btn label="Commencer" color="primary" @click="startDuo" />
      </div>
    </div>

    <div v-else>
      <div class="text-h6">Mot : {{ displayWord }}</div>
      <div class="q-my-md">
        <q-input
          v-model="currentLetter"
          label="Lettre"
          maxlength="1"
          outlined
          @keyup.enter="guessLetter"
        />
        <q-btn label="Valider" color="primary" class="q-mt-md" @click="guessLetter" />
      </div>

      <div class="text-subtitle2">Lettres essayées : {{ guessedLetters.join(', ') }}</div>
      <div class="text-subtitle2 text-negative q-mt-sm">
        Erreurs : {{ wrongGuesses }} / {{ maxErrors }}
      </div>

      <div v-if="gameOver" class="q-mt-lg">
        <div class="text-h6" :class="{ 'text-positive': isVictory, 'text-negative': !isVictory }">
          {{ isVictory ? 'Bravo ! Tu as gagné !' : 'Perdu ! Le mot était : ' + word }}
        </div>
        <q-btn label="Rejouer" class="q-mt-md" color="primary" @click="resetGame" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { wordList } from 'src/models/WordList';

const gameStarted = ref(false);
const duoSelected = ref(false);
const customWord = ref('');
const word = ref('');
const displayWord = ref('');
const guessedLetters = ref<string[]>([]);
const currentLetter = ref('');
const wrongGuesses = ref(0);
const maxErrors = 8;
const gameOver = ref(false);
const isVictory = ref(false);

function startSolo() {
  if (wordList.length > 0) {
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    word.value = randomWord!.toLowerCase();
    startGame();
  }
}

function selectDuo() {
  duoSelected.value = true;
}

function startDuo() {
  if (!customWord.value.trim()) return;
  word.value = customWord.value.toLowerCase();
  startGame();
}

function startGame() {
  guessedLetters.value = [];
  wrongGuesses.value = 0;
  currentLetter.value = '';
  gameOver.value = false;
  isVictory.value = false;
  updateDisplay();
  gameStarted.value = true;
}

function updateDisplay() {
  displayWord.value = word.value
    .split('')
    .map((l) => (guessedLetters.value.includes(l) ? l : '_'))
    .join(' ');
}

function guessLetter() {
  const letter = currentLetter.value.toLowerCase();
  currentLetter.value = '';
  if (!letter || guessedLetters.value.includes(letter) || gameOver.value) return;

  guessedLetters.value.push(letter);
  if (!word.value.includes(letter)) {
    wrongGuesses.value++;
  }

  updateDisplay();

  if (!displayWord.value.includes('_')) {
    gameOver.value = true;
    isVictory.value = true;
  } else if (wrongGuesses.value >= maxErrors) {
    gameOver.value = true;
  }
}

function resetGame() {
  gameStarted.value = false;
  duoSelected.value = false;
  customWord.value = '';
  word.value = '';
  displayWord.value = '';
  guessedLetters.value = [];
  currentLetter.value = '';
  wrongGuesses.value = 0;
  gameOver.value = false;
  isVictory.value = false;
}
</script>

<style scoped>
.q-page {
  max-width: 500px;
  margin: auto;
  text-align: center;
}
</style>
