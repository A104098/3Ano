<template>
  <div class="stats-chart">
    <canvas ref="chartRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const chartRef = ref<HTMLCanvasElement | null>(null);

defineProps({
  data: {
    type: Object,
    required: true
  }
});

onMounted(() => {
  if (chartRef.value) {
    // Chart.js initialization would go here
    console.log('Chart mounted');
  }
});
</script>

<style scoped>
.stats-chart {
  width: 100%;
  height: 300px;
}

canvas {
  max-width: 100%;
}
</style>
