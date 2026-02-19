<template>
  <div class="compare-root">
    <NavBar @export-click="handleExportClick" />
    <div class="content">
      <div class="header">
        <BtnVoltar />
        <div>
          <p class="eyebrow">Comparação</p>
          <h1>{{ leftCard?.label || '—' }} vs {{ rightCard?.label || '—' }}</h1>
        </div>
      </div>

      <div class="cards">
        <div class="card" v-if="leftCard">
          <div class="card-header">
            <div class="badge">{{ leftCard.scope }}</div>
            <h2>{{ leftCard.label }}</h2>
            <p class="subtitle">{{ leftCard.subtitle }}</p>
          </div>
          <div class="metrics">
            <div class="metric">
              <span>Preço médio/noite</span>
              <strong>{{ leftCard.averagePrice }}€</strong>
            </div>
            <div class="metric">
              <span>Noites reservadas (média)</span>
              <strong>{{ leftCard.averageNights }}</strong>
            </div>
            <div class="metric">
              <span>Avaliação média</span>
              <strong>{{ leftCard.rating }}</strong>
            </div>
          </div>
        </div>

        <div class="card" v-if="rightCard">
          <div class="card-header">
            <div class="badge">{{ rightCard.scope }}</div>
            <h2>{{ rightCard.label }}</h2>
            <p class="subtitle">{{ rightCard.subtitle }}</p>
          </div>
          <div class="metrics">
            <div class="metric">
              <span>Preço médio/noite</span>
              <strong>{{ rightCard.averagePrice }}€</strong>
            </div>
            <div class="metric">
              <span>Noites reservadas (média)</span>
              <strong>{{ rightCard.averageNights }}</strong>
            </div>
            <div class="metric">
              <span>Avaliação média</span>
              <strong>{{ rightCard.rating }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Handler para abrir modal global ao clicar no botão da NavBar
function handleExportClick() {
  // Dispara evento global para mostrar modal de exportação
  window.dispatchEvent(new CustomEvent('show-export-confirm', { detail: { callback: exportData } }));
}
import BtnVoltar from '../components/BtnVoltar.vue';
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import NavBar from '../components/NavBar.vue';
import { formatRegionLabel } from '../utils/locationFormat';
import { getCityBySlug } from '../data/cities';

const router = useRouter();
const route = useRoute();

type CompareCard = {
  scope: string;
  label: string;
  subtitle: string;
  averagePrice: number | string;
  averageNights: number | string;
  rating: number | string;
};

const normalizeParam = (param: string | string[] | undefined) => {
  if (!param) return '';
  return Array.isArray(param) ? param[0] : param;
};

const buildCard = (param: string): CompareCard | null => {
  if (!param) return null;

  const [citySlug, regionSlug] = param.split('-');

  const city = getCityBySlug(citySlug);
  if (!city) return null;

  if (!regionSlug) {
    return {
      scope: 'Cidade',
      label: city.name,
      subtitle: city.country,
      averagePrice: city.averagePrice,
      averageNights: city.averageNights,
      rating: city.rating
    };
  }

  const region = city.regions.find(
    r => r.name.toLowerCase() === regionSlug.toLowerCase()
  );
  if (!region) return null;

  return {
    scope: 'Região',
    label: formatRegionLabel(region.name, city.name),
    subtitle: city.country,
    averagePrice: region.averagePrice,
    averageNights: region.averageNights,
    rating: region.rating
  };
};


const leftCard = computed(() => buildCard(normalizeParam(route.params.city1)));
const rightCard = computed(() => buildCard(normalizeParam(route.params.city2)));

const handleVoltar = () => {
  router.back();
};

// Exportação CSV simples para comparação
function exportData() {
  // Garante que só objetos válidos (CompareCard) entram
  const cards = [leftCard.value, rightCard.value].filter((c): c is CompareCard => c !== null);
  if (!cards.length) return;
  // Cabeçalhos em português e ordem correta
  const header = ['Tipo', 'Nome', 'País', 'Preço médio/noite', 'Noites reservadas (média)', 'Avaliação média'];
  const csv = [header.join(';')]
    .concat(cards.map((r) => [
      r.scope,
      r.label,
      r.subtitle,
      r.averagePrice,
      r.averageNights,
      r.rating
    ].join(';')))
    .join('\n');
  // Adiciona BOM UTF-8 para Excel reconhecer acentos
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dados_comparacao.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

onMounted(() => {
  window.addEventListener('do-export-data', () => {
    handleExportClick();
  });
});
</script>

<style scoped>
.export-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.export-modal-content.styled-modal {
  background: #fff;
  padding: 32px 24px 24px 24px;
  border-radius: 20px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.12);
  text-align: center;
  min-width: 320px;
  position: relative;
}
.icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 8px;
}
.icon-alert {
  font-size: 36px;
  color: #b97a3c;
  background: #fff6e9;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: inline-block;
}
.export-modal-content.styled-modal h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 10px 0 6px 0;
}
.export-modal-content.styled-modal p {
  color: #6b4f3f;
  font-size: 1.1rem;
  margin-bottom: 18px;
}
.modal-btns {
  display: flex;
  justify-content: center;
  gap: 12px;
}
.styled-btn {
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: 8px;
  padding: 10px 24px;
  border: 1.5px solid #b97a3c;
  background: #fff;
  color: #b97a3c;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.btn-confirm.styled-btn {
  background: #b97a3c;
  color: #fff;
  border: 1.5px solid #b97a3c;
}
.btn-confirm.styled-btn:hover {
  background: #a86a2c;
}
.btn-cancel.styled-btn:hover {
  background: #f5e6d6;
}
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #fff;
  border: 1.5px solid #ccc;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 1.3rem;
  color: #333;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}
.compare-root { font-family: Inter, Arial, sans-serif; background: #FFF8F0; min-height: 100vh; color: #3b2f2c; }
.content { max-width: 1000px; margin: 32px auto; background: #fff; padding: 24px; border-radius: 16px; box-shadow: 0 6px 24px rgba(0,0,0,0.08); }
.header { display: flex; gap: 16px; align-items: center; margin-bottom: 20px; }
.eyebrow { margin: 0; text-transform: uppercase; font-size: 12px; letter-spacing: 0.06em; color: #8a6b5a; }
h1 { margin: 4px 0 0 0; font-size: 24px; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
.card { background: #FFF8F0; border-radius: 14px; padding: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); }
.card-header { margin-bottom: 12px; }
.badge { display: inline-block; padding: 6px 10px; border-radius: 999px; background: #ffe7c7; font-size: 12px; font-weight: 700; color: #6b4f3f; }
.subtitle { margin: 4px 0 0 0; color: #7a6a60; font-size: 13px; }
.metrics { display: grid; gap: 10px; }
.metric { display: flex; justify-content: space-between; align-items: center; background: #fff; border: 1px solid #f0d9c0; border-radius: 10px; padding: 10px 12px; }
.metric span { color: #6b4f3f; font-size: 13px; }
.metric strong { font-size: 16px; }
</style>
