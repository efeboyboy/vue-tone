<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as Tone from 'tone'
import { useToneContext } from '../composables/useToneContext'
import ControlKnob from './ui/ControlKnob.vue'

const props = defineProps<{
  isAudioReady: boolean
  waveformType?: 'sine-to-square' | 'sine-to-saw'
}>()

const { getContext } = useToneContext()

// Core audio nodes
let oscillator: Tone.Oscillator
let modulator: Tone.Oscillator
let shaper: Tone.WaveShaper
const output = new Tone.Gain(0.5) // Main output with initial gain

// Add frequency control signal
const frequencySignal = new Tone.Signal(440)

// Modulation system
const modBus = {
  fm: {
    input: new Tone.Gain(0), // FM input from external sources
    amount: new Tone.Gain(0), // FM amount (attenuverter)
  },
  shape: {
    input: new Tone.Gain(0),
    amount: new Tone.Gain(0),
  },
}

// UI controls
const baseFreq = 440
const detune = ref(0)
const fmAmount = ref(0) // Now represents modulation index (-10 to 10)
const shapeAmount = ref(0) // Start at 0 (pure sine)
const waveformType = ref<'sine-to-square' | 'sine-to-saw'>(props.waveformType || 'sine-to-square')

// Waveshaping functions
const makeSquareShaper = (val: number, amount: number) => {
  // Softer waveshaping with better control
  const normalized = amount / 50 // Normalize to 0-1 range
  return Math.tanh(val * (1 + normalized * 9)) // Smoother transition from sine to square
}

const makeSawShaper = (val: number, amount: number) => {
  // Softer waveshaping for saw
  const normalized = amount / 50
  return val * (1 + normalized * 4) // More gradual saw transformation
}

// Parameter update handlers
const updateDetune = () => {
  if (oscillator && modulator) {
    oscillator.detune.rampTo(detune.value, 0.1)
    modulator.detune.rampTo(detune.value, 0.1)
    // Update modulation depth using normalized modulation index
    const currentFreq = baseFreq * Math.pow(2, detune.value / 1200)
    const modulationDepth = Math.abs(fmAmount.value) * currentFreq
    modBus.fm.amount.gain.rampTo(fmAmount.value < 0 ? -modulationDepth : modulationDepth, 0.1)
  }
}

const updateFMAmount = () => {
  if (oscillator) {
    const currentFreq = baseFreq * Math.pow(2, detune.value / 1200)
    const modulationDepth = Math.abs(fmAmount.value) * currentFreq
    modBus.fm.amount.gain.rampTo(fmAmount.value < 0 ? -modulationDepth : modulationDepth, 0.1)
  }
}

const updateShape = () => {
  if (!shaper) return

  const curve = new Float32Array(4096)
  for (let i = 0; i < 4096; i++) {
    const x = (i / 4096) * 2 - 1
    curve[i] =
      waveformType.value === 'sine-to-square'
        ? makeSquareShaper(x, shapeAmount.value)
        : makeSawShaper(x, shapeAmount.value)
  }
  shaper.curve = curve
}

// Initialize the synth
const initializeOscillator = () => {
  const context = getContext()

  // Create carrier oscillator
  oscillator = new Tone.Oscillator({
    context,
    frequency: baseFreq,
    detune: detune.value,
    type: 'sine',
  })

  // Connect frequency signal to oscillator
  frequencySignal.connect(oscillator.frequency)

  // Create modulator oscillator
  modulator = new Tone.Oscillator({
    context,
    frequency: baseFreq,
    detune: detune.value,
    type: 'sine',
  })

  // Create waveshaper with initial sine wave (no shaping)
  shaper = new Tone.WaveShaper(undefined, 4096)
  updateShape()

  // FM Modulation routing
  modulator.connect(modBus.fm.amount)
  modBus.fm.input.connect(modBus.fm.amount)
  modBus.fm.amount.connect(oscillator.frequency)

  // Audio routing with shape control
  oscillator.connect(shaper)
  shaper.connect(output)

  // Start oscillators
  oscillator.start()
  modulator.start()
}

// Lifecycle hooks
onMounted(() => {
  if (props.isAudioReady) {
    initializeOscillator()
  }
})

watch(
  () => props.isAudioReady,
  (isReady) => {
    if (isReady) {
      initializeOscillator()
    }
  },
)

// Parameter watchers
watch([shapeAmount, waveformType], updateShape)
watch(fmAmount, updateFMAmount)

// Cleanup
onUnmounted(() => {
  oscillator?.dispose()
  modulator?.dispose()
  shaper?.dispose()
  output.dispose()
  frequencySignal.dispose()
  modBus.fm.input.dispose()
  modBus.fm.amount.dispose()
  modBus.shape.input.dispose()
  modBus.shape.amount.dispose()
})

// Expose nodes for external routing
defineExpose({
  output,
  fmIn: modBus.fm.input,
  shapeIn: modBus.shape.input,
  freq: frequencySignal,
})
</script>

<template>
  <div class="module mono-oscillator">
    <div class="module-header">
      <h3>Oscillator</h3>
    </div>
    <div class="module-content">
      <div class="control-section">
        <div class="control-row">
          <div class="control-group">
            <ControlKnob
              v-model="detune"
              :min="-1200"
              :max="1200"
              :step="1"
              label="tune"
              size="medium"
              @update:modelValue="updateDetune"
            />
          </div>
          <div class="control-group">
            <ControlKnob
              v-model="fmAmount"
              :min="0"
              :max="10"
              :step="0.1"
              label="fm"
              size="medium"
            />
          </div>
          <div class="control-group">
            <ControlKnob
              v-model="shapeAmount"
              :min="0"
              :max="50"
              :step="0.1"
              label="shape"
              size="medium"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mono-oscillator {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  min-height: 0;
  padding: var(--space-sm);
  width: 100%;
  height: 100%;
}

.mono-oscillator .control-row {
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
}

.control-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.control-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  gap: var(--space-sm);
}

.control-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
