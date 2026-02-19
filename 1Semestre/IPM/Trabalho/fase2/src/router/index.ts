import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import PagCasesEmb from '../views/PagCasesEmb.vue'
import CityView from '../views/CityView.vue'
import ExplorarView from '../views/ExplorarView.vue'
import CompareView from '../views/CompareView.vue'
import CompareResultsView from '../views/CompareResultsView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: AboutView
  },
  {
    path: "/pag-cases-emb",
    name: "pag-cases-emb",
    component: PagCasesEmb
  },
  {
    path: '/city/:city',
    name: 'city',
    component: CityView
  },
  {
    path: '/explorar/:city/regiao/:region',
    name: 'explorar-regiao',
    component: ExplorarView
  },
  {
    path: '/explorar/:city',
    name: 'explorar',
    component: ExplorarView
  },
  {
    path: '/compare/regiao/:city/:region',
    name: 'compare-regiao',
    component: CompareView
  },
  {
    path: '/compare/:city',
    name: 'compare',
    component: CompareView
  },
  {
    path: '/compare-results/:city1/:city2',
    name: 'compare-results',
    component: CompareResultsView
  },
]

export default createRouter({
  history: createWebHistory(),
  routes
})

