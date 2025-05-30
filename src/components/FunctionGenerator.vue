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
const decay = ref(0.08)
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
        <!-- Single LED indicator for the whole component -->
        <div class="main-led-indicator" :class="{ active: isTriggered }"></div>

        <div class="control-row">
          <div class="control-group">
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
.function-generator {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  height: 100%;
  width: 100%;
}

.function-generator .module-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
}

.function-generator .module-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  flex: 1;
  width: 100%;
  height: calc(100% - 25px);
  position: relative;
}

.function-generator .screen-container {
  width: 100%;
  flex: 1;
  display: flex;
  min-height: 0;
  contain: layout;
}

.control-section {
  position: relative;
}

.main-led-indicator {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: var(--led-size);
  height: var(--led-size);
  border-radius: var(--radius-full);
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-dark);
  box-shadow: var(--shadow-inset);
  transition: all 0.2s ease;
  z-index: 2;
}

.main-led-indicator.active {
  background-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}

.control-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  gap: var(--space-sm);
}

.knob-label {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  margin-top: var(--space-sm);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
