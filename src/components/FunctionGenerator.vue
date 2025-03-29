<script setup lang="ts">
import { onMounted, onUnmounted, watch, ref } from 'vue'
import * as Tone from 'tone'
import { useToneContext } from '@/composables/useToneContext'

const props = defineProps<{
  isAudioReady: boolean
  label: string
}>()

const { getContext } = useToneContext()

// Reactive envelope parameters
const attack = ref(0.01)
const decay = ref(0.1)

let func: Tone.Envelope
const output = new Tone.Gain()

const initializeFunctionGenerator = () => {
  console.log(`[FunctionGenerator ${props.label}] Initializing...`)
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
  console.log(
    `[FunctionGenerator ${props.label}] Initialized with attack: ${attack.value}s, decay: ${decay.value}s`,
  )
}

const updateEnvelopeParams = () => {
  if (!func) return
  func.attack = attack.value
  func.decay = decay.value
  console.log(
    `[FunctionGenerator ${props.label}] Parameters updated - attack: ${attack.value}s, decay: ${decay.value}s`,
  )
}

// Trigger the envelope with proper scheduling
const trigger = (time = Tone.now() + 0.1) => {
  if (!func) return
  console.log(`[FunctionGenerator ${props.label}] Triggered at time: ${time}`)
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

    // Monitor output signal
    const monitor = new Tone.Waveform()
    output.connect(monitor)

    // Log output values periodically
    setInterval(() => {
      const values = monitor.getValue()
      const maxValue = Math.max(...values)
      if (maxValue > 0.01) {
        // Only log when there's significant output
        console.log(
          `[FunctionGenerator ${props.label}] Output max amplitude: ${maxValue.toFixed(3)}`,
        )
      }
    }, 100)
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
  <div class="function-generator">
    <div class="module">
      <h3>{{ props.label }}</h3>
      <div class="controls">
        <div class="control-group">
          <label>Attack</label>
          <input type="range" min="0.001" max="0.25" step="0.001" v-model.number="attack" />
          <span>{{ Math.round(attack * 1000) }}ms</span>
        </div>
        <div class="control-group">
          <label>Decay</label>
          <input type="range" min="0.001" max="0.5" step="0.001" v-model.number="decay" />
          <span>{{ Math.round(decay * 1000) }}ms</span>
        </div>
        <button @click="handleTriggerClick" class="trigger-btn">Trigger</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.function-generator {
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  max-width: 400px;
  margin: 1rem;
}

.module {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.module h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-group label {
  font-weight: bold;
  color: #666;
}

.control-group input[type='range'] {
  width: 100%;
}

.control-group span {
  color: #666;
  font-size: 0.9rem;
}

.trigger-btn {
  padding: 0.5rem 1rem;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
}

.trigger-btn:hover {
  background: #45a049;
}
</style>
