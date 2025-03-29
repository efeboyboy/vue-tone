<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref } from 'vue'
import * as Tone from 'tone'
import { useToneContext } from '@/composables/useToneContext'
import ControlKnob from './ui/ControlKnob.vue'

const props = defineProps<{
  isAudioReady: boolean
  label: string
}>()

const { getContext } = useToneContext()

// Reactive envelope parameters
const attack = ref(0.01)
const decay = ref(0.1)

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
  func.triggerAttackRelease(decay.value, time)
}

// Handle manual button clicks
const handleTriggerClick = () => {
  trigger()
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
  <div class="module">
    <h3>{{ props.label }}</h3>
    <div class="led-indicator" :class="{ active: isActive }"></div>
    <div class="controls">
      <div class="knobs-row">
        <div class="control-group">
          <label>Attack</label>
          <ControlKnob
            v-model="attack"
            :min="0.001"
            :max="0.25"
            :step="0.001"
            label="attack"
            size="small"
          />
          <span>{{ Math.round(attack * 1000) }}ms</span>
        </div>
        <div class="control-group">
          <label>Decay</label>
          <ControlKnob
            v-model="decay"
            :min="0.001"
            :max="0.5"
            :step="0.001"
            label="decay"
            size="small"
          />
          <span>{{ Math.round(decay * 1000) }}ms</span>
        </div>
      </div>
      <button @click="handleTriggerClick" class="trigger-btn">Trigger</button>
    </div>
  </div>
</template>

<style scoped>
.module {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  border-radius: 8px;
  position: relative;
}

.led-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--secondary-color);
  opacity: 0.3;
  position: absolute;
  top: 2rem;
  right: 2rem;
  transition: all 0.1s ease;
}

.led-indicator.active {
  background-color: var(--accent-color);
  opacity: 1;
  box-shadow: 0 0 8px var(--accent-color);
}

.module h3 {
  color: var(--secondary-color);
  margin-bottom: 1rem;
  text-align: center;
  font-weight: 400;
  font-size: 1.25rem;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.knobs-row {
  display: flex;
  gap: 3rem;
  justify-content: center;
  width: 100%;
}

.control-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  font-weight: bold;
  color: var(--secondary-color);
}

.control-group span {
  color: var(--secondary-color);
  font-size: 0.9rem;
}

.trigger-btn {
  padding: 0.75rem 2rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
  width: 100%;
}

.trigger-btn:hover {
  filter: brightness(1.1);
}
</style>
