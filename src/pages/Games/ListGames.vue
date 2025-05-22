<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">🎮 Jeux disponibles</div>

    <q-card class="q-mb-md cursor-pointer" @click="goTo('/listgames/tictactoe')">
      <q-card-section>
        <div class="text-subtitle1">❌⭕ Tic Tac Toe</div>
        <div class="text-caption text-grey">Deux joueurs, classique 3x3</div>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md cursor-pointer" @click="goTo('/listgames/snake')">
      <q-card-section>
        <div class="text-subtitle1">🐍 Snake</div>
        <div class="text-caption text-grey">Contrôle au clavier, évite-toi toi-même</div>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md cursor-pointer" @click="goTo('/listgames/pendu')">
      <q-card-section>
        <div class="text-subtitle1">🔤 Pendu</div>
        <div class="text-caption text-grey">Devine les lettres d’un mot secret</div>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md cursor-pointer" @click="goTo('/listgames/memories')">
      <q-card-section>
        <div class="text-subtitle1">🧠 Memory</div>
        <div class="text-caption text-grey">Trouve les paires de cartes identiques</div>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md cursor-pointer" @click="goTo('/listgames/2048')">
      <q-card-section>
        <div class="text-subtitle1">🧩 2048</div>
        <div class="text-caption text-grey">Fusionne les tuiles pour atteindre 2048</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goTo(path: string) {
  void router.push(path);
}
</script>

<style scoped>
.q-card {
  transition: box-shadow 0.2s ease;
}
.q-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>
