
<template>
  <div class="compare-root">
    <NavBar @export-click="handleExportClick" />
    
    <div class="compare-wrapper">
      <!-- Main content -->
      <main class="compare-container">
        <div class="header-with-back">
          <h2 class="section-title">Selecionar outro local para comparação</h2>
          <BtnVoltar />
        </div>

        <!-- Info Badge -->
        <div class="info-badge">
          Comparando: <strong>{{ badgeText }}</strong>
        </div>

        <!-- Search Bar -->
        <div class="search-container">
          <input 
            v-model="searchQuery"
            type="text" 
            :placeholder="searchPlaceholder" 
            class="search-input"
            @keydown.escape="searchQuery = ''"
          />
          <span class="search-icon">🔎︎</span>
        </div>

        <!-- Selection Grid -->
        <div class="cities-grid">
          <!-- Primeira seleção (sempre definida) -->
          <div class="city-card selected">
            <img :src="selectedImage" :alt="selectedLabel" class="city-image" />
            <h3 class="city-name">{{ selectedLabel }}</h3>
          </div>

          <!-- Segunda seleção -->
          <div class="city-card selectable" :class="{ 'has-selection': !!secondLabel }">
            <img
              v-if="secondLabel"
              :src="secondImage"
              :alt="secondLabel"
              class="city-image"
              @error="($event.target as HTMLImageElement).src = '/placeholder.svg'"
            />
            <h3 class="city-name" v-if="secondLabel">{{ secondLabel }}</h3>
            <div v-else class="empty-state">Selecionar</div>
          </div>
        </div>

        <!-- Filtered List -->
        <div v-if="searchQuery && filteredItems.length > 0" class="cities-list">
          <h3 class="list-title">Selecionar {{ listTitle }}:</h3>
          <div class="cities-buttons">
            <button 
              v-for="item in filteredItems"
              :key="item.key"
              @click="selectSecond(item)"
              class="city-btn"
              :class="{ 'selected-btn': secondKey === item.key }"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message">
          ⚠️ {{ errorMessage }}
        </div>

        <!-- Compare Button -->
        <div class="button-container">
          <button 
            @click="handleCompare"
            :disabled="!secondKey"
            :class="['btn-comparar', { 'btn-comparar-disabled': !secondKey }]"
          >
            Comparar
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import BtnVoltar from '../components/BtnVoltar.vue';
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NavBar from '../components/NavBar.vue';

function handleExportClick() {
  window.dispatchEvent(new Event('show-export-warning'));
}
import { getCitiesList, getCityBySlug } from '../data/cities';
import {
  formatCityLabel,
  formatRegionLabel
} from '../utils/locationFormat';


const route = useRoute();
const router = useRouter();
type RegionItem = { city: string; region: string; key: string; label: string };

function getHeroImage(citySlug: string, regionName?: string) {
  const city = getCityBySlug(citySlug.toLowerCase())
  if (!city) return '/placeholder.svg'

  if (regionName) {
    return (
      city.regions.find(
        r => r.name.toLowerCase() === regionName.toLowerCase()
      )?.heroImage || '/placeholder.svg'
    )
  }

  return city.heroImage || '/placeholder.svg'
}

const baseCityParam = computed(() => (route.params.city as string) || '');
const baseRegionParam = computed(() => (route.params.region as string | undefined));

const isRegionMode = computed(() => !!baseRegionParam.value);

const selectedLabel = computed(() => {
  if (isRegionMode.value && baseRegionParam.value) {
    return formatRegionLabel(baseRegionParam.value, baseCityParam.value);
  }
  return formatCityLabel(baseCityParam.value);
});


const badgeText = computed(() => (isRegionMode.value ? 'Regiões' : 'Cidades'));
const searchPlaceholder = computed(() => (isRegionMode.value ? 'Procurar região...' : 'Procurar cidade...'));
const listTitle = computed(() => (isRegionMode.value ? 'região' : 'cidade'));

const searchQuery = ref('');
const secondCity = ref<string | null>(null);
const secondRegion = ref<RegionItem | null>(null);
const errorMessage = ref('');

const allCities = computed(() => getCitiesList().map(city => city.name));


const allRegions = computed<RegionItem[]>(() =>
  getCitiesList().flatMap(city =>
    city.regions.map(region => ({
      city: city.name,
      region: region.name,
      key: `${city.name.toLowerCase()}-${region.name.toLowerCase()}`,
      label: formatRegionLabel(region.name, city.name)
    }))
  )
)

const filteredItems = computed(() => {
  const q = searchQuery.value.toLowerCase();

  if (isRegionMode.value) {
    const currentKey = `${baseCityParam.value.toLowerCase()}-${baseRegionParam.value?.toLowerCase()}`;
    return allRegions.value
      .filter(item => item.key !== currentKey)
      .filter(item =>
        item.region.toLowerCase().includes(q) || item.city.toLowerCase().includes(q)
      );
  }

  // cities mode
  return allCities.value
    .filter(city => city.toLowerCase() !== baseCityParam.value.toLowerCase())
    .filter(city => city.toLowerCase().includes(q))
    .map(city => ({
      city,
      region: '',
      key: city.toLowerCase(),
      label: city
    }));
});

const secondKey = computed(() => {
  if (isRegionMode.value) return secondRegion.value?.key || '';
  return secondCity.value || '';
});

const secondLabel = computed(() => {
  if (isRegionMode.value) return secondRegion.value?.label || '';
  return secondCity.value || '';
});

const selectedImage = computed(() =>
  getHeroImage(baseCityParam.value, isRegionMode.value ? baseRegionParam.value : undefined)
);

const secondImage = computed(() => {
  if (isRegionMode.value && secondRegion.value) {
    return getHeroImage(secondRegion.value.city, secondRegion.value.region);
  }
  if (secondCity.value) {
    return getHeroImage(secondCity.value);
  }
  return '/placeholder.svg';
});


const selectSecond = (item: RegionItem) => {
  if (isRegionMode.value) {
    secondRegion.value = item as RegionItem;
  } else {
    secondCity.value = item.city;
  }
  searchQuery.value = '';
  errorMessage.value = '';
};

const handleCompare = () => {
  if (!secondKey.value) return;

  if (isRegionMode.value) {
    router.push({
      name: 'compare-results',
      params: {
        city1: `${baseCityParam.value.toLowerCase()}-${(baseRegionParam.value || '').toLowerCase()}`,
        city2: `${secondRegion.value?.city.toLowerCase()}-${secondRegion.value?.region.toLowerCase()}`
      }
    });
    return;
  }

  router.push({
    name: 'compare-results',
    params: {
      city1: baseCityParam.value.toLowerCase(),
      city2: (secondCity.value || '').toLowerCase()
    }
  });
};
</script>
<style scoped>
.compare-root {
  font-family: Inter, Arial, sans-serif;
  background: #FFF8F0;
  min-height: 100vh;
  color: #3b2f2c;
}

.compare-wrapper {
  display: flex;
  flex-direction: column;
}

.compare-container {
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  padding: 32px 24px;
}

.header-with-back {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #3b2f2c;
  margin: 0;
}

.search-container {
  position: relative;
  margin-bottom: 24px;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 12px 16px 12px 40px;
  border: 1px solid #f2e3d3;
  border-radius: 8px;
  font-size: 14px;
  font-family: Inter, Arial, sans-serif;
}

.search-input:focus {
  outline: none;
  border-color: 1px solid #f2e3d3;
  background-color: #fffbf7;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 45%;
  transform: translateY(-50%);
  color: #999;
}

/* Info Badge */
.info-badge {
  display: inline-block;
  background: #fff0e6;
  color: #cc8857;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  margin-bottom: 24px;
  border: 1px solid #ffcf99;
}

.info-badge strong {
  color: #cc8857;
  font-weight: 600;
}

.cities-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.city-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.city-card.selectable {
  transition: all 0.2s;
  border: 2px solid transparent;
}

.city-card.selectable:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.city-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.placeholder {
  width: 100%;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8e8e8;
}

.placeholder-icon {
  font-size: 48px;
  opacity: 0.5;
}

.city-name {
  padding: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #cc8857;
  margin: 0;
  text-align: center;
}

.empty-state {
  padding: 16px;
  color: #999;
  text-align: center;
}

/* Cidades List */
.cities-list {
  margin: 24px 0;
  padding: 20px;
  background: #FFEEDB;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.list-title {
  font-size: 14px;
  font-weight: 600;
  color: #3b2f2c;
  margin: 0 0 16px 0;
}

.cities-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.city-btn {
  padding: 10px 16px;
  border: 1px solid #f2e3d3;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #3b2f2c;
  font-size: 13px;
  transition: all 0.2s;
}

.city-btn:hover {
  background: #ffcf998e;
  border-color: #ffcf99;
}

.city-btn.selected-btn {
  background: #ffcf99;
  border-color: #ffcf99;
  font-weight: 600;
}

/* Error Message */
.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin: 16px 0;
  border: 1px solid #ffcdd2;
}

.button-container {
  display: flex;
  justify-content: center;
}

.btn-comparar {
  background: #ffcf99;
  color: #3b2f2c;
  border: none ;
  padding: 14px 40px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-comparar:hover {
  background: #ffcf998e;
  transform: scale(1.02);
}


.btn-comparar.btn-comparar-disabled:hover,
.btn-comparar:disabled:hover {
  background: #e0e0e0;
  color: #a0a0a0;
  cursor: not-allowed;
  transform: none;
}

.btn-comparar.btn-comparar-disabled,
.btn-comparar:disabled {
  background: #ffcf998e;
  color: #000;
  cursor: not-allowed;
  border: none;
  transform: none;
}



.btn-comparar:hover {
  background: #ffcf998e;
  transform: scale(1.02);
}

@media (max-width: 768px) {
  .cities-grid {
    grid-template-columns: 1fr;
  }

  .compare-container {
    padding: 24px 16px;
  }

  .header-top {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style>
