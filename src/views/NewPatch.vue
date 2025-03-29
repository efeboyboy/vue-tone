<script setup lang="ts">
import MonoOscillator from '../components/MonoOscillator.vue'
import NoiseSynth from '../components/NoiseSynth.vue'
import LowPassGate from '../components/LowPassGate.vue'
import OscilloscopeScreen from '../components/OscilloscopeScreen.vue'
import { ref, onMounted, watch, onUnmounted } from 'vue'
const isAudioInitialized = ref(false)

// Create refs for the oscillators
const sawOsc = ref<InstanceType<typeof MonoOscillator> | null>(null)
const squareOsc = ref<InstanceType<typeof MonoOscillator> | null>(null)
const noiseSynthRef = ref<InstanceType<typeof NoiseSynth> | null>(null)

// Create refs for the Low Pass Gates
const lpg1Ref = ref()
const lpg2Ref = ref()
const lpg3Ref = ref()

// Create refs for oscilloscopes
const scope1Ref = ref()
const scope2Ref = ref()
const scope3Ref = ref()

const setupAudioRouting = () => {
  // Route OSC 1 to LPG 1
  if (sawOsc.value?.output && lpg1Ref.value?.input && scope1Ref.value?.input) {
    sawOsc.value.output.connect(lpg1Ref.value.input)
    lpg1Ref.value.output.connect(scope1Ref.value.input)
    lpg1Ref.value.output.toDestination()
  }

  // Route OSC 2 to LPG 2
  if (squareOsc.value?.output && lpg2Ref.value?.input && scope2Ref.value?.input) {
    squareOsc.value.output.connect(lpg2Ref.value.input)
    lpg2Ref.value.output.connect(scope2Ref.value.input)
    lpg2Ref.value.output.toDestination()
  }

  // Route Noise to LPG 3
  if (noiseSynthRef.value?.output && lpg3Ref.value?.input && scope3Ref.value?.input) {
    noiseSynthRef.value.output.connect(lpg3Ref.value.input)
    lpg3Ref.value.output.connect(scope3Ref.value.input)
    lpg3Ref.value.output.toDestination()
  }
}

// Watch for audio initialization
watch(
  () => isAudioInitialized.value,
  (isReady) => {
    if (isReady) {
      // Wait for components to initialize
      setTimeout(setupAudioRouting, 100)
    }
  },
)

// Start audio context and initialize oscillators when component mounts
onMounted(() => {
  // Listen for the global audio initialization event
  window.addEventListener('audioInitialized', () => {
    console.log('NewPatch received audio initialization')
    isAudioInitialized.value = true
  })
})

// Cleanup event listener on unmount
onUnmounted(() => {
  window.removeEventListener('audioInitialized', () => {
    isAudioInitialized.value = true
  })
})

// Set up cross FM modulation when oscillators are ready
watch(
  [sawOsc, squareOsc],
  ([newSawOsc, newSquareOsc]) => {
    if (newSawOsc && newSquareOsc && isAudioInitialized.value) {
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
      <OscilloscopeScreen ref="scope1Ref" label="Saw Output" />

      <MonoOscillator
        ref="sawOsc"
        :is-audio-ready="isAudioInitialized"
        waveform-type="sine-to-saw"
      />
      <LowPassGate ref="lpg1Ref" :is-audio-ready="isAudioInitialized" label="LPG 1 (Osc 1)" />
    </div>
    <div class="col col-3">
      <OscilloscopeScreen ref="scope2Ref" label="Square Output" />

      <MonoOscillator
        ref="squareOsc"
        :is-audio-ready="isAudioInitialized"
        waveform-type="sine-to-square"
      />
      <LowPassGate ref="lpg2Ref" :is-audio-ready="isAudioInitialized" label="LPG 2 (Osc 2)" />
    </div>
    <div class="col col-4">
      <OscilloscopeScreen ref="scope3Ref" label="Noise Output" />

      <NoiseSynth ref="noiseSynthRef" :is-audio-ready="isAudioInitialized" />
      <LowPassGate ref="lpg3Ref" :is-audio-ready="isAudioInitialized" label="LPG 3 (Noise)" />
    </div>
  </div>
</template>

<style scoped>
.bongo-rack {
  display: flex;
  gap: 2rem;
}
.col {
  display: flex;
  flex: 1;
  flex-direction: column;
  background-color: var(--panel-background);
}
</style>
