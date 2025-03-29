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
const analyzer = new Tone.Analyser('waveform', 1024)

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

// Visualization
const canvas = ref<HTMLCanvasElement | null>(null)

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

// Waveform visualization
const drawWaveform = () => {
  if (!canvas.value || !analyzer) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  const width = canvas.value.width
  const height = canvas.value.height
  const wave = analyzer.getValue() as Float32Array

  ctx.clearRect(0, 0, width, height)
  ctx.beginPath()
  ctx.strokeStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--secondary-color')
    .trim()
  ctx.lineWidth = 2

  wave.forEach((value, i) => {
    const x = (i / wave.length) * width
    const y = (((value as number) + 1) / 2) * height
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()

  requestAnimationFrame(drawWaveform)
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
  output.connect(analyzer)
  output.connect(context.destination)

  // Start oscillators
  oscillator.start()
  modulator.start()
  drawWaveform()
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
  analyzer.dispose()
  output.dispose()
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
})
</script>

<template>
  <div class="single-oscillator">
    <h3>{{ waveformType === 'sine-to-saw' ? 'Saw' : 'Square' }} Oscillator</h3>
    <div class="oscillator-content">
      <canvas ref="canvas" width="300" height="100" class="waveform"></canvas>
      <div class="controls">
        <div class="control-group">
          <ControlKnob
            v-model="detune"
            :min="-1200"
            :max="1200"
            :step="1"
            label="frequency"
            @update:modelValue="updateDetune"
          />
        </div>
        <div class="control-group">
          <ControlKnob v-model="fmAmount" :min="0" :max="10" :step="0.1" label="fm amount" />
        </div>
        <div class="control-group">
          <ControlKnob v-model="shapeAmount" :min="0" :max="50" :step="0.1" label="shape" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.single-oscillator {
  padding: 2rem;
  background: var(--panel-background);
  border-radius: 8px;
  width: 400px;
}

.oscillator-content {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

h3 {
  color: var(--secondary-color);
  margin-bottom: 1rem;
  text-align: center;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  font-weight: 400;
  font-size: 1.25rem;
}

.waveform {
  width: 100%;
  height: 100px;
  background: transparent;
  border: 1px solid var(--primary-color);
}

.controls {
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
  gap: 2rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
