<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref } from 'vue'
import * as Tone from 'tone'
import { useToneContext } from '@/composables/useToneContext'
import ControlKnob from './ui/ControlKnob.vue'
import EnvelopeScreen from './EnvelopeScreen.vue'

const props = defineProps<{
  label?: string
  isAudioReady?: boolean
}>()

const { getContext } = useToneContext()

// Reactive envelope parameters
const attack = ref(0.01)
const decay = ref(0.1)
const isTriggered = ref(false)

let func: Tone.Envelope
const output = new Tone.Gain(2) // Set initial gain to 5 for stronger modulation

// Add LED state and threshold
const isActive = ref(false)
const LED_THRESHOLD = 0.01

const initializeFunctionGenerator = () => {
  // console.log(`[FunctionGenerator ${props.label}] Initializing...`)
  const context = getContext()

  // Create envelope with AD configuration
  func = new Tone.Envelope({
    context,
    attack: attack.value,
    decay: decay.value,
    sustain: 0, // We're using AD envelope, so sustain is always 0
    release: 0, // Not using release for AD envelope
  })

  // Connect envelope directly to output
  func.connect(output)

  // Create monitor for LED
  const monitor = new Tone.Waveform()
  output.connect(monitor)

  // Update LED based on envelope signal
  const updateLED = () => {
    const values = monitor.getValue()
    const maxValue = Math.max(...values)
    isActive.value = maxValue > LED_THRESHOLD

    // Only log when there's significant output
    //if (maxValue > LED_THRESHOLD) {
    // console.log(`[FunctionGenerator ${props.label}] Output amplitude: ${maxValue.toFixed(3)}`)
    //}

    requestAnimationFrame(updateLED)
  }
  updateLED()

  // console.log(
  //   `[FunctionGenerator ${props.label}] Initialized with attack: ${attack.value}s, decay: ${decay.value}s`,
  // )
}

const updateEnvelopeParams = () => {
  if (!func) return
  func.attack = attack.value
  func.decay = decay.value
  // console.log(
  //   `[FunctionGenerator ${props.label}] Parameters updated - attack: ${attack.value}s, decay: ${decay.value}s`,
  // )
}

// Update trigger function to remove manual LED control
const trigger = (time = Tone.now() + 0.1) => {
  if (!func) return
  // console.log(`[FunctionGenerator ${props.label}] Triggered at time: ${time}`)
  isTriggered.value = true
  func.triggerAttackRelease(decay.value, time)
  setTimeout(() => {
    isTriggered.value = false
  }, decay.value * 1000)
}

watch([attack, decay], updateEnvelopeParams)

watch(
  () => props.isAudioReady,
  (isReady) => {
    if (isReady) {
      initializeFunctionGenerator()
    }
  },
)

onMounted(() => {
  if (props.isAudioReady) {
    initializeFunctionGenerator()
  }
})

onUnmounted(() => {
  if (func) func.dispose()
  output.dispose()
})

defineExpose({
  output,
  trigger,
})
</script>

<template>
  <div class="module function-generator">
    <div class="module-header">
      <h3>{{ props.label }}</h3>
    </div>
    <div class="module-content">
      <div class="screen-container">
        <EnvelopeScreen :attack-time="attack" :decay-time="decay" :triggered="isTriggered" />
      </div>
      <div class="control-section">
        <div class="control-row">
          <div class="control-group">
            <div class="led-indicator" :class="{ active: isTriggered }"></div>
            <ControlKnob
              v-model="attack"
              :min="0.001"
              :max="0.25"
              :step="0.001"
              label="ATTACK"
              size="medium"
            />
          </div>
          <div class="control-group">
            <div class="led-indicator" :class="{ active: isTriggered }"></div>
            <ControlKnob
              v-model="decay"
              :min="0.001"
              :max="0.5"
              :step="0.001"
              label="DECAY"
              size="medium"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.module-header h3 {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  text-align: center;
  margin-bottom: var(--space-xxs);
}

.control-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.led-indicator {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: var(--led-size);
  height: var(--led-size);
  z-index: 2;
}
</style>
