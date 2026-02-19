// Store principal para gestão de estado global da aplicação (cidades, filtros, seleções, etc.)
import { defineStore } from 'pinia'
import { getCityBySlug, type CityData } from '../data/cities'

export const useMainStore = defineStore('main', {
  state: () => ({
    selectedCity: null as CityData | null,
    selectedYear: 2025,
  }),

  actions: {
    selectCityBySlug(slug: string) {
      this.selectedCity = getCityBySlug(slug)
    },

    setSelectedYear(year: number) {
      this.selectedYear = year
    },
  }
})
