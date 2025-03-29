<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as Tone from 'tone'
import { useToneContext } from '../composables/useToneContext'
import ControlKnob from './ui/ControlKnob.vue'
import ToggleButton from './ui/ToggleButton.vue'

const props = defineProps<{
  isAudioInitialized: boolean
}>()

const { getContext } = useToneContext()

// Create input and output nodes
const input = new Tone.Gain()
const output = new Tone.Gain()
const dry = new Tone.Gain(1)
const wet = new Tone.Gain(0.3)

// Create effects
let reverb: Tone.Reverb
let delay: Tone.FeedbackDelay

// Effect parameters
const reverbEnabled = ref(true)
const reverbAmount = ref(30)
const reverbDecay = ref(2)

const delayEnabled = ref(true)
const delayAmount = ref(30)
const delayTime = ref(0.25)
const delayFeedback = ref(0.4)

// Initialize effects
const initializeEffects = () => {
  const context = getContext()

  // Create reverb
  reverb = new Tone.Reverb({
    context,
    decay: reverbDecay.value,
    preDelay: 0.01,
    wet: 1,
  })

  // Create delay
  delay = new Tone.FeedbackDelay({
    context,
    delayTime: delayTime.value,
    feedback: delayFeedback.value,
    wet: 1,
  })

  // Routing
  // Dry path
  input.connect(dry)
  dry.connect(output)

  // Wet path
  input.connect(wet)

  // Connect wet signal to effects
  // Create parallel routing for effects
  if (reverbEnabled.value) {
    wet.connect(reverb)
    reverb.connect(output)
  }

  if (delayEnabled.value) {
    wet.connect(delay)
    delay.connect(output)
  }

  // Apply initial settings
  updateReverbAmount()
  updateDelayAmount()
  updateReverbDecay()
  updateDelay()
}

// Update functions
const updateReverbAmount = () => {
  wet.gain.rampTo(reverbAmount.value / 100, 0.1)
}

const updateDelayAmount = () => {
  wet.gain.rampTo(delayAmount.value / 100, 0.1)
}

const updateReverbDecay = () => {
  if (reverb) {
    reverb.decay = reverbDecay.value
  }
}

const updateDelay = () => {
  if (delay) {
    delay.delayTime.value = delayTime.value
    delay.feedback.value = delayFeedback.value
  }
}

const toggleReverb = () => {
  if (reverb) {
    if (reverbEnabled.value) {
      wet.connect(reverb)
      reverb.connect(output)
    } else {
      try {
        wet.disconnect(reverb)
        reverb.disconnect(output)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // Disconnect may fail if not connected
      }
    }
  }
}

const toggleDelay = () => {
  if (delay) {
    if (delayEnabled.value) {
      wet.connect(delay)
      delay.connect(output)
    } else {
      try {
        wet.disconnect(delay)
        delay.disconnect(output)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // Disconnect may fail if not connected
      }
    }
  }
}

// Watch for audio initialization
watch(
  () => props.isAudioInitialized,
  (isReady) => {
    if (isReady) {
      initializeEffects()
    }
  },
)

// Watch for parameter changes
watch(reverbEnabled, toggleReverb)
watch(delayEnabled, toggleDelay)
watch(reverbAmount, updateReverbAmount)
watch(delayAmount, updateDelayAmount)
watch(reverbDecay, updateReverbDecay)
watch(delayTime, updateDelay)
watch(delayFeedback, updateDelay)

onMounted(() => {
  if (props.isAudioInitialized) {
    initializeEffects()
  }
})

onUnmounted(() => {
  // Clean up audio nodes
  if (reverb) reverb.dispose()
  if (delay) delay.dispose()
  input.dispose()
  output.dispose()
  dry.dispose()
  wet.dispose()
})

// Expose nodes for external connections
defineExpose({
  input,
  output,
})
</script>

<template>
  <div class="module fx-unit">
    <div class="module-header">
      <h3>FX Unit</h3>
    </div>
    <div class="module-content">
      <div class="control-section">
        <div class="fx-row">
          <div class="fx-module reverb">
            <div class="fx-header">
              <ToggleButton v-model="reverbEnabled" label="Reverb" size="small" />
            </div>
            <div class="knob-group">
              <ControlKnob
                v-model="reverbAmount"
                :min="0"
                :max="100"
                :step="1"
                label="amount"
                size="small"
              />
              <ControlKnob
                v-model="reverbDecay"
                :min="0.1"
                :max="6"
                :step="0.1"
                label="decay"
                size="small"
              />
            </div>
          </div>
          <div class="fx-module delay">
            <div class="fx-header">
              <ToggleButton v-model="delayEnabled" label="Delay" size="small" />
            </div>
            <div class="knob-group">
              <ControlKnob
                v-model="delayAmount"
                :min="0"
                :max="100"
                :step="1"
                label="amount"
                size="small"
              />
              <ControlKnob
                v-model="delayTime"
                :min="0.05"
                :max="1"
                :step="0.05"
                label="time"
                size="small"
              />
              <ControlKnob
                v-model="delayFeedback"
                :min="0"
                :max="0.9"
                :step="0.05"
                label="feedback"
                size="small"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fx-unit {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  padding: var(--space-sm);
  width: 100%;
  height: 100%;
}

.fx-row {
  display: flex;
  justify-content: space-around;
  gap: var(--space-md);
  width: 100%;
}

.fx-module {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  padding: var(--space-sm);
  flex: 1;
}

.fx-header {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-xs);
  width: 100%;
}

.knob-group {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}
</style>
