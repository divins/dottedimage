import { createRouter, createWebHashHistory } from "vue-router";
import DotView from "../views/DotView.vue";

const routes = [
  {
    path: "/",
    name: "Dot",
    component: DotView
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
      import(/* webpackChunkName: "about" */ "../views/PostProcessingView.vue")
  },
  {
    path: "/portal",
    name: "Portal",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/PortalView.vue")
  },
  {
    path: "/scatter",
    name: "Scatter",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/ScatterView.vue")
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
