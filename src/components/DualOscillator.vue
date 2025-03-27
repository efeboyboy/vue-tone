<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as Tone from 'tone'
import { useToneContext } from '../composables/useToneContext'

const { getContext } = useToneContext()

let osc1: Tone.Oscillator
let osc2: Tone.Oscillator

const isPlaying = ref(false)
const freq1 = ref(440)
const freq2 = ref(443)
const detune = ref(3)

const updateFrequencies = () => {
  const baseFreq = freq1.value
  freq2.value = baseFreq + detune.value
  if (osc1 && osc2) {
    osc1.frequency.value = freq1.value
    osc2.frequency.value = freq2.value
  }
}

const toggleOscillators = () => {
  if (!osc1 || !osc2) return

  if (isPlaying.value) {
    osc1.stop()
    osc2.stop()
  } else {
    osc1.start()
    osc2.start()
  }
  isPlaying.value = !isPlaying.value
}

onMounted(() => {
  const context = getContext()

  osc1 = new Tone.Oscillator({
    context,
    frequency: freq1.value,
    type: 'sine',
    volume: -10,
  }).toDestination()

  osc2 = new Tone.Oscillator({
    context,
    frequency: freq2.value,
    type: 'sine',
    volume: -10,
  }).toDestination()
})

onUnmounted(() => {
  if (osc1) osc1.dispose()
  if (osc2) osc2.dispose()
})
</script>

<template>
  <div class="dual-oscillator">
    <div class="controls">
      <div class="control-group">
        <label>Base Frequency (Hz)</label>
        <input type="range" min="220" max="880" v-model.number="freq1" @input="updateFrequencies" />
        <span>{{ freq1 }}Hz</span>
      </div>

      <div class="control-group">
        <label>Detune (Hz)</label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.1"
          v-model.number="detune"
          @input="updateFrequencies"
        />
        <span>{{ detune }}Hz</span>
      </div>

      <button @click="toggleOscillators" :class="{ playing: isPlaying }" class="toggle-button">
        {{ isPlaying ? 'Stop' : 'Start' }} Oscillators
      </button>
    </div>
  </div>
</template>

<style scoped>
.dual-oscillator {
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  max-width: 400px;
  margin: 1rem;
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
}

.control-group input[type='range'] {
  width: 100%;
}

.toggle-button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-button.playing {
  background-color: #f44336;
}

.toggle-button:hover {
  opacity: 0.9;
}
</style>
