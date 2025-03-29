<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToneInitializer from './components/ToneInitializer.vue'
import NavBar from './components/web/NavBar.vue'
</script>

<template>
  <div id="app">
    <ToneInitializer />
    <NavBar />
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

main {
  flex: 1;
  overflow: hidden;
}
</style>
