<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md items-center q-mb-md">
      <q-btn label="Effacer" color="negative" @click="clearCanvas" />
      <q-btn label="Exporter en PNG" color="primary" @click="exportCanvas" />
    </div>

    <div class="canvas-container">
      <canvas
        ref="canvas"
        class="drawing-canvas"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
      ></canvas>
    </div>

    <div class="row q-gutter-md items-center q-mt-md">
      <q-checkbox v-model="isEraser" label="Gomme" />
      <q-select
        v-model="color"
        :options="colors"
        label="Couleur"
        dense
        outlined
        emit-value
        map-options
        class="col"
      />
      <q-slider v-model="lineWidth" :min="1" :max="20" :label-always="true" class="col" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const isDrawing = ref(false);
const color = ref('black');
const lineWidth = ref(3);
const isEraser = ref(false);

const startX = ref(0);
const startY = ref(0);

const colors = [
  { label: 'Noir', value: 'black' },
  { label: 'Rouge', value: 'red' },
  { label: 'Vert', value: 'green' },
  { label: 'Bleu', value: 'blue' },
  { label: 'Orange', value: 'orange' },
];

function startDrawing(e: MouseEvent) {
  if (!ctx.value || !canvas.value) return;
  const x = (e.offsetX * canvas.value.width) / canvas.value.clientWidth;
  const y = (e.offsetY * canvas.value.height) / canvas.value.clientHeight;
  startX.value = x;
  startY.value = y;
  isDrawing.value = true;
  ctx.value.beginPath();
  ctx.value.moveTo(x, y);
}

function draw(e: MouseEvent) {
  if (!isDrawing.value || !ctx.value || !canvas.value) return;

  const x = (e.offsetX * canvas.value.width) / canvas.value.clientWidth;
  const y = (e.offsetY * canvas.value.height) / canvas.value.clientHeight;

  ctx.value.lineWidth = lineWidth.value;
  ctx.value.strokeStyle = isEraser.value ? 'white' : color.value;
  ctx.value.lineCap = 'round';
  ctx.value.lineTo(x, y);
  ctx.value.stroke();
}

function stopDrawing() {
  if (!ctx.value) return;
  isDrawing.value = false;
  ctx.value.closePath();
}

function clearCanvas() {
  if (ctx.value && canvas.value) {
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
  }
}

function exportCanvas() {
  if (!canvas.value) return;
  const dataUrl = canvas.value.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = 'dessin.png';
  link.click();
}

onMounted(() => {
  if (canvas.value) {
    canvas.value.width = canvas.value.offsetWidth * 2;
    canvas.value.height = canvas.value.offsetHeight * 2;
    const context = canvas.value.getContext('2d');
    if (context) ctx.value = context;
  }
});
</script>

<style scoped>
.canvas-container {
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  height: 500px;
}

.drawing-canvas {
  width: 100%;
  height: 100%;
  cursor: crosshair;
  display: block;
}
</style>
