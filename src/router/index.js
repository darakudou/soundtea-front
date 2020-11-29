import Vue from 'vue'
import VueRouter from 'vue-router'
import PlayList from '@/views/PlayList.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'PlayList',
    component: PlayList,
    props: (route) => {
        return { routeParams: route.query }
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  // base: process.env.BASE_URL,
  routes
})

export default router