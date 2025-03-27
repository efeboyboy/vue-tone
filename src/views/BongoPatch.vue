<script setup lang="ts">
import { ref } from 'vue'
import DualOscillator from '../components/DualOscillator.vue'

const isAudioInitialized = ref(false)

// Listen for the global audio initialization event
const handleAudioInitialized = () => {
  isAudioInitialized.value = true
}

// Add event listener when component is mounted
window.addEventListener('audioInitialized', handleAudioInitialized)
</script>

<template>
  <div class="bongo-patch">
    <h1>Bongo Patch</h1>
    <div class="oscillators">
      <DualOscillator :is-audio-ready="isAudioInitialized" />
    </div>
  </div>
</template>

<style scoped>
.bongo-patch {
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  color: #333;
}

.oscillators {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}
</style>
