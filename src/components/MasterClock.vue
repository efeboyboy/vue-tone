<script setup lang="ts">
import { ref, watch } from 'vue'
import * as Tone from 'tone'
import ControlKnob from './ui/ControlKnob.vue'

const props = defineProps<{
  isAudioReady: boolean
}>()

// Transport state
const isPlaying = ref(false)
const bpm = ref(120)
const currentTime = ref('0:0:0')
const swing = ref(0)

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

// Update swing when changed
watch(swing, (newSwing) => {
  Tone.getTransport().swing = newSwing
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
  swing,
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
      <!-- LED Indicators Row -->
      <div class="led-container">
        <div
          v-for="n in 4"
          :key="n"
          class="led-indicator"
          :class="{ active: isPlaying && activeLed === n - 1 }"
        ></div>
      </div>

      <div class="control-section">
        <!-- Top row with time display -->
        <div class="control-row">
          <div class="time-display">
            <div class="display-label">BPM</div>
            <div class="display-value">{{ bpm }}</div>
          </div>
          <button @click="toggleTransport" :class="{ active: isPlaying }" class="transport-btn">
            {{ isPlaying ? '⏹' : '▶' }}
          </button>
        </div>

        <!-- Bottom row with knobs -->
        <div class="control-row">
          <div class="control-group">
            <ControlKnob v-model="bpm" :min="30" :max="300" :step="1" label="bpm" size="medium" />
          </div>
          <div class="control-group">
            <ControlKnob
              v-model="swing"
              :min="0"
              :max="1"
              :step="0.01"
              label="swing"
              size="medium"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.master-clock {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-sm);
  height: 100%;
  width: 100%;
  justify-content: space-between;
}

.module-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.led-container {
  display: flex;
  justify-content: space-around;
  margin-bottom: var(--space-md);
  width: 100%;
}

.led-indicator {
  width: var(--led-size, clamp(6px, 0.75vw, 8px));
  height: var(--led-size, clamp(6px, 0.75vw, 8px));
  border-radius: var(--radius-full);
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-dark);
  box-shadow: var(--shadow-inset);
  transition: all 0.2s ease;
}

.led-indicator.active {
  background-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}

.control-section {
  transform-origin: center center;
  height: 100%;
  justify-content: space-evenly;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.control-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  gap: var(--space-md);
}

.control-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.transport-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-sans);
  box-shadow: var(--shadow-inset);
}

.transport-btn:hover {
  background-color: var(--color-bg-tertiary);
}

.transport-btn.active {
  background-color: var(--color-primary-dark);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}

.time-display {
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-inset);
  padding: var(--space-xs);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 60px;
}

.display-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  font-family: var(--font-sans);
  letter-spacing: 0.05em;
}

.display-value {
  font-family: monospace;
  font-size: 1rem;
  color: var(--color-text-primary);
  text-align: center;
  width: 100%;
}
</style>
