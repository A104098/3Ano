<script setup lang="ts">

import { ref, computed, onMounted, onUnmounted, watch, nextTick, Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as XLSX from 'xlsx';
import NavBar from '../components/NavBar.vue';
import YearSelect from '../components/YearSelect.vue';
import BtnVoltar from '../components/BtnVoltar.vue';
import { Chart as ChartJS, Chart } from 'chart.js';
import { registerChartPlugins } from '../utils/chartConfig';
import type { CityData, Region, Listing, YearData } from '../data/cities';
import { storeToRefs } from 'pinia';
import { useMainStore } from '../stores/mainStore';
registerChartPlugins();

const route = useRoute();
const router = useRouter();
const mainStore = useMainStore();
// State
const cityData = ref<CityData|null>(null);
const regionData = ref<Region|null>(null);
const { selectedYear } = storeToRefs(mainStore);

let pieChart: Chart | null = null;
let roomTypeChart: Chart | null = null;
let lineChart1: Chart | null = null;
let lineChart2: Chart | null = null;


// Computed
const isRegionMode = computed(() => Boolean(route.params.region));

const entityAvailable = computed(() =>
  isRegionMode.value ? Boolean(cityData.value && regionData.value) : Boolean(cityData.value)
);

const titleLabel = computed(() => {
  if (!cityData.value) return '';
  if (isRegionMode.value && regionData.value) {
    return `${regionData.value.name} (${cityData.value.name})`;
  }
  return cityData.value.name;
});

const entityYearData = computed(() =>
  isRegionMode.value ? regionData.value?.yearData : cityData.value?.yearData
);

const availableYears = computed(() => entityYearData.value?.map((y: YearData) => y.year) ?? []);

const currentYearData = computed(() => {
  if (!entityYearData.value?.length) return null;
  const fallback = entityYearData.value[0];
  if (selectedYear.value === 0) return fallback;
  return entityYearData.value.find((y: YearData) => y.year === selectedYear.value) || fallback;
});

const baseRating = computed(() =>
  isRegionMode.value && regionData.value ? regionData.value.rating : cityData.value?.rating
);

const filteredListings = computed(() => {
  if (!cityData.value) return [];
  if (isRegionMode.value && regionData.value) {
    return cityData.value.listings.filter((l: Listing) => l.region.toLowerCase() === regionData.value?.name.toLowerCase());
  }
  return cityData.value.listings;
});

const heroImage = computed(() =>
  isRegionMode.value && regionData.value ? regionData.value.heroImage : cityData.value?.heroImage
);


type TableRow = {
  name: string;
  region: string;
  type: string;
  price: number;
  nights: number;
  occupancy: number | null;
  rating: number;
};

const tableRows = computed<TableRow[]>(() => {
  if (!cityData.value) return [];
  const baseYear = currentYearData.value || entityYearData.value?.[0] || null;
  const basePrice = baseYear?.averagePrice ?? cityData.value.averagePrice;
  const baseNights = baseYear?.averageNights ?? cityData.value.averageNights;
  const occupancy = baseYear?.occupancyRate ?? null;
  const sourceListings = filteredListings.value;
  const ratingValue = baseRating.value ?? 0;

  if (sourceListings.length) {
    return sourceListings.map((listing: Listing, index: number) => ({
      name: listing.title,
      region: listing.region,
      type: listing.type,
      price: Math.round(basePrice * (1 + index * 0.04)),
      nights: Math.round(baseNights * (1 + (index % 3) * 0.03)),
      occupancy: occupancy !== null ? Math.min(100, Number((occupancy + index * 0.5).toFixed(1))) : null,
      rating: Number(Math.min(5, ratingValue + index * 0.05).toFixed(1))
    }));
  }

  if (regionData.value) {
    return [{
      name: `Alojamento ${regionData.value.name}`,
      region: regionData.value.name,
      type: 'Apartamento',
      price: basePrice,
      nights: baseNights,
      occupancy,
      rating: ratingValue
    }];
  }

  return cityData.value.regions.map((region: Region, index: number) => ({
    name: `Alojamento ${region.name}`,
    region: region.name,
    type: 'Apartamento',
    price: Math.round(basePrice * (1 + index * 0.03)),
    nights: Math.round(baseNights * (1 + (index % 2) * 0.02)),
    occupancy: occupancy,
    rating: Number(Math.min(5, ratingValue + index * 0.05).toFixed(1))
  }));
});

// Função de exportação para Excel

function exportData() {
  if (!tableRows.value || !tableRows.value.length) {
    alert("Não há dados para exportar.");
    return;
  }
  // Cabeçalhos em português
  const headers = [
    'Alojamento', 'Região', 'Tipo', 'Preço médio (€)', 'Noites médias', 'Ocupação (%)', 'Avaliação'
  ];
  const data = tableRows.value.map(row => [
    row.name,
    row.region,
    row.type,
    row.price,
    row.nights,
    row.occupancy !== null ? row.occupancy : '',
    row.rating
  ]);
  const ws = XLSX.utils.aoa_to_sheet([
    headers,
    ...data
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Alojamentos');

  // Resumo geral (sem colunas label/value)
  const statsArr = [
    ['Cidade', titleLabel.value],
    ['Nº Listagens', currentYearData.value?.totalListings ?? 'N/A'],
    ['Preço médio/noite', currentYearData.value?.averagePrice ?? 'N/A'],
    ['Noites reservadas (média)', currentYearData.value?.averageNights ?? 'N/A'],
    ['Avaliação média', baseRating.value ?? 'N/A'],
    ['Ocupação média', currentYearData.value?.occupancyRate ? `${currentYearData.value.occupancyRate}%` : 'N/A']
  ];
  // Exporta só as linhas de dados, sem cabeçalho
  const wsStats = XLSX.utils.aoa_to_sheet(statsArr);
  XLSX.utils.book_append_sheet(wb, wsStats, 'Resumo');

    // PieChart: top proprietários (compatível com dados antigos)
    const ownersDist = currentYearData.value?.topOwnersDistribution;
    if (currentYearData.value && ownersDist) {
      const pieData = Object.entries(ownersDist).map(([owner, valor]) => ({
        'Proprietário': owner,
        'Nº Listagens': valor
      }));
      const wsPie = XLSX.utils.json_to_sheet(pieData);
      XLSX.utils.book_append_sheet(wb, wsPie, 'Top Proprietários');
    }

  // LineChart1: Número de listagens por mês
  if (currentYearData.value && Array.isArray(currentYearData.value.monthlyListings)) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const listingsData = meses.map((mes, i) => ({
      'Mês': mes,
      'Nº Listagens': currentYearData.value!.monthlyListings[i] ?? ''
    }));
    const wsListings = XLSX.utils.json_to_sheet(listingsData);
    XLSX.utils.book_append_sheet(wb, wsListings, 'Listagens por Mês');
  }

  // LineChart2: Preço médio por noite por mês
  if (currentYearData.value && Array.isArray(currentYearData.value.monthlyPrices)) {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const pricesData = meses.map((mes, i) => ({
      'Mês': mes,
      'Preço Médio (€)': currentYearData.value!.monthlyPrices[i] ?? ''
    }));
    const wsPrices = XLSX.utils.json_to_sheet(pricesData);
    XLSX.utils.book_append_sheet(wb, wsPrices, 'Preço Médio por Noite');
  }

  const idxResumo = wb.SheetNames.indexOf('Resumo');
  if (idxResumo > 0) {
    wb.SheetNames.splice(idxResumo, 1);
    wb.SheetNames.unshift('Resumo');
  }

  const cidade = titleLabel.value.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const ano = selectedYear.value || (currentYearData.value?.year ?? '');
  const filename = `dados-explorar-${cidade}-${ano}.xlsx`;
  XLSX.writeFile(wb, filename);
}

const openExportModal = () => {
  window.dispatchEvent(new CustomEvent('show-export-confirm', {
    detail: {
      callback: exportData
    }
  }));
};

const handleComparar = () => {
  const city = route.params.city as string;
  if (isRegionMode.value && regionData.value) {
    router.push({ name: 'compare-regiao', params: { city, region: regionData.value.name } });
    return;
  }
  router.push({ name: 'compare', params: { city } });
};

const handleVoltar = () => {
  router.push({ name: 'city', params: { city: route.params.city } });
};


onMounted(async () => {
  const citySlug = route.params.city as string;

  mainStore.selectCityBySlug(citySlug);
  cityData.value = mainStore.selectedCity;

  if (isRegionMode.value && cityData.value) {
    const regionSlug = route.params.region as string;
    regionData.value = cityData.value.regions.find(
      r => r.name === regionSlug || r.name.toLowerCase() === regionSlug.toLowerCase()
    ) || null;
  }

  if (entityYearData.value?.length && !selectedYear.value) {
    mainStore.setSelectedYear(entityYearData.value[0].year);
    nextTick(() => setTimeout(createCharts, 150));
  }
});

watch([selectedYear, entityYearData], () => {
  // Sempre que muda o ano ou muda a lista de anos disponíveis (ex: troca cidade/região),
  // força o selectedYear para um ano válido
  if (entityYearData.value?.length) {
    const available = entityYearData.value.map(y => y.year);
    if (!available.includes(selectedYear.value)) {
    mainStore.setSelectedYear(available[0]);
}

  }
  nextTick(() => setTimeout(updateCharts, 100));
}, { flush: 'post' });

const createCharts = () => {
  if (!currentYearData.value) {
    return;
  }

  // Pie Chart: Top Proprietários
  const pieCtx = document.getElementById('pieChart') as HTMLCanvasElement | null;
  if (pieChart) pieChart.destroy();
  if (pieCtx) {
    const ownersDist = currentYearData.value.topOwnersDistribution;
    if (ownersDist) {
      const labels = Object.keys(ownersDist);
      const data = Object.values(ownersDist) as number[];

      pieChart = new ChartJS(pieCtx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: ['#AE4330', '#E4A176', '#C97253', '#8F2A19', '#663414', '#FFCF99'],
            hoverBackgroundColor: [
              '#c94d36', // hover para Luxahoston BTF
              '#f2b77d', // hover para Background
              '#e08a65', // hover para Tolsis Hotel
              '#a13a1f', // hover para City Rates
              '#7a3d1c', // hover para Lite
              '#ffd9a8'  // hover para Brin
            ]
          }]
        },
        options: {
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          },
          plugins: {
            legend: {
              display: true,
              position: 'right',
              align: 'center',
              labels: {
                color: '#333',
                font: { size: 13 }
              }
            }
          }
        }
      });
    }
  }

  // Doughnut Chart: Distribuição do tipo de alojamento
  const roomTypeCtx = document.getElementById('roomTypeChart') as HTMLCanvasElement | null;
  if (roomTypeChart) roomTypeChart.destroy();
  if (roomTypeCtx) {
    // Busca roomTypeDistribution do ano selecionado (2025,2024,2023) da cidade ou região
    let roomTypeDist: Record<string, number> = {};
    if (currentYearData.value && currentYearData.value.roomTypeDistribution) {
      roomTypeDist = currentYearData.value.roomTypeDistribution;
    }
    const labels = Object.keys(roomTypeDist);
    const data = Object.values(roomTypeDist) as number[];
    roomTypeChart = new ChartJS(roomTypeCtx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#AE4330', '#E4A176', '#C97253', '#8F2A19'],
          hoverBackgroundColor: [ '#c94d36', '#f2b77d', '#e08a65', '#a13a1f']
        }]
      },
      options: {
        animation: {
          duration: 1000,
          easing: 'easeOutQuart',
        },
        plugins: {
          legend: {
            display: true,
            position: 'right',
            align: 'center',
            labels: {
              color: '#333',
              font: { size: 13 }
            }
          },
          tooltip: {
            backgroundColor: '#000',
            borderColor: 'transparent',
            borderWidth: 0,
            titleColor: '#fff',
            bodyColor: '#fff'
          }
        }
      }});
    
    roomTypeCtx.style.display = '';
    if (roomTypeCtx.nextElementSibling && roomTypeCtx.nextElementSibling.classList.contains('no-roomtype-msg')) {
      roomTypeCtx.nextElementSibling.remove();
    }
  }

    const lineCtx1 = document.getElementById('lineChart1') as HTMLCanvasElement | null;
    if (lineChart1) lineChart1.destroy();
    if (lineCtx1) {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      lineChart1 = new ChartJS(lineCtx1, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Número de listagens',
            data: currentYearData.value.monthlyListings,
            borderColor: '#E4A176',
            backgroundColor: 'rgba(228, 161, 118, 0.1)',
            tension: 0.4,
            fill: true, 
            borderWidth: 2
          }]
        },
        options: {
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          },
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    const lineCtx2 = document.getElementById('lineChart2') as HTMLCanvasElement | null;
    if (lineChart2) lineChart2.destroy();
    if (lineCtx2) {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      lineChart2 = new ChartJS(lineCtx2, {
        type: 'line',
        data: {
          labels: months,
          datasets: [{
            label: 'Preço médio por noite (EUR)',
            data: currentYearData.value.monthlyPrices,
            borderColor: '#E4A176',
            backgroundColor: 'rgba(228, 161, 118, 0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 2
          }]
        },
        options: {
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          },
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }
  // (Bloco try/catch removido, pois não é necessário e estava causando erro de sintaxe)
};

const updateCharts = () => createCharts();
</script>

<template>
  <div class="explorar-root">
    <NavBar @export-click="openExportModal" />
    <div v-if="!entityAvailable" class="error-container">
      <h2>{{ isRegionMode ? 'Região não encontrada' : 'Cidade não encontrada' }}</h2>
      <p>Não conseguimos encontrar informações sobre {{ isRegionMode ? 'esta região' : 'esta cidade' }}.</p>
      <router-link to="/" class="btn-back">Voltar à página inicial</router-link>
    </div>
    <div v-else class="explorar-wrapper">
      <div class="header-outside-card header-page-title">
        <BtnVoltar class="btn-voltar" @click="handleVoltar">Voltar</BtnVoltar>
        <h1 class="city-title">{{ titleLabel }}</h1>
      </div>
      <div class="explorar-container explorar-container--with-title">
        <aside class="info-sidebar">
          <img :src="heroImage" :alt="titleLabel" class="city-image" />
          <div class="city-stats">
            <h3>Número de listagens: <strong>{{ currentYearData?.totalListings?.toLocaleString() ?? '—' }}</strong></h3>
            <h3>Preço médio por noite: <strong>{{ currentYearData?.averagePrice ?? '—' }}€</strong></h3>
            <h3>Noites reservadas (média): <strong>{{ currentYearData?.averageNights ?? '—' }}</strong></h3>
            <h3>Avaliação média: <strong>{{ baseRating }}</strong></h3>
            <h3>Ocupação média: <strong>{{ currentYearData?.occupancyRate || '—' }}%</strong></h3>
          </div>
          <button class="btn-comparar" @click="handleComparar">Comparar</button>
        </aside>
        <main class="charts-section">
          <div class="chart-grid">
            <div class="chart-wrapper chart-grid-item">
              <div class="chart-container">
                <h2 class="chart-title">Distribuição de Top Proprietários em {{ titleLabel }}</h2>
                <div class="canvas-wrapper">
                  <canvas id="pieChart"></canvas>
                </div>
              </div>
            </div>
            <div class="chart-wrapper chart-grid-item">
              <div class="chart-container">
                <h2 class="chart-title">Distribuição do tipo de alojamento em {{ titleLabel }}</h2>
                <div class="canvas-wrapper">
                  <canvas id="roomTypeChart"></canvas>
                </div>
              </div>
            </div>
            <div class="chart-wrapper chart-grid-item chart-grid-full">
              <div class="chart-container">
                <h2 class="chart-title">Tendência anual do número de listagens em {{ titleLabel }}</h2>
                <div class="canvas-wrapper">
                  <canvas id="lineChart1"></canvas>
                </div>
              </div>
            </div>
          </div>
          <div class="chart-wrapper">
            <div class="chart-container">
              <h2 class="chart-title">Tendência anual do preço médio por noite em {{ titleLabel }}</h2>
              <div class="canvas-wrapper">
                <canvas id="lineChart2"></canvas>
              </div>
            </div>
          </div>
          <div class="chart-wrapper table-wrapper">
            <div class="chart-container">
              <h2 class="chart-title">Tabela de alojamentos em {{ titleLabel }}</h2>
              <div class="table-scroll">
                <table class="listings-table">
                  <thead>
                    <tr>
                      <th>Alojamento</th>
                      <th>Região</th>
                      <th>Tipo</th>
                      <th>Preço médio (€)</th>
                      <th>Noites médias</th>
                      <th>Ocupação (%)</th>
                      <th>Avaliação</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in tableRows" :key="row.name + row.region">
                      <td>{{ row.name }}</td>
                      <td>{{ row.region }}</td>
                      <td>{{ row.type }}</td>
                      <td>{{ row.price.toLocaleString('pt-PT') }}</td>
                      <td>{{ row.nights }}</td>
                      <td>{{ row.occupancy !== null ? row.occupancy + '%' : '—' }}</td>
                      <td>{{ row.rating }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
        <aside class="right-placeholder-card">
          <div class="historic-block">
            <h3 class="historic-title">Histórico</h3>
            <div class="historic-dropdown">
              <YearSelect v-model="selectedYear" :years="availableYears" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
  
/* Cartão placeholder no espaço direito */
.right-placeholder-card {
  background: #FFEEDB;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  min-height: 200px;
  margin-bottom: 24px;
  padding: 0px 24px 24px 24px;
  grid-column: 3;
}
/* Header fora do card */
.header-outside-card {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-left: 0;
  margin-top: -8px;
  margin-bottom: 16px;
}

.header-page-title {
  margin-bottom: 10px;
  padding-left: 24px;
  padding-top: 20px;
}

.explorar-container--with-title {
  margin-top: 0;
  padding-top: 0 !important;
}
.historic-block {
  margin-top: 32px;
}
.historic-title {
  font-size: 20px;
  font-weight: 600;
  color: #cc8857;
  margin-bottom: 12px;
}
.explorar-root {
  font-family: Inter, Arial, sans-serif;
  background: var(--bg);
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.explorar-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}


.info-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #3b2f2c;
  margin-bottom: 16px;
}

.city-title {
  font-size: 28px;
  font-weight: 700;
  color: #2a1710;
  margin: 10px;
}

.explorar-container {
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 24px;
  padding: 0 24px 24px 24px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  align-items: start;
  height: 100%;
  margin-top: 0;
}

.info-sidebar {
  background: #FFEEDB;
  padding: 12px 24px 10px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  min-height: 0;
}

.city-image {
  width: 100%;
  height: 180px;
  border-radius: 8px;
  object-fit: cover;
  background-color: #eee;
  object-position: center;
}


.city-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.city-stats h3 {
  font-size: 13px;
  color: #3b2f2c;
  margin: 0 0 2px 0;
  line-height: 1.5;
  font-weight: 500;
}

.city-stats strong {
  font-weight: 700;
  display: block;
  margin-top: 4px;
}

.historic-dropdown {
  position: relative;
}



.btn-comparar {
  padding: 12px 16px;
  background: #FFCF99;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #3b2f2c;
  transition: all 0.2s;
}

.btn-comparar:hover {
  background: #ffcf998e;
  transform: scale(1.02);
}

.charts-section {
  width: 100%;
  margin: 0;
  overflow-y: auto;
  min-height: 0;
  height: 100%;
}

.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 32px;
}
.chart-grid-item {
  min-width: 0;
}
.chart-grid-full {
  grid-column: 1 / span 2;
}

/* --- Padronização dos gráficos de pizza --- */
.chart-wrapper {
  flex-shrink: 0;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 32px;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.chart-container {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
}

.canvas-wrapper {
  min-width: 320px;
  min-height: 320px;
  max-width: 320px;
  max-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}


.chart-container canvas {
  display: block;
}
/* --- Fim padronização dos gráficos de pizza --- */

.chart-wrapper {
  height: 420px;
  min-height: 420px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 32px;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.chart-wrapper-flex {
  display: flex;
  flex-direction: row;
  gap: 24px;
  height: 420px;
}

.chart-wrapper:nth-child(1) {
  height: 420px;
}

.chart-wrapper.listings-block {
  height: auto;
}

.table-wrapper {
  height: auto;
}

/* Cartão da tabela de alojamentos maior */
.chart-wrapper.table-wrapper {
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
}

/* Garantir tabela sempre 100% do cartão */
.chart-wrapper.table-wrapper {
  width: 100%;
  max-width: none;
  min-width: 0;
}

.chart-container {
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.table-scroll {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
}

.listings-table {
  width: 100%;
  min-width: 600px;
  max-width: 100%;
}

.listings-table th,
.listings-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #FFEEDB;
  text-align: left;
  font-size: 15px;
  color: #3b2f2c;
  background: white;
}

.listings-table th {
  background: #FFEEDB;
  font-weight: 700;
  position: sticky;
  top: 0;
  z-index: 1;
  font-size: 15px;
  height: 40px;
}

/* Linhas verticais na tabela de alojamentos */
.listings-table th:not(:last-child),
.listings-table td:not(:last-child) {
  border-right: 1px solid #FFEEDB;
}
/* --- FIM TABELA IGUAL À FOTO --- */
</style>