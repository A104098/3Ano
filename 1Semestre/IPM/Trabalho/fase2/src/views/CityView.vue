<template>
  <div class="city-root">
    <NavBar @export-click="handleExportClick" />
    
    <div v-if="!cityData" class="error-container">
      <h2>Cidade não encontrada</h2>
      <p>Não conseguimos encontrar informações sobre esta cidade.</p>
      <BtnVoltar class="btn-back">Voltar à página inicial</BtnVoltar>
    </div>

    <div v-else class="city-container">
      <aside class="filters-sidebar">
        <div class="filters-header">
          <h3>Filtrar por:</h3>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Pesquisar região..." 
            class="search-bar"
          />
        </div>

        <div class="region-helper">
          <p class="region-hint">Escreve para procurar regiões. Seleciona para explorar essa região.</p>
          <div class="region-status">
            <span class="pill" v-if="activeRegion">Região ativa: {{ activeRegion }}</span>
            <span class="pill pill-muted" v-else>Nenhuma região selecionada</span>
            <button
              v-if="activeRegion"
              class="pill pill-clear"
              @click="clearRegion"
            >Limpar</button>
          </div>

          <div v-if="regionSuggestions.length" class="region-suggestions">
            <p class="suggestions-title">Sugestões:</p>
            <div class="suggestions-grid">
              <button
                v-for="region in regionSuggestions"
                :key="region.name"
                class="suggestion-card"
                :class="{ active: region.name === activeRegion }"
                @click="setActiveRegion(region.name)"
              >
                {{ region.name }}
              </button>
            </div>
          </div>
        </div>
        
        <div class="filters-row">
          <div class="filter-group">
            <label class="filter-label">Tipo de Habitação</label>
            <select v-model="filters.type" class="filter-select">
              <option value="">Todos</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Casa">Casa</option>
              <option value="Quarto">Quarto</option>
            </select>
          </div>

          <div class="filter-group">
            <label class="filter-label">Preço</label>
            <select v-model="filters.priceOrder" class="filter-select">
              <option value="">Sem ordenação</option>
              <option value="asc">Ascendente (↑)</option>
              <option value="desc">Descendente (↓)</option>
            </select>
          </div>
        </div>

        <h4 class="section-title">Alojamentos populares em {{ cityData.name }}</h4>
        
        <div class="listings-grid">
          <ListingCard
            v-for="listing in filteredListings"
            :key="listing.id"
            :listing="listing"
          />
        </div>
      </aside>
      <main class="map-section">
        <div class="city-card">
          <div class="map-container">
            <GoogleMap 
                v-if="mapCoordinates"
                :cityName="cityData.name"
                :lat="mapCoordinates.lat"
                :lng="mapCoordinates.lng"
                :regionName="mapRegionName"
              />

            <h2 class="city-name">
              {{ displayedStats?.name }}
            </h2>
            </div>

            <div class="city-stats" v-if="displayedStats">
            <p>
              <strong>Preço médio por noite:</strong>
              {{ displayedStats.averagePrice }}€
            </p>

            <p>
              <strong>Média de noites reservadas:</strong>
              {{ displayedStats.averageNights }}
            </p>

            <p>
              <strong>Avaliação média:</strong>
              {{ displayedStats.rating }}
            </p>
            </div>
          <div class="action-buttons">
            <button class="btn-explore" @click="handleExplorar">Explorar mais</button>
            <BtnVoltar size="grande">Voltar</BtnVoltar>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { storeToRefs } from 'pinia'


function handleExportClick() {
  window.dispatchEvent(new Event('show-export-warning'));
}
import GoogleMap from '../components/GoogleMap.vue';
import ListingCard from '../components/ListingCard.vue';
import BtnVoltar from '../components/BtnVoltar.vue';
import { useMainStore } from '../stores/mainStore';
const mainStore = useMainStore()
const { selectedCity } = storeToRefs(mainStore)

const route = useRoute();
const router = useRouter();
const searchQuery = ref('')



// Região ativa (selecionada automaticamente)
const activeRegion = ref<string | null>(null);

const filters = ref({
  type: route.query.type?.toString() || '',
  priceOrder: route.query.order?.toString() || ''
});

const handleExplorar = () => {
  const cityName = route.params.city as string;
  if (activeRegion.value) {
    router.push({ name: 'explorar-regiao', params: { city: cityName, region: activeRegion.value } });
  } else {
    router.push(`/explorar/${cityName}`);
  }
};

watch(
  () => route.query,
  (query) => {
    searchQuery.value = query.search?.toString() || ''
    filters.value.type = query.type?.toString() || ''
    filters.value.priceOrder = query.order?.toString() || ''
  },
  { immediate: true }
)

watch(
  () => [searchQuery.value, filters.value.type, filters.value.priceOrder],
  () => {
    router.push({
      query: {
        ...route.query,
        search: searchQuery.value || undefined,
        type: filters.value.type || undefined,
        order: filters.value.priceOrder || undefined
      }
    })
  }
)


watch(
  () => route.params.city,
  (slug) => {
    mainStore.selectCityBySlug(slug as string)
  },
  { immediate: true }
)

const cityData = selectedCity


const filteredListings = computed(() => {
  if (!cityData.value) return [];
  
  let listings = [...cityData.value.listings];
  
  // Se houver região ativa, mostra apenas listings dessa região
  if (activeRegion.value) {
    listings = listings.filter(l => l.region.toLowerCase() === activeRegion.value?.toLowerCase());
  } else if (searchQuery.value) {
    // fallback: filtrar por texto enquanto não seleciona
    listings = listings.filter(l =>
    l.region.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
  }
  
  // Filtrar por tipo
  if (filters.value.type) {
    listings = listings.filter(l => l.type === filters.value.type);
  }
  
  // Ordenar por preço (usando o ID como proxy para preço neste exemplo)
  // adicionar propriedade 'price' nos listings quando tiver dados reais
  if (filters.value.priceOrder === 'asc') {
    listings.sort((a, b) => a.id - b.id);
  } else if (filters.value.priceOrder === 'desc') {
    listings.sort((a, b) => b.id - a.id);
  }
  
  return listings;
});


const normalizedQuery = computed(() =>
  searchQuery.value.trim().toLowerCase()
);

// Obter coordenadas da região selecionada, usando a reatividaede do Vue
const matchedRegions = computed(() => {
  if (!cityData.value || !searchQuery.value) return [];

  return cityData.value.regions.filter(region =>
    region.name.toLowerCase().includes(normalizedQuery.value)
  );
});

const regionSuggestions = computed(() => matchedRegions.value);

const selectedRegionData = computed(() => {
  const targetName = activeRegion.value;
  if (!cityData.value || !targetName) return null;
  return cityData.value.regions.find(r => r.name.toLowerCase() === targetName.toLowerCase()) || null;
});

const mapCoordinates = computed(() => {
  if (selectedRegionData.value) {
    return selectedRegionData.value.coordinates;
  }

  return cityData.value?.coordinates ?? null;
});

const mapRegionName = computed(() => {
  return selectedRegionData.value?.name;
});


const displayedStats = computed(() => {
  if (selectedRegionData.value) {
    return {
      name: selectedRegionData.value.name,
      averagePrice: selectedRegionData.value.averagePrice,
      averageNights: selectedRegionData.value.averageNights,
      rating: selectedRegionData.value.rating,
      isRegion: true
    };
  }

  if (cityData.value) {
    return {
      name: cityData.value.name,
      averagePrice: cityData.value.averagePrice,
      averageNights: cityData.value.averageNights,
      rating: cityData.value.rating,
      isRegion: false
    };
  }

  return null;
});

/* nao faz nada este bloco, depois da apresentação retirar*/
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = "/Londond.jpg";
};

const setActiveRegion = (regionName: string) => {
  activeRegion.value = regionName;
};

const clearRegion = () => {
  activeRegion.value = null;
};

// Seleção automática quando só há um resultado
watch(matchedRegions, (regions) => {
  if (regions.length === 1) {
    activeRegion.value = regions[0].name;
  }
});


</script>

<style scoped>
.city-root {
  font-family: Inter, Arial, sans-serif;
  background: var(--bg);
  min-height: 100vh;
}

.error-container {
  padding: 60px 24px;
  text-align: center;
}


.city-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.filters-sidebar {
  background: #FFF8F0;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.filters-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.region-helper {
  background: #fff;
  border: 1px solid #f2e3d3;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.region-hint {
  margin: 0;
  font-size: 12px;
  color: #6a5349;
}

.region-status {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pill {
  background: #ffefdd;
  color: #8a4a2f;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  border: 1px solid #f2e3d3;
}

.pill-muted {
  background: #f5f5f5;
  color: #777;
  border-color: #f2e3d3;
}

.pill-clear {
  background: #fff;
  cursor: pointer;
}



.region-suggestions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.suggestions-title {
  margin: 0;
  font-size: 13px;
  color: #3b2f2c;
  font-weight: 600;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.suggestion-card {
  padding: 10px;
  border: 1px solid #f2e3d3;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  font-weight: 600;
  color: #3b2f2c;
  transition: all 0.2s;
}

.suggestion-card:hover {
  border-color: #f2e3d3;
  background: #fff8f2;
}

.suggestion-card.active {
  border-color: #f2e3d3;
  background: #ffefdd;
}

.filters-sidebar h3 {
  margin: 0;
  font-size: 18px;
  color: #3b2f2c;
  white-space: nowrap;
}

.search-bar {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #f2e3d3;
  border-radius: 8px;
  font-size: 14px;
  font-family: Inter, Arial, sans-serif;
  color: #3b2f2c;
  transition: border-color 0.2s;
}

.search-bar::placeholder {
  color: #999;
}

.search-bar:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.1);
}

.filters-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.filter-group {
  margin-bottom: 0;
}

.filter-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #3b2f2c;
  font-size: 14px;
}

.filter-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #f2e3d3;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  
}

.section-title {
  margin: 24px 0 16px 0;
  font-size: 16px;
  color: #3b2f2c;
}

.listings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.listing-item {
  cursor: pointer;
}

.listing-image {
  width: 100%;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
  background: #f0f0f0;
}

.listing-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.listing-title {
  font-size: 13px;
  color: #3b2f2c;
  margin: 0;
  font-weight: 500;
}

.map-section {
  display: flex;
  align-items: flex-start;
}

.city-card {
  background: #FFEEDB;
  padding: 24px;
  border-radius: 12px;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);

}

.map-container {
  position: relative;
  margin-bottom: 20px;
  height: 400px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.map-image {
  width: 100%;
  border-radius: 12px;
  height: auto;
  max-height: 400px;
  object-fit: cover;
}

.city-name {
  position: absolute;
  bottom: 16px;
  right: 16px;
  color: #3b2f2c;
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(255,255,255,0.5);
}

.city-stats {
  margin-bottom: 20px;
}

.city-stats p {
  margin: 8px 0;
  color: #3b2f2c;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn-explore {
  flex: 1;
  padding: 12px 24px;
  background: #FFCF99;
  border: none;
  border-radius: 8px;
  color: #3b2f2c;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-explore:hover {
  background: #ffcf998e;
  transform: scale(1.02);
}



@media (max-width: 900px) {
  .city-container {
    grid-template-columns: 1fr;
  }
  
  .listings-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
