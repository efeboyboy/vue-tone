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

<style>
/* Component specific styles only */
</style>
