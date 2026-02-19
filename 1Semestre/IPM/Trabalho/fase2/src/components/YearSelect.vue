<template>
  <div class="year-select">
    <select :value="modelValue" class="filter-select" @change="onChange">
      <option v-for="year in normalizedYears" :key="year" :value="year">
        {{ year }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ years: number[]; modelValue: number }>();
const emit = defineEmits<{ (event: 'update:modelValue', value: number): void }>();

const normalizedYears = computed(() => {
  return [...new Set(props.years)].sort((a, b) => b - a);
});

const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:modelValue', Number(target.value));
};
</script>

<style scoped>
.year-select {
  width: 100%;
}

/*visual do menu dropdown do historico*/
.filter-select {
  width: 100%;
  padding: 12px 16px;
  background: #fff;
  border: 1px solid #f2e3d3;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #3b2f2c;
  transition: all 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%233b2f2c' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.filter-select:hover {
  border-color: var(--accent);
  background-color: #fafafa;
}

.filter-select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(255, 127, 128, 0.1);
}
</style>
