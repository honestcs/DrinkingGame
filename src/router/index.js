import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Revolver from '../views/Revolver.vue'
import Dice from '../views/Dice.vue'
import TruthOrDare from '../views/TruthOrDare.vue'
import MostLikely from '../views/MostLikely.vue'
import NeverHaveIEver from '../views/NeverHaveIEver.vue'
// import Crocodile from '../views/Crocodile.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/revolver',
    name: 'Revolver',
    component: Revolver
  },
  {
    path: '/dice',
    name: 'Dice',
    component: Dice
  },
  {
    path: '/truth-or-dare',
    name: 'TruthOrDare',
    component: TruthOrDare
  },
  {
    path: '/most-likely',
    name: 'MostLikely',
    component: MostLikely
  },
  {
    path: '/never-have-i-ever',
    name: 'NeverHaveIEver',
    component: NeverHaveIEver
  },
  // {
  //   path: '/crocodile',
  //   name: 'Crocodile',
  //   component: Crocodile
  // }
]

const router = createRouter({
  history: createWebHashHistory(), // Use Hash mode for static deployment compatibility
  routes
})

export default router
