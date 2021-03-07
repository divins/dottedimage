import { createStore } from "vuex";

export default createStore({
  state: {
    mode: 'light',
  },
  mutations: {
    changeMode(state){
      state.mode = 'dark';
    }
  },
  actions: {},
  modules: {}
});
