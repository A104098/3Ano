<template>
  <div class="home-root">
    <NavBar @export-click="handleExportClick" />
    
    <header class="hero">
      <p class="subtitle">Encontra um local</p>
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          placeholder="Pesquisar cidade, bairro ou morada" 
          @keyup.enter="handleSearch"
        />
        <button aria-label="Pesquisar" @click="handleSearch">🔎︎</button>
      </div>  
    </header>

    <main class="container">
      <section class="left-col">
        <div class="card alerts">
          <h2>Alertas </h2>
          <ul>
            <li><strong>Total de alojamentos suspeitos:</strong> {{ totalSuspects.toLocaleString() }} <span class="muted">(↑ {{ percentChange }}% vs. mês anterior)</span></li>
            <li><strong>% sem licença:</strong> {{ percentNoLicense }}%</li>
            <li><strong>Média diária &gt; 240 dias:</strong> {{ avgDailyOver240 }}%</li>
          </ul>
        </div>

        <div class="card cases">
          <h2>Casos Emblemáticos </h2>
          <div class="case-item">
            <h3>Alfama — "Turismo substitui residentes"</h3>
            <p>42% das casas listadas no Airbnb: "Mais alojamentos turísticos do que residentes permanentes."</p>
            <router-link to="/pag-cases-emb" class="btnvermais">Ver mais →</router-link>
          </div>
        </div>
      </section>
      <section class="right-col">
        <div class="grafico-wrapper">
          <div class="chart-header">
            <h3 class="chart-title">Indicadores Rápidos</h3>
            <p class="chart-subtitle">Top Cidades com mais irregularidades</p>
          </div>
          <canvas ref="graficoCidades" class="chart-canvas"></canvas>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { criarCidadesChart } from "../charts/cidadesChart.js";
import NavBar from "../components/NavBar.vue";

function handleExportClick() {
  window.dispatchEvent(new Event('show-export-warning'));
}
 
const router = useRouter();
const searchQuery = ref("");

const totalSuspects = ref(5773);
const percentChange = ref(8);
const percentNoLicense = ref(14);
const avgDailyOver240 = ref(6);

const graficoCidades = ref<HTMLCanvasElement | null>(null);

// Função para lidar com a pesquisa
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    const cityName = searchQuery.value.trim().toLowerCase();
    // Redirecionar para a página da cidade
    router.push({ name: 'city', params: { city: cityName } });
  }
};

onMounted(() => {
  const dados = {
  labels: ["Lisboa", "Trentino", "Creta", "Londres", "Nova Iorque"],
  regions: ["Almada","Trento","Heraclião","Londres","Albany"],
  sem1: [410, 380, 250, 190, 130],
  sem2: [390, 350, 230, 180, 110],
  cor1: "#d18567",
  cor2: "#a06640"
};

  if (graficoCidades.value) {
    criarCidadesChart(graficoCidades.value, dados);
  }
});
</script>
<style scoped>
 :global(:root) { /* Definição de variáveis de cor, usei global porque nao quero algo especifico, quero algo "global para todo o homepage" */
  --bg: #fff8f0;
  --accent: #C97253;
  --card:#FFEEDB;
  --muted: #000000;
}

.home-root {
  font-family: Inter, Arial, sans-serif;
  color: #3b2f2c;
  background: var(--bg);
  min-height: 100vh;
}

.hero {
  background-image: url('/fundo.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-blend-mode: multiply;
  padding: 18px 24px;
  position: relative;
}

.subtitle {
  margin: 8px 0 8px 0;
  color: var(--muted);
  font-size: 20px;
  font-weight: 600;
}

.search-bar {
  display: flex;
  gap: 8px;
  background:white;
  border: 1px solid #f2e3d3;
  padding: 8px;
  border-radius: 999px;
  align-items: center;
  width: fit-content;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);

}

.search-bar input {
  border: 0;
  background: transparent;
  outline: none;
  padding: 6px 8px;
  width: 340px;
}

.search-bar button {
  background: transparent;
  border: 0;
  font-size: 18px;
  cursor: pointer;
}

.container {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 20px;
  padding: 22px;
}

.card {
  background: var(--card);
  padding: 18px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.left-col {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.right-col {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.alerts h2,
.cases h2,
.indicators h2 {
  color: var(--accent);
  margin: 0 0 8px 0;
}

.alerts ul {
  list-style: none;
  padding: 0;
  margin: 0;
  color: var(--muted);
}

.alerts li {
  padding: 8px 0;
  border-bottom: 1px dashed rgba(0,0,0,0.03);
}

.muted {
  color: var(--muted);
}

.small {
  font-size: 12px;
}

.case-item h3 {
  margin: 0 0 6px 0;
}

.case-item p {
  margin: 0 0 12px 0;
}

.btnvermais {
  background: #FFCF99;
  border: 0;
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--accent);
  cursor: pointer;
  align-self: flex-start;
  margin-top: 12px;
}

.btnvermais:hover {
  background: #ffcf998e;
  transform: scale(1.02);
}

.card.cases { /* Garante altura mínima para alinhar os botões */
  min-height: 90px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Alinha o conteúdo ao topo */
}

.case-item { /* Garante que o item do caso ocupa todo o espaço disponível */
  display: flex; /* Adiciona display flex */
  flex-direction: column;
  flex: 1;
}

.chart {
  margin-top: 20px;
}

.chart-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
}

.chart-label {
  width: 90px;
  font-size: 13px;
}

.bar-wrap {
  flex: 1;
  background: rgba(0,0,0,0.04);
  height: 14px;
  border-radius: 8px;
  overflow: hidden;
}

.bar {
  height: 100%;
  background: linear-gradient(90deg,var(--accent),#b85b4b);
  border-radius: 8px;
}

.chart-value {
  width: 36px;
  text-align: right;
  font-weight: 600;
}

@media (max-width: 900px) {
  .container {
    grid-template-columns: 1fr;
  }

  .search-bar input {
    width: 200px;
  }
}

.grafico-wrapper {
  max-height: 60vh;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chart-canvas {
  height: 100%;
}

.chart-header {
  margin-bottom: 8px;
}

.chart-title {
  margin: 0;
  font-size: 18px;
  color: #3b2f2c;
  font-weight: 700;
}

.chart-subtitle {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: #6b5a56;
}
</style>
