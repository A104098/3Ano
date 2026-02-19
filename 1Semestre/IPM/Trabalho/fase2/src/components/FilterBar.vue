<!-- Componente de barra de filtros para pesquisa e seleção de regiões, tipo de habitação e preço. -->
<template>
  <div class="filter-bar">
    <input type="text" placeholder="Filtrar..." class="filter-input" />
    <button class="filter-btn">Filtrar</button>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.filter-bar {
  display: flex;
  gap: 10px;
  padding: 10px;
}

.filter-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.filter-btn {
  padding: 8px 16px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
