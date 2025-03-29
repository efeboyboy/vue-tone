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
                left: 'White',
                middle: 'Pink',
                right: 'Brown',
              }"
              :show-led="false"
              label="Type"
              size="medium"
            />
          </div>
        </div>
        <div class="control-row">
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

<style>
/* Component specific styles only */
</style>
