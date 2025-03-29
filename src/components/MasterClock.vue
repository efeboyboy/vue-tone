<script setup lang="ts">
import { ref, watch } from 'vue'
import * as Tone from 'tone'

const props = defineProps<{
  isAudioReady: boolean
}>()

// Transport state
const isPlaying = ref(false)
const bpm = ref(120)
const currentTime = ref('0:0:0')

// LED states
const activeLed = ref(0)

// Update time display and LEDs
const updateTime = () => {
  currentTime.value = Tone.getTransport().position.toString().split('.')[0]
  requestAnimationFrame(updateTime)
}

const initializeClock = () => {
  // Set initial BPM
  Tone.getTransport().bpm.value = bpm.value

  // Schedule beat tracking for LEDs
  Tone.getTransport().scheduleRepeat(() => {
    activeLed.value = (activeLed.value + 1) % 4
  }, '4n') // Schedule on quarter notes for 4/4 time

  // Start time display updates
  updateTime()
}

// Transport controls
const toggleTransport = async () => {
  if (!isPlaying.value) {
    await Tone.start()
    Tone.getTransport().start()
    isPlaying.value = true
  } else {
    Tone.getTransport().stop()
    isPlaying.value = false
    activeLed.value = 0 // Reset LED when stopped
  }
}

// Update BPM when changed
watch(bpm, (newBpm) => {
  Tone.getTransport().bpm.value = newBpm
})

watch(
  () => props.isAudioReady,
  (isReady) => {
    if (isReady) {
      initializeClock()
    }
  },
)

// Expose transport controls for other components
defineExpose({
  isPlaying,
  bpm,
  currentTime,
  toggleTransport,
})
</script>

<template>
  <div class="module master-clock">
    <div class="module-header">
      <h3>Master Clock</h3>
    </div>
    <div class="module-content">
      <div class="led-container">
        <div
          v-for="n in 4"
          :key="n"
          class="led-indicator"
          :class="{ active: isPlaying && activeLed === n - 1 }"
        ></div>
      </div>
      <div class="clock-controls">
        <button @click="toggleTransport" :class="{ active: isPlaying }" class="transport-btn">
          {{ isPlaying ? '⏹ Stop' : '▶ Play' }}
        </button>
        <div class="bpm-control">
          <label>BPM:</label>
          <input type="number" v-model.number="bpm" min="30" max="300" />
          <input type="range" v-model.number="bpm" min="30" max="300" />
        </div>
        <div class="time-display">{{ currentTime }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.master-clock {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  height: 100%;
  width: 100%;
}

.led-container {
  display: flex;
  justify-content: space-around;
  margin-bottom: var(--space-md);
}

.clock-controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  width: 100%;
}

.transport-btn {
  padding: var(--space-sm);
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: var(--shadow-inset);
  width: 100%;
}

.transport-btn:hover {
  background-color: var(--color-bg-tertiary);
}

.transport-btn.active {
  background-color: var(--color-primary-dark);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}

.bpm-control {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  width: 100%;
}

.bpm-control label {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
}

.bpm-control input[type='number'] {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-sm);
  padding: var(--space-sm);
  font-family: var(--font-sans);
  width: 100%;
}

.bpm-control input[type='range'] {
  width: 100%;
  -webkit-appearance: none;
  background-color: var(--color-bg-tertiary);
  height: 6px;
  border-radius: var(--radius-sm);
}

.bpm-control input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background-color: var(--color-primary);
  border-radius: 50%;
  cursor: pointer;
}

.time-display {
  font-family: monospace;
  font-size: 1.1rem;
  color: var(--color-text-primary);
  text-align: center;
  background-color: var(--color-bg-tertiary);
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-inset);
}
</style>
