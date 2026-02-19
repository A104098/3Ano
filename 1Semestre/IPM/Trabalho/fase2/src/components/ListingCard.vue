<template>
  <div class="listing-card">
    <div class="card-image">
      <img :src="imageSrc" :alt="listing.title" @error="onImgError" />
    </div>
    <div class="card-content">
      <h3 class="title">{{ listing.title }}</h3>
      <p class="meta">{{ listing.city }} · {{ listing.region }}</p>
      <p class="type">{{ listing.type }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Listing } from '../data/cities';

const props = defineProps<{ listing: Listing }>();

const imageSrc = ref(props.listing.image || '/placeholder.svg');

const onImgError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  if (target) target.src = '/placeholder.svg';
};
</script>

<style scoped>
.listing-card {
  background: var(--card);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.card-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 16px;
}

.title {
  margin: 0 0 6px 0;
  font-size: 15px;
  color: #2f2a28;
}

.meta {
  color: var(--muted);
  font-size: 13px;
  margin: 0 0 6px 0;
}

.type {
  font-weight: 600;
  color: var(--accent);
  margin: 0;
  font-size: 13px;
}
</style>
