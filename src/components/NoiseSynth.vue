<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as Tone from 'tone'
import { useToneContext } from '../composables/useToneContext'

const props = defineProps<{
  isAudioReady: boolean
}>()

const { getContext } = useToneContext()

// Add output node for LPG routing
const output = new Tone.Gain()

let noise: Tone.NoiseSynth
let analyzer: Tone.Analyser

const attack = ref(0.01)
const decay = ref(0.2)
const sustain = ref(0.5)
const release = ref(0.3)
const volume = ref(-10)

const canvas = ref<HTMLCanvasElement | null>(null)

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

const initializeNoiseSynth = () => {
  const context = getContext()

  // Create analyzer
  analyzer = new Tone.Analyser('waveform', 1024)

  // Create white noise synth
  noise = new Tone.NoiseSynth({
    context,
    noise: {
      type: 'white',
    },
    envelope: {
      attack: attack.value,
      decay: decay.value,
      sustain: sustain.value,
      release: release.value,
    },
    volume: volume.value,
  }).connect(analyzer)
  analyzer.connect(output)

  // Start visualization
  drawWaveform()
}

const triggerNoise = () => {
  if (noise) {
    noise.triggerAttackRelease('8n')
  }
}

// Watch for audio initialization
watch(
  () => props.isAudioReady,
  (isReady) => {
    if (isReady) {
      initializeNoiseSynth()
    }
  },
)

// Watch for envelope changes
watch([attack, decay, sustain, release], () => {
  if (noise) {
    noise.envelope.attack = attack.value
    noise.envelope.decay = decay.value
    noise.envelope.sustain = sustain.value
    noise.envelope.release = release.value
  }
})

// Watch for volume changes
watch(volume, (value) => {
  if (noise) {
    noise.volume.value = value
  }
})

onMounted(() => {
  if (props.isAudioReady) {
    initializeNoiseSynth()
  }
})

onUnmounted(() => {
  if (noise) noise.dispose()
  if (analyzer) analyzer.dispose()
  output.dispose()
})

// Expose output node for LPG routing
defineExpose({
  output,
})
</script>

<template>
  <div class="noise-synth">
    <div class="synth">
      <h3>White Noise Synth</h3>
      <canvas ref="canvas" width="300" height="100" class="waveform"></canvas>
      <div class="controls">
        <div class="control-group">
          <label>Attack</label>
          <input type="range" min="0.01" max="1" step="0.01" v-model.number="attack" />
          <span>{{ attack }}s</span>
        </div>
        <div class="control-group">
          <label>Decay</label>
          <input type="range" min="0.01" max="1" step="0.01" v-model.number="decay" />
          <span>{{ decay }}s</span>
        </div>
        <div class="control-group">
          <label>Sustain</label>
          <input type="range" min="0" max="1" step="0.01" v-model.number="sustain" />
          <span>{{ sustain }}</span>
        </div>
        <div class="control-group">
          <label>Release</label>
          <input type="range" min="0.01" max="2" step="0.01" v-model.number="release" />
          <span>{{ release }}s</span>
        </div>
        <div class="control-group">
          <label>Volume</label>
          <input type="range" min="-40" max="0" step="1" v-model.number="volume" />
          <span>{{ volume }}dB</span>
        </div>
        <button class="trigger-button" @click="triggerNoise">Trigger White Noise</button>
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

.control-group input[type='range'] {
  width: 100%;
}

.control-group span {
  color: #666;
  font-size: 0.9rem;
}

.trigger-button {
  padding: 0.75rem;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

.trigger-button:hover {
  background: #1976d2;
}
</style>
