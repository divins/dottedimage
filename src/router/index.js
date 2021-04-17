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
  },
  {
    path: "/html-webgl-merge",
    name: "HtmlMerge",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/HtmlMergeView.vue")
  },
  {
    path: "/digi-conf",
    name: "DigiConf",
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/DigiConfView.vue")
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
