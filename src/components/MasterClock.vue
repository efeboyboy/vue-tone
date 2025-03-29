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
  Tone.getTransport().scheduleRepeat((time) => {
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
  <div class="master-clock">
    <h3>Master Clock</h3>
    <div class="led-container">
      <div
        v-for="n in 4"
        :key="n"
        class="led"
        :class="{ active: isPlaying && activeLed === n - 1 }"
      ></div>
    </div>
    <div class="clock-controls">
      <button @click="toggleTransport" :class="{ active: isPlaying }">
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
</template>

<style scoped>
.master-clock {
  padding: 2rem;
  background: var(--background-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

h3 {
  color: var(--secondary-color);
  margin: 0;
  text-align: center;
  font-weight: 400;
  font-size: 1.25rem;
}

.led-container {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}

.led {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--knob-background);
  opacity: 1;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.led.active {
  background: #ff5f56;
  box-shadow: 0 0 8px rgba(255, 95, 86, 0.5);
}

.clock-controls {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  background: var(--accent-color);
  color: white;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

button:hover {
  filter: brightness(1.1);
}

button.active {
  background: var(--danger-color);
}

.bpm-control {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--secondary-color);
}

.bpm-control input[type='number'] {
  width: 60px;
  padding: 0.5rem;
  background: var(--background-color-light);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-color);
}

.bpm-control input[type='range'] {
  width: 150px;
  accent-color: var(--accent-color);
}

.time-display {
  font-family: monospace;
  font-size: 1.2rem;
  padding: 0.75rem;
  background: var(--background-color-light);
  color: var(--accent-color);
  border-radius: 4px;
  min-width: 80px;
  text-align: center;
  border: 1px solid var(--border-color);
}
</style>
