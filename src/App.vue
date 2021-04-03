<template>
  <div id="nav">
    <router-link :to="{ name: 'Particles' }">Particles</router-link> | 
    <router-link :to="{ name: 'Shaders' }">Shaders</router-link> | 
    <router-link :to="{ name: 'Galaxy' }">Galaxy</router-link> |
    <router-link :to="{ name: 'PostProcessing' }">Post-Processing</router-link> | 
    <router-link :to="{ name: 'Portal' }">Portal</router-link>
  </div>
  <router-view />
</template>

<style>
body {
  margin: 0px;
  outline: none;
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: auto;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  grid-column: 1 / 1;
  grid-row: 1 / 1;
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: 60px auto;
  grid-template-areas:
    "header"
    "content";
}

#nav {
  margin: 20px;
  position: relative;
  top: 0px;
  left: 0px;
  right: 0px;
  z-index: 100;
  pointer-events: none;
  grid-area: header;
}
#nav a {
  font-weight: bold;
  color: #767977;
  pointer-events: initial;
}
#nav a.router-link-exact-active {
  color: #42b983;
}

.labs {
  grid-area: content;
}

a.demo {
  position: absolute;
  z-index: 99;
  border-radius: 50%;
  background: white;
  opacity: 0.55;
  transition: opacity 0.3s;
  width: 50px;
  height: 50px;
  color: #222;
  font-weight: bold;
  line-height: 50px;
  text-decoration: none;
  font-size: 0.9em;
}
a.demo:hover {
  opacity: 0.8;
}
a.demo.repo {
  right: 25px;
  bottom: 25px;
}
a.demo.tutorial {
  right: 100px;
  bottom: 25px;
}
p.disclaimer {
  position: fixed;
  bottom: 0px;
  left: 0px;
  right: 0px;
  height: 25px;
  z-index: 100;
  color: #222;
}
p.disclaimer a {
  color: #42b983;
  text-decoration: none;
}
#stats div {
  bottom: 20px;
  top: unset !important;
  left: 20px !important;
}
</style>
