<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as Tone from 'tone'
import DualOscillator from '../components/DualOscillator.vue'
import NoiseSynth from '../components/NoiseSynth.vue'
import LowPassGate from '../components/LowPassGate.vue'
import FunctionGenerator from '../components/FunctionGenerator.vue'
import MasterClock from '../components/MasterClock.vue'

const isAudioInitialized = ref(false)
const masterClockRef = ref()

// References to components for audio routing
const dualOscRef = ref()
const noiseSynthRef = ref()
const lpg1Ref = ref()
const lpg2Ref = ref()
const lpg3Ref = ref()
const func1Ref = ref()
const func2Ref = ref()
const func3Ref = ref()

// Setup 16th note triggers
const setupTriggers = () => {
  const transport = Tone.getTransport()
  transport.scheduleRepeat((time) => {
    func1Ref.value?.trigger(time)
    func2Ref.value?.trigger(time)
    func3Ref.value?.trigger(time)
  }, '16n')
}

// Listen for the global audio initialization event
const handleAudioInitialized = () => {
  isAudioInitialized.value = true
}

const setupAudioRouting = () => {
  // Route oscillator 1 through LPG 1
  if (dualOscRef.value?.output1 && lpg1Ref.value?.input) {
    dualOscRef.value.output1.connect(lpg1Ref.value.input)
    lpg1Ref.value.output.connect(dualOscRef.value.analyzer1)
    dualOscRef.value.analyzer1.toDestination()
  }

  // Route oscillator 2 through LPG 2
  if (dualOscRef.value?.output2 && lpg2Ref.value?.input) {
    dualOscRef.value.output2.connect(lpg2Ref.value.input)
    lpg2Ref.value.output.connect(dualOscRef.value.analyzer2)
    dualOscRef.value.analyzer2.toDestination()
  }

  // Route noise synth through LPG 3
  if (noiseSynthRef.value?.output && lpg3Ref.value?.input) {
    noiseSynthRef.value.output.connect(lpg3Ref.value.input)
    lpg3Ref.value.output.connect(noiseSynthRef.value.analyzer)
    noiseSynthRef.value.analyzer.toDestination()
  }

  // Connect function generators to LPGs
  if (func1Ref.value?.output && lpg1Ref.value?.amount) {
    func1Ref.value.output.connect(lpg1Ref.value.amount)
  }
  if (func2Ref.value?.output && lpg2Ref.value?.amount) {
    func2Ref.value.output.connect(lpg2Ref.value.amount)
  }
  if (func3Ref.value?.output && lpg3Ref.value?.amount) {
    func3Ref.value.output.connect(lpg3Ref.value.amount)
  }

  // Setup clock triggers
  setupTriggers()
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

onMounted(() => {
  window.addEventListener('audioInitialized', handleAudioInitialized)
})

onUnmounted(() => {
  window.removeEventListener('audioInitialized', handleAudioInitialized)
})
</script>

<template>
  <div class="bongo-patch">
    <h1>Bongo Patch</h1>
    <div class="synth-container">
      <MasterClock ref="masterClockRef" :is-audio-ready="isAudioInitialized" />
      <div class="oscillators">
        <DualOscillator ref="dualOscRef" :is-audio-ready="isAudioInitialized" />
        <div class="noise-synths">
          <NoiseSynth ref="noiseSynthRef" :is-audio-ready="isAudioInitialized" />
        </div>
      </div>
      <div class="lpgs">
        <LowPassGate ref="lpg1Ref" :is-audio-ready="isAudioInitialized" label="LPG 1 (Osc 1)" />
        <LowPassGate ref="lpg2Ref" :is-audio-ready="isAudioInitialized" label="LPG 2 (Osc 2)" />
        <LowPassGate ref="lpg3Ref" :is-audio-ready="isAudioInitialized" label="LPG 3 (Noise)" />
      </div>
      <div class="function-generators">
        <FunctionGenerator ref="func1Ref" :is-audio-ready="isAudioInitialized" label="Func 1" />
        <FunctionGenerator ref="func2Ref" :is-audio-ready="isAudioInitialized" label="Func 2" />
        <FunctionGenerator ref="func3Ref" :is-audio-ready="isAudioInitialized" label="Func 3" />
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
.noise-synths,
.lpgs,
.function-generators {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 2rem;
}

.lpgs {
  background: rgba(156, 39, 176, 0.1);
  padding: 2rem;
  border-radius: 8px;
}

.function-generators {
  background: rgba(76, 175, 80, 0.1);
  padding: 2rem;
  border-radius: 8px;
}
</style>
