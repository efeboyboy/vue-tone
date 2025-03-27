<script setup lang="ts">
import { RouterView } from 'vue-router'
import ToneInitializer from './components/ToneInitializer.vue'
</script>

<template>
  <div id="app">
    <ToneInitializer />
    <router-view />
  </div>
</template>

<style></style>
