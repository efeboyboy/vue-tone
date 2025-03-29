<script setup lang="ts">
import MasterClock from '../components/MasterClock.vue'
import StepSequencer from '../components/StepSequencer.vue'

import OscilloscopeScreen from '../components/OscilloscopeScreen.vue'
import MonoOscillator from '../components/MonoOscillator.vue'
import NoiseSynth from '../components/NoiseSynth.vue'
import LowPassGate from '../components/LowPassGate.vue'
import FunctionGenerator from '../components/FunctionGenerator.vue'
import MainMixer from '../components/MainMixer.vue'
import FXUnit from '../components/FXUnit.vue'
import * as Tone from 'tone'
import { ref, onMounted, watch, onUnmounted } from 'vue'

const isAudioInitialized = ref(false)
const masterClockRef = ref()

// Create refs for the oscillators
const sawOsc = ref<InstanceType<typeof MonoOscillator> | null>(null)
const squareOsc = ref<InstanceType<typeof MonoOscillator> | null>(null)
const noiseSynthRef = ref<InstanceType<typeof NoiseSynth> | null>(null)

// Create refs for the Low Pass Gates
const lpg1Ref = ref()
const lpg2Ref = ref()
const lpg3Ref = ref()

// Create refs for the Function Generators
const func1Ref = ref()
const func2Ref = ref()
const func3Ref = ref()

// Create refs for mixers and effects
const mixerRef = ref<InstanceType<typeof MainMixer> | null>(null)
const fxUnitRef = ref<InstanceType<typeof FXUnit> | null>(null)

// Create refs for oscilloscopes
const scope1Ref = ref()
const scope2Ref = ref()
const scope3Ref = ref()

// Create refs for sequencers
const seq1Ref = ref<InstanceType<typeof StepSequencer> | null>(null)
const seq2Ref = ref<InstanceType<typeof StepSequencer> | null>(null)
const seq3Ref = ref<InstanceType<typeof StepSequencer> | null>(null)

const setupAudioRouting = () => {
  // Connect sequencers to oscillators and noise
  if (seq1Ref.value?.output && sawOsc.value) {
    seq1Ref.value.output.connect(sawOsc.value.freq)
  }
  if (seq2Ref.value?.output && squareOsc.value) {
    seq2Ref.value.output.connect(squareOsc.value.freq)
  }
  if (seq3Ref.value?.output && noiseSynthRef.value) {
    seq3Ref.value.output.connect(noiseSynthRef.value.playbackRate)
  }

  // Route OSC 1 to LPG 1, then to Mixer channel A
  if (
    sawOsc.value?.output &&
    lpg1Ref.value?.input &&
    scope1Ref.value?.input &&
    mixerRef.value?.channelA
  ) {
    sawOsc.value.output.connect(lpg1Ref.value.input)
    lpg1Ref.value.output.connect(scope1Ref.value.input)
    lpg1Ref.value.output.connect(mixerRef.value.channelA)
  }

  // Route OSC 2 to LPG 2, then to Mixer channel B
  if (
    squareOsc.value?.output &&
    lpg2Ref.value?.input &&
    scope2Ref.value?.input &&
    mixerRef.value?.channelB
  ) {
    squareOsc.value.output.connect(lpg2Ref.value.input)
    lpg2Ref.value.output.connect(scope2Ref.value.input)
    lpg2Ref.value.output.connect(mixerRef.value.channelB)
  }

  // Route Noise to LPG 3, then to Mixer channel C
  if (
    noiseSynthRef.value?.output &&
    lpg3Ref.value?.input &&
    scope3Ref.value?.input &&
    mixerRef.value?.channelC
  ) {
    noiseSynthRef.value.output.connect(lpg3Ref.value.input)
    lpg3Ref.value.output.connect(scope3Ref.value.input)
    lpg3Ref.value.output.connect(mixerRef.value.channelC)
  }

  // Connect mixer to FX unit
  if (mixerRef.value?.output && fxUnitRef.value?.input) {
    mixerRef.value.output.connect(fxUnitRef.value.input)
  }

  // Connect FX unit to destination
  if (fxUnitRef.value?.output) {
    fxUnitRef.value.output.toDestination()
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

// Setup 16th note triggers
const setupTriggers = () => {
  const transport = Tone.getTransport()
  transport.scheduleRepeat((time: number) => {
    // Trigger envelopes based on active steps
    if (seq1Ref.value?.getCurrentStepData().active) {
      func1Ref.value?.trigger(time)
    }
    if (seq2Ref.value?.getCurrentStepData().active) {
      func2Ref.value?.trigger(time)
    }
    if (seq3Ref.value?.getCurrentStepData().active) {
      func3Ref.value?.trigger(time)
    }
  }, '16n')
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
  <div class="main-container">
    <!-- Column 1: Clock -->
    <div class="patch-column clock-column">
      <MasterClock
        ref="masterClockRef"
        :is-audio-ready="isAudioInitialized"
        class="module clock-module"
      />
      <MainMixer
        ref="mixerRef"
        :is-audio-initialized="isAudioInitialized"
        class="module mixer-module"
      />
      <FXUnit ref="fxUnitRef" :is-audio-initialized="isAudioInitialized" class="module fx-module" />
      <div class="module how-to-module">
        <div class="module-header">
          <h3>Quick Tips</h3>
        </div>
        <div class="module-content">
          <ul class="tips-list">
            <li>Set BPM with master clock</li>
            <li>Create patterns on sequencers</li>
            <li>Adjust sound with oscillators</li>
            <li>Mix channels with mixer</li>
            <li>Add effects with FX unit</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Column 2: Saw Voice -->
    <div class="patch-column voice-column saw-voice">
      <StepSequencer
        ref="seq1Ref"
        :is-audio-ready="isAudioInitialized"
        label="Sequence A"
        class="module sequencer-module"
      />
      <OscilloscopeScreen ref="scope1Ref" label="Saw Output" class="module scope-module" />
      <MonoOscillator
        ref="sawOsc"
        :is-audio-ready="isAudioInitialized"
        waveform-type="sine-to-saw"
        class="module oscillator-module"
      />
      <div class="shared-row">
        <LowPassGate
          ref="lpg1Ref"
          :is-audio-ready="isAudioInitialized"
          label="LPG A"
          class="module lpg-module"
        />
        <FunctionGenerator
          ref="func1Ref"
          :is-audio-ready="isAudioInitialized"
          label="ENV A"
          class="module envelope-module"
        />
      </div>
    </div>

    <!-- Column 3: Square Voice -->
    <div class="patch-column voice-column square-voice">
      <StepSequencer
        ref="seq2Ref"
        :is-audio-ready="isAudioInitialized"
        label="Sequence B"
        class="module sequencer-module"
      />
      <OscilloscopeScreen ref="scope2Ref" label="Square Output" class="module scope-module" />
      <MonoOscillator
        ref="squareOsc"
        :is-audio-ready="isAudioInitialized"
        waveform-type="sine-to-square"
        class="module oscillator-module"
      />
      <div class="shared-row">
        <LowPassGate
          ref="lpg2Ref"
          :is-audio-ready="isAudioInitialized"
          label="LPG B"
          class="module lpg-module"
        />
        <FunctionGenerator
          ref="func2Ref"
          :is-audio-ready="isAudioInitialized"
          label="ENV B"
          class="module envelope-module"
        />
      </div>
    </div>

    <!-- Column 4: Noise Voice -->
    <div class="patch-column voice-column noise-voice">
      <StepSequencer
        ref="seq3Ref"
        :is-audio-ready="isAudioInitialized"
        label="Sequence C"
        class="module sequencer-module"
      />
      <OscilloscopeScreen ref="scope3Ref" label="Noise Output" class="module scope-module" />
      <NoiseSynth
        ref="noiseSynthRef"
        :is-audio-ready="isAudioInitialized"
        class="module oscillator-module"
      />
      <div class="shared-row">
        <LowPassGate
          ref="lpg3Ref"
          :is-audio-ready="isAudioInitialized"
          label="LPG C"
          class="module lpg-module"
        />
        <FunctionGenerator
          ref="func3Ref"
          :is-audio-ready="isAudioInitialized"
          label="ENV C"
          class="module envelope-module"
        />
      </div>
    </div>
  </div>
</template>

<style>
.how-to-module {
  height: 100%;
  width: 100%;
}
</style>
