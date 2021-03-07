import { createRouter, createWebHashHistory } from "vue-router";
import Circles from "../views/Circles.vue";

const routes = [
  {
    path: "/",
    name: "Circles",
    component: Circles
  },
  {
    path: "/particles",
    name: "Particles",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Particles.vue")
  },
  {
    path: "/shaders",
    name: "Shaders",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/Shaders.vue")
  },
  {
    path: "/galaxy",
    name: "Galaxy",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/GalaxyView.vue")
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
