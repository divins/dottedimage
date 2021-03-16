import { createRouter, createWebHashHistory } from "vue-router";
import Shaders from "../views/Shaders.vue";

const routes = [
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
    path: "/",
    name: "Shaders",
    component: Shaders
  },
  {
    path: "/galaxy",
    name: "Galaxy",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/GalaxyView.vue")
  },
  {
    path: "/post-processing",
    name: "PostProcessing",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/PostProcessing.vue")
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
