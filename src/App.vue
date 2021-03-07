<template>
  <div id="nav">
    <router-link to="/">To Circles</router-link> |
    <router-link to="/particles">To Particles</router-link> | 
    <router-link to="/shaders">To Shaders</router-link> | 
    <router-link to="/galaxy">Galaxy</router-link>
  </div>
  <router-view />
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 20px;
  position: relative;
  top: 0px;
  left: 0px;
  right: 0px;
  height: 60px;
  z-index: 100;
  pointer-events: none;
}

#nav a {
  font-weight: bold;
  color: #767977;
  pointer-events: initial;
}

#nav a.router-link-exact-active {
  color: #42b983;
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
}
p.disclaimer a {
  color: #42b983;
  text-decoration: none;
}
</style>
