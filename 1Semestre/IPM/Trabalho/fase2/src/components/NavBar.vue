<template>
  <nav class="top-bar">
    <h1 class="site-title">Inside Airbnb</h1>
    <div class="top-actions">
      <router-link to="/about" class="icon-btn" title="Informações">
        <img src="/iconinfo.png" alt="info" />
      </router-link>
      <button class="icon-btn" title="Exportar dados" @click="$emit('export-click')">
        <img src="/downloadicon.png" alt="exportar" />
      </button>
      <router-link to="/" class="icon-btn" title="Página inicial">
        <img src="/homeicon.png" alt="home" />
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute();


</script>

<style scoped>
.top-bar {
  background: var(--accent);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.site-title {
  font-size: 32px;
  margin: 0;
  color: #090000;
  font-weight: 700;
}

.top-actions {
  display: flex;
  gap: 8px;
  z-index: 12;
}

.icon-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
  padding: 0;
  font-size: 18px;
  text-decoration: none;
}

.icon-btn img {
  width: 18px;
  height: 18px;
  display: block;
}

.icon-btn:hover {
  transform: scale(1.04);
}
</style>
