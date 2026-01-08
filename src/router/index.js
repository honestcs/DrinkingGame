import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Revolver from '../views/Revolver.vue'
import Dice from '../views/Dice.vue'

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
  }
]

const router = createRouter({
  history: createWebHashHistory(), // Use Hash mode for static deployment compatibility
  routes
})

export default router
