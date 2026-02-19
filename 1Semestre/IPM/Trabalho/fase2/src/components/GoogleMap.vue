<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="map"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import L from 'leaflet';

interface MapProps {
  cityName: string;
  lat: number;
  lng: number;
  zoom?: number;
  regionName?: string;
}

const props = withDefaults(defineProps<MapProps>(), {
  zoom: 13,
  regionName: undefined
});

const mapContainer = ref<HTMLDivElement | null>(null);
let map: any = null;
let marker: any = null;

onMounted(() => {
  initMap();
});

watch(() => [props.lat, props.lng], () => {
  if (map) {
    updateMap();
  }
});

const initMap = () => {
  if (!mapContainer.value) {
    console.error('Container do mapa não encontrado');
    return;
  }
  
  console.log(`Inicializando mapa para ${props.cityName} em (${props.lat}, ${props.lng})`);
  
  try {
    // Criar mapa
    map = L.map(mapContainer.value).setView([props.lat, props.lng], props.zoom);

    // Adicionar tile layer do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Adicionar marcador
    marker = L.marker([props.lat, props.lng], {
      title: props.cityName,
    }).addTo(map);

    // Popup do marcador
    const markerLabel = props.regionName 
      ? `<strong>${props.regionName}</strong><br>${props.cityName}`
      : `<strong>${props.cityName}</strong>`;
    
    marker.bindPopup(`${markerLabel}<br>Lat: ${props.lat.toFixed(4)}<br>Lng: ${props.lng.toFixed(4)}`);
    marker.openPopup();

    console.log('Mapa criado com sucesso');
  } catch (error) {
    console.error('Erro ao criar mapa:', error);
    showErrorMap();
  }
};

const updateMap = () => {
  if (!map || !marker) {
    console.warn('Mapa ou marcador não inicializados ainda');
    return;
  }

  console.log(`Atualizando mapa para (${props.lat}, ${props.lng})`);

  map.setView([props.lat, props.lng], props.zoom);
  marker.setLatLng([props.lat, props.lng]);

  const markerLabel = props.regionName 
    ? `<strong>${props.regionName}</strong><br>${props.cityName}`
    : `<strong>${props.cityName}</strong>`;

  marker.setPopupContent(`
    ${markerLabel}
    <br>Lat: ${props.lat.toFixed(4)}
    <br>Lng: ${props.lng.toFixed(4)}
  `);
};


const showErrorMap = () => {
  if (!mapContainer.value) return;
  mapContainer.value.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #f0f0f0; color: #666;">
      <div style="text-align: center;">
        <p>Erro ao carregar o mapa</p>
        <small>${props.cityName}</small>
      </div>
    </div>
  `;
};
</script>

<style scoped>
.map-wrapper {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 100%;
}
</style>
