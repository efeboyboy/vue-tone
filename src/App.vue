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
  overflow: auto;
  /* Fix ResizeObserver loop */
  contain: content;
}

main {
  flex: 1;
  overflow: auto;
  /* Fix ResizeObserver loop */
  min-height: 0;
  contain: layout;
  display: flex;
  flex-direction: column;
}

/* Modern scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Ensure consistent box sizing */
*,
*::before,
*::after {
  box-sizing: border-box;
}
</style>
