<template>
  <q-page class="q-pa-md flex flex-center">
    <div class="calculator shadow-2 rounded-borders q-pa-md bg-white">
      <div class="display q-mb-sm">{{ input || '0' }}</div>
      <div class="grid">
        <q-btn
          v-for="btn in buttons"
          :key="btn.label"
          :label="btn.label"
          :color="btn.color"
          flat
          @click="press(btn.label)"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const input = ref('');

const buttons = [
  { label: '(', color: 'secondary' },
  { label: ')', color: 'secondary' },
  { label: 'C', color: 'negative' },
  { label: '/', color: 'secondary' },
  { label: '7', color: 'primary' },
  { label: '8', color: 'primary' },
  { label: '9', color: 'primary' },
  { label: '*', color: 'secondary' },
  { label: '4', color: 'primary' },
  { label: '5', color: 'primary' },
  { label: '6', color: 'primary' },
  { label: '-', color: 'secondary' },
  { label: '1', color: 'primary' },
  { label: '2', color: 'primary' },
  { label: '3', color: 'primary' },
  { label: '+', color: 'secondary' },
  { label: '0', color: 'primary' },
  { label: '.', color: 'primary' },
  { label: '=', color: 'positive' },
  { label: '√', color: 'secondary' },
  { label: '^', color: 'secondary' },
  { label: 'π', color: 'secondary' },
  { label: 'sin', color: 'secondary' },
  { label: 'cos', color: 'secondary' },
  { label: 'tan', color: 'secondary' },
  { label: 'log', color: 'secondary' },
];

function press(val: string) {
  if (val === 'C') {
    input.value = '';
  } else if (val === '=') {
    try {
      const expr = input.value
        .replace(/π/g, Math.PI.toString())
        .replace(/√\(?(.+?)\)?/g, (_, g1) => `Math.sqrt(${g1})`)
        .replace(/sin\(?(.+?)\)?/g, (_, g1) => `Math.sin(${g1})`)
        .replace(/cos\(?(.+?)\)?/g, (_, g1) => `Math.cos(${g1})`)
        .replace(/tan\(?(.+?)\)?/g, (_, g1) => `Math.tan(${g1})`)
        .replace(/log\(?(.+?)\)?/g, (_, g1) => `Math.log10(${g1})`)
        .replace(/(\d+)\^(\d+)/g, (_, base, exp) => `Math.pow(${base},${exp})`);
      input.value = eval(expr).toString();
    } catch {
      input.value = 'Erreur';
    }
  } else {
    input.value += val;
  }
}

function handleKey(e: KeyboardEvent) {
  const validKeys = '0123456789+-*/().^'.split('');
  if (validKeys.includes(e.key)) {
    input.value += e.key;
  } else if (e.key === 'Enter') {
    press('=');
  } else if (e.key === 'Backspace') {
    input.value = input.value.slice(0, -1);
  } else if (e.key === 'c' || e.key === 'C') {
    press('C');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKey);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKey);
});
</script>

<style scoped>
.calculator {
  width: 320px;
}
.display {
  font-size: 28px;
  text-align: right;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #f9f9f9;
  font-family: monospace;
  word-wrap: break-word;
  min-height: 40px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
</style>
