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
  padding: var(--module-padding);
  background: var(--panel-background);
  border-radius: var(--module-border-radius);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

h3 {
  color: var(--secondary-color);
  margin: 0;
  text-align: center;
  font-weight: 400;
  font-size: var(--font-size-xl);
  font-family: var(--font-family);
}

.led-container {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
}

.led {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--led-inactive);
  transition: all var(--transition-normal);
}

.led.active {
  background: var(--led-active);
  box-shadow: 0 0 8px var(--led-glow);
}

.clock-controls {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
  justify-content: center;
}

button {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--border-radius-sm);
  background: var(--accent-color);
  color: var(--secondary-color);
  cursor: pointer;
  font-weight: bold;
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
  transition: all var(--transition-normal);
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
  gap: var(--spacing-md);
  color: var(--secondary-color);
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
}

.bpm-control input[type='number'] {
  width: 60px;
  padding: var(--spacing-sm);
  background: var(--background-color-light);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  color: var(--secondary-color);
  font-family: var(--font-family);
  font-size: var(--font-size-sm);
}

.bpm-control input[type='range'] {
  width: 120px;
  accent-color: var(--accent-color);
}

.time-display {
  font-family: monospace;
  font-size: var(--font-size-lg);
  padding: var(--spacing-sm);
  background: var(--background-color-light);
  color: var(--accent-color);
  border-radius: var(--border-radius-sm);
  min-width: 80px;
  text-align: center;
  border: 1px solid var(--border-color);
}
</style>
