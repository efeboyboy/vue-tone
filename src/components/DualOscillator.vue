<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as Tone from 'tone'
import { useToneContext } from '../composables/useToneContext'

const props = defineProps<{
  isAudioReady: boolean
}>()

const { getContext } = useToneContext()

// Add output nodes for LPG routing
const output1 = new Tone.Gain()
const output2 = new Tone.Gain()

// Initialize analyzers at module level
const analyzer1 = new Tone.Analyser('waveform', 1024)
const analyzer2 = new Tone.Analyser('waveform', 1024)

let osc1: Tone.Oscillator
let osc2: Tone.Oscillator
let mod1: Tone.Oscillator
let mod2: Tone.Oscillator
let shaper1: Tone.WaveShaper
let shaper2: Tone.WaveShaper

const isPlaying = ref(false)
const freq1 = ref(440)
const freq2 = ref(443)
const shape1Amount = ref(1)
const shape2Amount = ref(1)
const modIndex1 = ref(1)
const modIndex2 = ref(1)

const canvas1 = ref<HTMLCanvasElement | null>(null)
const canvas2 = ref<HTMLCanvasElement | null>(null)

// Create a square wave shaping function with amount control
const makeSquareShaper = (val: number, amount: number) => {
  return Math.tanh(val * amount) // Smooth square wave with variable hardness
}

// Create a saw wave shaping function with amount control
const makeSawShaper = (val: number, amount: number) => {
  return val * amount // Variable slope saw wave
}

const updateFrequency1 = () => {
  if (osc1) {
    osc1.frequency.rampTo(freq1.value, 0.1)
  }
}

const updateFrequency2 = () => {
  if (osc2) {
    osc2.frequency.rampTo(freq2.value, 0.1)
  }
}

const updateShape1 = () => {
  if (shaper1) {
    const curve = new Float32Array(4096)
    for (let i = 0; i < 4096; i++) {
      const x = (i / 4096) * 2 - 1
      curve[i] = makeSquareShaper(x, shape1Amount.value)
    }
    shaper1.curve = curve
  }
}

const updateShape2 = () => {
  if (shaper2) {
    const curve = new Float32Array(4096)
    for (let i = 0; i < 4096; i++) {
      const x = (i / 4096) * 2 - 1
      curve[i] = makeSawShaper(x, shape2Amount.value)
    }
    shaper2.curve = curve
  }
}

const drawWaveform = () => {
  if (!canvas1.value || !canvas2.value || !analyzer1 || !analyzer2) return

  const ctx1 = canvas1.value.getContext('2d')
  const ctx2 = canvas2.value.getContext('2d')
  if (!ctx1 || !ctx2) return

  const width = canvas1.value.width
  const height = canvas1.value.height

  const wave1 = analyzer1.getValue() as Float32Array
  const wave2 = analyzer2.getValue() as Float32Array

  // Draw oscillator 1 waveform
  ctx1.clearRect(0, 0, width, height)
  ctx1.beginPath()
  ctx1.strokeStyle = '#4caf50'
  ctx1.lineWidth = 2
  wave1.forEach((value, i) => {
    const x = (i / wave1.length) * width
    const y = (((value as number) + 1) / 2) * height
    if (i === 0) ctx1.moveTo(x, y)
    else ctx1.lineTo(x, y)
  })
  ctx1.stroke()

  // Draw oscillator 2 waveform
  ctx2.clearRect(0, 0, width, height)
  ctx2.beginPath()
  ctx2.strokeStyle = '#2196f3'
  ctx2.lineWidth = 2
  wave2.forEach((value, i) => {
    const x = (i / wave2.length) * width
    const y = (((value as number) + 1) / 2) * height
    if (i === 0) ctx2.moveTo(x, y)
    else ctx2.lineTo(x, y)
  })
  ctx2.stroke()

  requestAnimationFrame(drawWaveform)
}

const initializeOscillators = () => {
  const context = getContext()

  // Create carrier oscillators
  osc1 = new Tone.Oscillator({
    context,
    frequency: freq1.value,
    type: 'sine',
    volume: -10,
  })

  osc2 = new Tone.Oscillator({
    context,
    frequency: freq2.value,
    type: 'sine',
    volume: -10,
  })

  // Create modulator oscillators
  mod1 = new Tone.Oscillator({
    context,
    frequency: freq1.value,
    type: 'sine',
  })

  mod2 = new Tone.Oscillator({
    context,
    frequency: freq2.value,
    type: 'sine',
  })

  // Create WaveShapers with initial curves
  shaper1 = new Tone.WaveShaper((curve) => makeSquareShaper(curve, shape1Amount.value), 4096)
  shaper2 = new Tone.WaveShaper((curve) => makeSawShaper(curve, shape2Amount.value), 4096)

  // Create gain nodes for modulation amount
  const modGain1 = new Tone.Gain(0)
  const modGain2 = new Tone.Gain(0)

  // Create output gains
  const outGain1 = new Tone.Gain(1)
  const outGain2 = new Tone.Gain(1)

  // FM modulation routing
  mod1.connect(modGain1)
  mod2.connect(modGain2)
  modGain1.connect(osc2.frequency)
  modGain2.connect(osc1.frequency)

  // Output routing with waveshaping
  osc1.connect(shaper1)
  osc2.connect(shaper2)
  shaper1.connect(outGain1)
  shaper2.connect(outGain2)
  outGain1.connect(output1)
  outGain2.connect(output2)

  // Watch modulation parameters
  watch(modIndex1, (value) => {
    // Scale modulation index by frequency for consistent FM depth
    const modulationDepth = value * freq1.value
    modGain1.gain.rampTo(modulationDepth, 0.1)
  })

  watch(modIndex2, (value) => {
    const modulationDepth = value * freq2.value
    modGain2.gain.rampTo(modulationDepth, 0.1)
  })

  // Update modulator frequencies when carrier frequencies change
  watch(freq1, (value) => {
    osc1.frequency.rampTo(value, 0.1)
    mod1.frequency.rampTo(value, 0.1)
    // Update modulation depth to maintain consistent FM character
    const modulationDepth = modIndex1.value * value
    modGain1.gain.rampTo(modulationDepth, 0.1)
  })

  watch(freq2, (value) => {
    osc2.frequency.rampTo(value, 0.1)
    mod2.frequency.rampTo(value, 0.1)
    const modulationDepth = modIndex2.value * value
    modGain2.gain.rampTo(modulationDepth, 0.1)
  })

  // Start oscillators automatically
  osc1.start()
  osc2.start()
  mod1.start()
  mod2.start()
  isPlaying.value = true

  // Start visualization
  drawWaveform()
}

// Watch for audio initialization
watch(
  () => props.isAudioReady,
  (isReady) => {
    if (isReady) {
      initializeOscillators()
    }
  },
)

onMounted(() => {
  if (props.isAudioReady) {
    initializeOscillators()
  }
})

// Watch for changes in shape amounts
watch(shape1Amount, updateShape1)
watch(shape2Amount, updateShape2)

onUnmounted(() => {
  if (osc1) osc1.dispose()
  if (osc2) osc2.dispose()
  if (mod1) mod1.dispose()
  if (mod2) mod2.dispose()
  if (shaper1) shaper1.dispose()
  if (shaper2) shaper2.dispose()
  if (analyzer1) analyzer1.dispose()
  if (analyzer2) analyzer2.dispose()
  output1.dispose()
  output2.dispose()
})

// Expose nodes for external routing
defineExpose({
  output1,
  output2,
  analyzer1,
  analyzer2,
})
</script>

<template>
  <div class="dual-oscillator">
    <div class="oscillators">
      <div class="oscillator">
        <h3>Square FM Oscillator</h3>
        <canvas ref="canvas1" width="300" height="100" class="waveform"></canvas>
        <div class="controls">
          <div class="control-group">
            <label>Frequency (Hz)</label>
            <input
              type="range"
              min="220"
              max="880"
              v-model.number="freq1"
              @input="updateFrequency1"
            />
            <span>{{ freq1 }}Hz</span>
          </div>
          <div class="control-group">
            <label>Shape Amount</label>
            <input type="range" min="1" max="50" step="0.1" v-model.number="shape1Amount" />
            <span>{{ shape1Amount }}</span>
          </div>
          <div class="control-group">
            <label>Modulation Index</label>
            <input type="range" min="0" max="10" step="0.1" v-model.number="modIndex1" />
            <span>{{ modIndex1 }}</span>
          </div>
        </div>
      </div>

      <div class="oscillator">
        <h3>Saw FM Oscillator</h3>
        <canvas ref="canvas2" width="300" height="100" class="waveform"></canvas>
        <div class="controls">
          <div class="control-group">
            <label>Frequency (Hz)</label>
            <input
              type="range"
              min="220"
              max="880"
              v-model.number="freq2"
              @input="updateFrequency2"
            />
            <span>{{ freq2 }}Hz</span>
          </div>
          <div class="control-group">
            <label>Shape Amount</label>
            <input type="range" min="1" max="50" step="0.1" v-model.number="shape2Amount" />
            <span>{{ shape2Amount }}</span>
          </div>
          <div class="control-group">
            <label>Modulation Index</label>
            <input type="range" min="0" max="10" step="0.1" v-model.number="modIndex2" />
            <span>{{ modIndex2 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dual-oscillator {
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  max-width: 800px;
  margin: 1rem;
}

.oscillators {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
}

.oscillator {
  flex: 1;
  background: white;
  padding: 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.oscillator h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.waveform {
  width: 100%;
  height: 100px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group label {
  font-weight: bold;
  color: #666;
}

.control-group input[type='range'] {
  width: 100%;
}

.control-group span {
  color: #666;
  font-size: 0.9rem;
}
</style>
