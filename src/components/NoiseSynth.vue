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
const noiseType = ref<'white' | 'pink' | 'brown'>('pink')
const playbackRate = ref(0.5)

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
    noise.type = value.toLowerCase() as 'white' | 'pink' | 'brown'
  }
})

watch(playbackRate, (value) => {
  if (noise) {
    noise.playbackRate = value
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
  <div class="module noise-synth">
    <div class="module-header">
      <h3>Noise</h3>
    </div>
    <div class="module-content">
      <div class="control-section">
        <div class="control-row">
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
              size="medium"
            />
          </div>
          <div class="control-group">
            <ControlKnob
              v-model="playbackRate"
              :min="0.1"
              :max="4"
              :step="0.1"
              label="Rate"
              size="medium"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.noise-synth {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  min-height: 0;
  padding: var(--space-sm);
  width: 100%;
  height: 100%;
}

.control-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.control-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  gap: var(--space-md);
  height: 100%;
}

.control-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.noise-voice .oscillator-module .control-row {
  align-items: center;
  display: flex;
  height: 100%;
}
</style>
