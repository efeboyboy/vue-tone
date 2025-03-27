<script setup lang="ts">
import { ref } from 'vue'
import DualOscillator from '../components/DualOscillator.vue'
import NoiseSynth from '../components/NoiseSynth.vue'

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
    <div class="synth-container">
      <div class="oscillators">
        <DualOscillator :is-audio-ready="isAudioInitialized" />
      </div>
      <div class="noise-synths">
        <NoiseSynth :is-audio-ready="isAudioInitialized" />
      </div>
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

.synth-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.oscillators,
.noise-synths {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}
</style>
