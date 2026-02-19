<template>
  <div class="case-root">
    <NavBar @export-click="handleExportClick" />
    <header class="hero">
      <h1 class="page-title">Casos Emblemáticos </h1>
      <BtnVoltar />
    </header>
    <main class="container">
      <section class="case-card left-col">
        <h3>Alfama — "Turismo substituiu residentes"</h3>
        <img class="case-img" src="/alfama.png" alt="Alfama" />
        <p>
          O histórico bairro de Alfama enfrenta uma transformação profunda.
          Com grande parte das casas convertidas em alojamentos turísticos,
          muitos residentes foram obrigados a sair devido ao aumento das rendas.
        </p>
        <h4>42% das casas listadas no Airbnb</h4>
        <p class="subtitle">"Mais alojamentos turísticos do que residentes permanentes."</p>
        <div class="chart-wrapper">
          <canvas ref="graficoPie"></canvas>
        </div>
      </section>
      <section class="case-card right-col">
        <h3>Cais do Sodré — "O bairro que nunca dorme"</h3>
        <img class="case-img" src="/caissodre.png" alt="Cais do Sodré" />
        <p>
          O antigo bairro de marinheiros tornou-se zona de bares e alojamentos locais.
          O turismo trouxe vida, mas também afastou quem ali vivia há décadas.
        </p>
        <div class="chart-wrapper">
          <canvas ref="graficoBarras"></canvas>
        </div>
      </section>
    </main>
  </div>
</template>


<script setup lang="ts">

import { ref, onMounted } from "vue";
import { criarPieChart } from "../charts/pieChart.js";
import { criarBarSimples } from "../charts/barSimples.js";
import NavBar from '../components/NavBar.vue';
import * as XLSX from 'xlsx';

function handleExportClick() {
  window.dispatchEvent(new CustomEvent('show-export-confirm', { detail: { callback: exportData } }));
}

function exportData() {
  // Dados de Alfama
  const alfamaData = [
    ["Bairro", "Alfama"],
    ["Título", "Turismo substituiu residentes"],
    ["Descrição", "O histórico bairro de Alfama enfrenta uma transformação profunda. Com grande parte das casas convertidas em alojamentos turísticos, muitos residentes foram obrigados a sair devido ao aumento das rendas."],
    ["% casas no Airbnb", "42%"],
    [],
    ["Gráfico Pie"],
    ["Outros Alojamentos", 58],
    ["Casas no Airbnb", 42],
  ];

  // Dados de Cais do Sodré
  const caisData = [
    ["Bairro", "Cais do Sodré"],
    ["Título", "O bairro que nunca dorme"],
    ["Descrição", "O antigo bairro de marinheiros tornou-se zona de bares e alojamentos locais. O turismo trouxe vida, mas também afastou quem ali vivia há décadas."],
    [],
    ["Gráfico Barras"],
    ["Aloj. Turísticos", 30],
    ["Residentes Permanentes", 17],
    ["Atividade Comercial", 10],
  ];

  // Criar workbook e sheets
  const wb = XLSX.utils.book_new();
  const wsAlfama = XLSX.utils.aoa_to_sheet(alfamaData);
  const wsCais = XLSX.utils.aoa_to_sheet(caisData);
  XLSX.utils.book_append_sheet(wb, wsAlfama, 'Alfama');
  XLSX.utils.book_append_sheet(wb, wsCais, 'Cais do Sodré');

  // Exportar ficheiro
  XLSX.writeFile(wb, 'dados-casos-emblematicos.xlsx');
}
import BtnVoltar from '../components/BtnVoltar.vue';

const graficoPie = ref<HTMLCanvasElement | null>(null);
const graficoBarras = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (graficoPie.value) {
    criarPieChart(
      graficoPie.value,
      ["Outros Alojamentos", "Casas no Airbnb"],
      [58, 42],
      ['#C97253', '#E4A176']
    );
  }
  if (graficoBarras.value) {
    criarBarSimples(
      graficoBarras.value,
      ["Aloj. Turísticos", "Residentes Permanentes", "Atividade Comercial"],
      [30, 17, 10],
      "#FFE4C5"
    );
  }
});
</script>

<style scoped>
.case-root {
  font-family: Inter, Arial, sans-serif;
  background: var(--bg);
  min-height: 100vh;
  color: #3b2f2c;
}

.hero {
  padding: 24px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 28px;
  margin: 0;
  color: var(--accent);
  font-weight: 700;
}


.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.case-card {
  background: #FFEEDB;
  padding: 24px;
  border-radius: 12px;
box-shadow: 0 2px 8px rgba(0,0,0,0.05);

}

.case-card h3 {
  color: #3b2f2c;
  font-size: 18px;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.case-card h4 {
  color: #3b2f2c;
  font-size: 16px;
  margin: 16px 0 8px 0;
  font-weight: 700;
}

.case-card p {
  color: #3b2f2c;
  line-height: 1.6;
  margin: 0 0 12px 0;
  font-size: 14px;
}

.subtitle {
  color: #7a5a53;
  font-style: italic;
  font-size: 14px;
}

.case-img {
  width: 100%;
  border-radius: 12px;
  margin: 12px 0;
  object-fit: cover;
  max-height: 200px;
}

.chart-wrapper {
  margin-top: 20px;
  height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-wrapper canvas {
  max-width: 100%;
  max-height: 100%;
}

@media (max-width: 900px) {
  .container {
    grid-template-columns: 1fr;
  }
  
  .hero {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
