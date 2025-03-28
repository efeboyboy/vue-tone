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

// Update time display
const updateTime = () => {
  currentTime.value = Tone.getTransport().position.toString().split('.')[0]
  requestAnimationFrame(updateTime)
}

const initializeClock = () => {
  // Set initial BPM
  Tone.getTransport().bpm.value = bpm.value

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
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.clock-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #2196f3;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

button.active {
  background: #f44336;
}

.bpm-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bpm-control input[type='number'] {
  width: 60px;
  padding: 0.25rem;
}

.bpm-control input[type='range'] {
  width: 150px;
}

.time-display {
  font-family: monospace;
  font-size: 1.2rem;
  padding: 0.5rem;
  background: #333;
  color: #4caf50;
  border-radius: 4px;
  min-width: 80px;
  text-align: center;
}
</style>
