<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as Tone from 'tone'
import { useToneContext } from '../composables/useToneContext'
import ControlKnob from './ui/ControlKnob.vue'
import ThreeWaySwitch from './ui/ThreeWaySwitch.vue'

const props = defineProps<{
  isAudioReady: boolean
}>()

const { getContext } = useToneContext()

// Create output and analyzer nodes
const output = new Tone.Gain()

// Create playbackRate control signal for external modulation
const playbackRateSignal = new Tone.Signal(1)

let noise: Tone.Noise
const noiseType = ref<'white' | 'pink' | 'brown'>('white')
const playbackRate = ref(1)

const initializeNoise = () => {
  const context = getContext()

  noise = new Tone.Noise({
    context,
    type: noiseType.value,
    playbackRate: playbackRate.value,
  })

  // Connect noise to output
  noise.connect(output)

  // Start noise immediately (it will be controlled by LPG)
  noise.start()
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

onMounted(() => {
  if (props.isAudioReady) {
    initializeNoise()
  }
})

onUnmounted(() => {
  if (noise) noise.dispose()
  playbackRateSignal.dispose()
  output.dispose()
})

// Expose nodes for external routing
defineExpose({
  output,
  playbackRate: playbackRateSignal,
})
</script>

<template>
  <div class="module">
    <h3>Noise Source</h3>
    <div class="controls">
      <div class="control-group">
        <ThreeWaySwitch
          v-model="noiseType"
          :options="{
            left: 'white',
            middle: 'pink',
            right: 'brown',
          }"
          :show-led="false"
          label="Type"
          size="small"
        />
      </div>
      <div class="control-group">
        <ControlKnob
          v-model="playbackRate"
          :min="0.1"
          :max="4"
          :step="0.1"
          label="rate"
          size="small"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.module {
  display: flex;
  flex-direction: column;
  padding: var(--module-padding);
  border-radius: var(--module-border-radius);
  background: var(--panel-background);
  border: 1px solid var(--border-color);
  gap: var(--spacing-lg);
}

.module h3 {
  color: var(--secondary-color);
  margin: 0;
  text-align: center;
  font-weight: 400;
  font-size: var(--font-size-xl);
  font-family: var(--font-family);
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
}

.control-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.control-group label {
  font-weight: 400;
  color: var(--secondary-color);
  font-size: var(--font-size-sm);
  font-family: var(--font-family);
}
</style>
