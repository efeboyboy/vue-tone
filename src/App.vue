<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToneInitializer from './components/ToneInitializer.vue'
import NavBar from './components/web/NavBar.vue'
</script>

<template>
  <div id="app">
    <ToneInitializer />
    <NavBar />
    <router-view />
  </div>
</template>

<style>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
