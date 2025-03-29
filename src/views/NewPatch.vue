<script setup lang="ts">
import MonoOscillator from '../components/MonoOscillator.vue'
import { ref, onMounted, watch, onUnmounted } from 'vue'
const isAudioReady = ref(false)

// Create refs for the oscillators
const sawOsc = ref<InstanceType<typeof MonoOscillator> | null>(null)
const squareOsc = ref<InstanceType<typeof MonoOscillator> | null>(null)

// Start audio context and initialize oscillators when component mounts
onMounted(() => {
  // Listen for the global audio initialization event
  window.addEventListener('audioInitialized', () => {
    console.log('NewPatch received audio initialization')
    isAudioReady.value = true
  })
})

// Cleanup event listener on unmount
onUnmounted(() => {
  window.removeEventListener('audioInitialized', () => {
    isAudioReady.value = true
  })
})

// Set up cross FM modulation when oscillators are ready
watch(
  [sawOsc, squareOsc],
  ([newSawOsc, newSquareOsc]) => {
    if (newSawOsc && newSquareOsc && isAudioReady.value) {
      // Connect saw oscillator to square's FM input through the FM amount attenuverter
      newSawOsc.output.connect(newSquareOsc.fmIn)

      // Connect square oscillator to saw's FM input through the FM amount attenuverter
      newSquareOsc.output.connect(newSawOsc.fmIn)

      console.log('Cross-modulation routing established')
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="bongo-rack">
    <div class="col col-1"></div>
    <div class="col col-2">
      <MonoOscillator ref="sawOsc" :is-audio-ready="isAudioReady" waveform-type="sine-to-saw" />
    </div>
    <div class="col col-3">
      <MonoOscillator
        ref="squareOsc"
        :is-audio-ready="isAudioReady"
        waveform-type="sine-to-square"
      />
    </div>
    <div class="col col-4"></div>
  </div>
</template>

<style scoped>
.bongo-rack {
  display: flex;
}
.col {
  flex: 1;
}
</style>
