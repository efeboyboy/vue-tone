<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as Tone from 'tone'
import DualOscillator from '../components/DualOscillator.vue'
import NoiseSynth from '../components/NoiseSynth.vue'
import LowPassGate from '../components/LowPassGate.vue'
import FunctionGenerator from '../components/FunctionGenerator.vue'
import MasterClock from '../components/MasterClock.vue'
import StepSequencer from '../components/StepSequencer.vue'

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
const sequencerRef = ref()

// Setup 16th note triggers
const setupTriggers = () => {
  const transport = Tone.getTransport()
  transport.scheduleRepeat((time) => {
    // Only trigger if corresponding step is active
    if (sequencerRef.value?.outputs) {
      const currentStepData = {
        osc1: sequencerRef.value.getCurrentStepData(0),
        osc2: sequencerRef.value.getCurrentStepData(1),
        noise: sequencerRef.value.getCurrentStepData(2),
      }

      // Trigger envelopes based on active steps
      if (currentStepData.osc1?.active) {
        func1Ref.value?.trigger(time)
      }
      if (currentStepData.osc2?.active) {
        func2Ref.value?.trigger(time)
      }
      if (currentStepData.noise?.active) {
        func3Ref.value?.trigger(time)
      }
    }
  }, '16n')
}

// Listen for the global audio initialization event
const handleAudioInitialized = () => {
  isAudioInitialized.value = true
}

const setupAudioRouting = () => {
  // Connect sequencer to oscillators and noise
  if (sequencerRef.value?.outputs && dualOscRef.value && noiseSynthRef.value) {
    sequencerRef.value.outputs.freq1.connect(dualOscRef.value.freq1)
    sequencerRef.value.outputs.freq2.connect(dualOscRef.value.freq2)
    sequencerRef.value.outputs.playbackRate.connect(noiseSynthRef.value.playbackRate)
  }

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
    noiseSynthRef.value.output.disconnect()
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
    <header class="header">
      <h1>Bongo Patch</h1>
      <div class="master-section">
        <MasterClock ref="masterClockRef" :is-audio-ready="isAudioInitialized" />
        <StepSequencer ref="sequencerRef" :is-audio-ready="isAudioInitialized" />
      </div>
    </header>

    <main class="synth-modules">
      <!-- Oscillator Section -->
      <section class="module-section oscillators-section">
        <h2>Oscillators</h2>
        <div class="module-grid">
          <DualOscillator ref="dualOscRef" :is-audio-ready="isAudioInitialized" />
        </div>
      </section>

      <!-- Noise Section -->
      <section class="module-section noise-section">
        <h2>Noise</h2>
        <div class="module-grid">
          <NoiseSynth ref="noiseSynthRef" :is-audio-ready="isAudioInitialized" />
        </div>
      </section>

      <!-- LPG Section -->
      <section class="module-section lpg-section">
        <h2>Low Pass Gates</h2>
        <div class="module-grid">
          <LowPassGate ref="lpg1Ref" :is-audio-ready="isAudioInitialized" label="LPG 1 (Osc 1)" />
          <LowPassGate ref="lpg2Ref" :is-audio-ready="isAudioInitialized" label="LPG 2 (Osc 2)" />
          <LowPassGate ref="lpg3Ref" :is-audio-ready="isAudioInitialized" label="LPG 3 (Noise)" />
        </div>
      </section>

      <!-- Function Generator Section -->
      <section class="module-section function-section">
        <h2>Function Generators</h2>
        <div class="module-grid">
          <FunctionGenerator ref="func1Ref" :is-audio-ready="isAudioInitialized" label="Func 1" />
          <FunctionGenerator ref="func2Ref" :is-audio-ready="isAudioInitialized" label="Func 2" />
          <FunctionGenerator ref="func3Ref" :is-audio-ready="isAudioInitialized" label="Func 3" />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.bongo-patch {
  min-height: 100vh;
  background: #1a1a1a;
  color: #ffffff;
  padding: 2rem;
}

.header {
  margin-bottom: 3rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #4caf50;
  text-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #90caf9;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.master-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.synth-modules {
  display: grid;
  gap: 2rem;
}

.module-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.module-grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

/* Section-specific styling */
.oscillators-section {
  background: linear-gradient(145deg, rgba(76, 175, 80, 0.05), rgba(76, 175, 80, 0.02));
}

.noise-section {
  background: linear-gradient(145deg, rgba(255, 87, 34, 0.05), rgba(255, 87, 34, 0.02));
}

.lpg-section {
  background: linear-gradient(145deg, rgba(156, 39, 176, 0.05), rgba(156, 39, 176, 0.02));
}

.function-section {
  background: linear-gradient(145deg, rgba(33, 150, 243, 0.05), rgba(33, 150, 243, 0.02));
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .bongo-patch {
    padding: 1rem;
  }

  .module-section {
    padding: 1.5rem;
  }

  h1 {
    font-size: 2rem;
  }

  h2 {
    font-size: 1.25rem;
  }
}

/* Hover effects */
.module-section:hover {
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

/* Animation for sections */
.module-section {
  transition: all 0.3s ease;
}

/* Scrollbar styling */
.bongo-patch::-webkit-scrollbar {
  width: 8px;
}

.bongo-patch::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.bongo-patch::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.bongo-patch::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
