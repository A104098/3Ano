<template>
  <button :class="['btn-voltar', sizeClass]" @click="handleBack">
    Voltar
  </button>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';

const props = defineProps<{ size?: string }>();
const router = useRouter();
const route = useRoute();

const handleBack = () => {
  router.back();
};

const sizeClass = computed(() =>
  props.size ? `btn-voltar--${props.size}` : ''
);
</script>


<style scoped>
.btn-voltar {
padding: 10px 24px;
background: #FFCF99;
border: none ;
border-radius: 8px;
cursor: pointer;
font-weight: 600;
text-decoration: none;
color: #3b2f2c;
transition: all 0.2s;
white-space: nowrap;
}

.btn-voltar:hover {
  background: #ffcf998e;
  transform: scale(1.02);
}

.btn-voltar--grande {
  flex:1;  /*ocupa todo o espaço disponível */
  padding: 12px 24px;
}

</style>
