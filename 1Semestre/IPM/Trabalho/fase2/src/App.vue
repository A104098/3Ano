<!--
  InsideAirbnb - Plataforma de visualização de dados sobre alojamento local
  Permite explorar, filtrar e comparar dados de cidades, visualizar mapas, gráficos e exportar resultados.
  Desenvolvido para a UC de Interface Pessoa-Máquina (IPM) 2025/2026.
-->

<template>
  <router-view />
  <div v-if="showExportWarning" class="export-warning-popup-overlay">
    <div class="export-warning-popup">
      <button class="close-btn" @click="showExportWarning = false">×</button>
        <div class="popup-icon">
          <img src="/alert.png" alt="info" />
        </div>
        <div class="popup-title">Aviso!</div>
        <div class="popup-message">Sem dados para extrair nesta página.</div>
    </div>
  </div>

  <!-- Modal de confirmação de exportação -->
  <div v-if="showExportConfirm" class="export-warning-popup-overlay">
    <div class="export-warning-popup styled">
      <button class="close-btn" @click="showExportConfirm = false">×</button>
      <div class="popup-icon">
        <img src="/alert.png" alt="info" />
      </div>
      <div class="popup-title">Extração</div>
      <div class="popup-message">Deseja extrair os dados visíveis?</div>
      <div class="popup-actions">
        <button class="export-btn" @click="confirmExport">Extrair</button>
        <button class="cancel-btn" @click="showExportConfirm = false">Cancelar</button>
      </div>
    </div>
  </div>

  <!-- Toast de sucesso -->
  <div v-if="showExportSuccess" class="export-toast-success">
    Dados extraídos com sucesso!
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
// Removi o 'useRoute' pois não estava a ser usado


const showExportWarning = ref(false);
const showExportConfirm = ref(false);
const showExportSuccess = ref(false);

// Definimos que esta variável pode ser uma função ou null
let exportCallback: (() => void) | null = null;

const handleExportWarning = () => {
  showExportWarning.value = true;
};

// Tipamos o evento como 'Event' e fazemos o cast dentro da função
const handleExportConfirm = (e: Event) => {
  showExportConfirm.value = true;
  
  // Dizemos ao TS: "Confia em mim, isto é um CustomEvent"
  const event = e as CustomEvent;

  let cb = null;
  // A verificação 'in' continua útil para segurança em runtime
  if (event.detail && typeof event.detail.callback === 'function') {
    cb = event.detail.callback;
  }
  exportCallback = cb;
};

// Boas práticas: Adicionar listeners no Mount e remover no Unmount
onMounted(() => {
  window.addEventListener('show-export-warning', handleExportWarning);
  window.addEventListener('show-export-confirm', handleExportConfirm);
});

onUnmounted(() => {
  window.removeEventListener('show-export-warning', handleExportWarning);
  window.removeEventListener('show-export-confirm', handleExportConfirm);
});

function confirmExport() {
  showExportConfirm.value = false;
  if (exportCallback) {
    exportCallback();
    showExportSuccess.value = true;
    setTimeout(() => { showExportSuccess.value = false; }, 2200);
  }
  exportCallback = null;
}
</script>

<style>
:root {
  --export-warning-bg: #3b2f2c;
  --export-warning-color: #fff;
}

.export-warning-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.35);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.export-warning-popup {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  padding: 20px 32px 20px 32px;
  min-width: 320px;
  min-height: 100px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.export-warning-popup.styled {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  padding: 36px 32px 32px 32px;
  min-width: 340px;
  min-height: 160px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.popup-icon {
  margin-bottom: 10px;
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.popup-icon img {
  width: 48px;
  height: 50px;
  filter: drop-shadow(0 0 8px #e0e0e0);
}
.popup-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 8px;
  margin-top: 2px;
  letter-spacing: 0.01em;
}
.popup-message {
  font-size: 1.08rem;
  color: #444;
  text-align: center;
  margin-bottom: 2px;
  font-family: Inter, Arial, sans-serif;
}

.popup-actions {
  display: flex;
  gap: 16px;
  margin-top: 18px;
  justify-content: center;
}
.export-btn {
  background: #cc8857; 
  color: #fff;
  border: 1.5px solid #f2e3d3;
  border-radius: 8px;
  padding: 8px 22px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.export-btn:hover {
  background: #FFCF99;
}
.cancel-btn {
  background: #fff;
  color: #3b2f2c;
  border: 1.5px solid #f2e3d3;
  border-radius: 8px;
  padding: 8px 13px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.cancel-btn:hover {
  background: #f7efe8;
}

.close-btn {
  position: absolute;
  top: -18px;
  right: -18px;
  background: #fff;
  border: 2px solid #ccc;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 1.7rem;
  font-weight: bold;
  color: #222;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #eee;
}

.export-toast-success {
  position: fixed;
  bottom: 32px;
  right: 32px;
  background: #3b2f2c;
  color: #fff;
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 1.08rem;
  font-family: Inter, Arial, sans-serif;
  box-shadow: 0 2px 12px rgba(0,0,0,0.13);
  z-index: 10000;
  animation: fadeInOut 2.2s;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(20px); }
}

.popup-content {
  font-size: 1.2rem;
  color: #3b2f2c;
  text-align: center;
  margin-top: 30px;
  font-family: Inter, Arial, sans-serif;
}
:root {
  --bg: #f7efe8;
  --accent: #d97768;
  --card: #fdeee5;
  --muted: #7a5a53;
}

html, body, #app { height: 100%; margin: 0 }
body { font-family: Inter, Arial, sans-serif; background: #f7efe8 }
</style>
