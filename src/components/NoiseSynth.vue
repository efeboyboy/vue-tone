<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as Tone from 'tone'
import { useToneContext } from '../composables/useToneContext'

const props = defineProps<{
  isAudioReady: boolean
}>()

const { getContext } = useToneContext()

// Create output and analyzer nodes
const output = new Tone.Gain()
const analyzer = new Tone.Analyser('waveform', 1024)

// Create playbackRate control signal for external modulation
const playbackRateSignal = new Tone.Signal(1)

let noise: Tone.Noise
const canvas = ref<HTMLCanvasElement | null>(null)
const noiseType = ref<'white' | 'pink' | 'brown'>('white')
const playbackRate = ref(1)
const volume = ref(-10)

const drawWaveform = () => {
  if (!canvas.value || !analyzer) return

  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  const width = canvas.value.width
  const height = canvas.value.height

  const wave = analyzer.getValue() as Float32Array

  // Draw noise waveform
  ctx.clearRect(0, 0, width, height)
  ctx.beginPath()
  ctx.strokeStyle = '#ff5722'
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

const initializeNoise = () => {
  const context = getContext()

  noise = new Tone.Noise({
    context,
    type: noiseType.value,
    playbackRate: playbackRate.value,
    volume: volume.value,
  })

  // Connect noise to output
  noise.connect(output)

  // Connect to analyzer for visualization
  output.connect(analyzer)

  // Start noise immediately (it will be controlled by LPG)
  noise.start()

  // Start visualization
  drawWaveform()
}

// Watch for audio initialization
watch(
  () => props.isAudioReady,
  (isReady) => {
    if (isReady) {
      initializeNoise()
    }
  },
)

// Watch for parameter changes
watch(noiseType, (value) => {
  if (noise) {
    noise.type = value
  }
})

watch(playbackRate, (value) => {
  if (noise) {
    playbackRateSignal.value = value
  }
})

watch(volume, (value) => {
  if (noise) {
    noise.volume.value = value
  }
})

onMounted(() => {
  if (props.isAudioReady) {
    initializeNoise()
  }
})

onUnmounted(() => {
  if (noise) noise.dispose()
  if (analyzer) analyzer.dispose()
  playbackRateSignal.dispose()
  output.dispose()
})

// Expose nodes for external routing
defineExpose({
  output,
  analyzer,
  playbackRate: playbackRateSignal,
})
</script>

<template>
  <div class="noise-synth">
    <div class="synth">
      <h3>Noise Source</h3>
      <canvas ref="canvas" width="300" height="100" class="waveform"></canvas>
      <div class="controls">
        <div class="control-group">
          <label>Type</label>
          <select v-model="noiseType">
            <option value="white">White</option>
            <option value="pink">Pink</option>
            <option value="brown">Brown</option>
          </select>
        </div>
        <div class="control-group">
          <label>Playback Rate</label>
          <input type="range" min="0.1" max="4" step="0.1" v-model.number="playbackRate" />
          <span>{{ playbackRate }}x</span>
        </div>
        <div class="control-group">
          <label>Volume</label>
          <input type="range" min="-40" max="0" step="1" v-model.number="volume" />
          <span>{{ volume }}dB</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.noise-synth {
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  max-width: 400px;
  margin: 1rem;
}

.synth {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.synth h3 {
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

.control-group select,
.control-group input[type='range'] {
  width: 100%;
}

.control-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.control-group span {
  color: #666;
  font-size: 0.9rem;
}
</style>
