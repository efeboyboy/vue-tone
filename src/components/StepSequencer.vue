<script setup lang="ts">
import * as Tone from 'tone'
import { ref, watch, onUnmounted, defineComponent } from 'vue'
import ControlKnob from './ui/ControlKnob.vue'
import MonoSwitch from './ui/MonoSwitch.vue'

defineComponent({
  name: 'StepSequencer',
})

const props = defineProps<{
  isAudioReady: boolean
  label?: string
}>()

// Sequencer state
const steps = ref(5)
const currentStep = ref(0)
const isSequencing = ref(false)
const sequence = ref(
  Array(5)
    .fill(null)
    .map(() => ({ active: false, freq: 440 })),
)

// Create frequency output using Tone.Signal
const frequencyOutput = new Tone.Signal(440)

// Initialize sequence
const initializeSequence = () => {
  // Schedule the sequence
  const repeat = (time: number) => {
    isSequencing.value = true
    const stepData = sequence.value[currentStep.value]

    // Update frequency output if step is active
    if (stepData.active) {
      frequencyOutput.setValueAtTime(stepData.freq, time)
    }

    // Advance to next step
    currentStep.value = (currentStep.value + 1) % steps.value
  }

  // Schedule the repeat callback on every 16th note
  Tone.getTransport().scheduleRepeat(repeat, '16n')
}

// Watch transport state
watch(
  () => Tone.getTransport().state,
  (state) => {
    isSequencing.value = state === 'started'
  },
)

// Cleanup on component unmount
onUnmounted(() => {
  Tone.getTransport().clear(0) // Clear all scheduled events
  frequencyOutput.dispose()
})

// Watch for audio initialization
watch(
  () => props.isAudioReady,
  (isReady) => {
    if (isReady) {
      initializeSequence()
    }
  },
)

// Get current step data
const getCurrentStepData = () => {
  return sequence.value[currentStep.value]
}

// Expose outputs for parent component
defineExpose({
  output: frequencyOutput,
  getCurrentStepData,
})
</script>

<template>
  <div class="step-sequencer">
    <h3>{{ label || 'Step Sequencer' }}</h3>
    <div class="sequence-grid">
      <div v-for="(step, stepIndex) in sequence" :key="stepIndex" class="step-container">
        <div
          class="led-indicator"
          :class="{ active: isSequencing && stepIndex === currentStep }"
        ></div>
        <MonoSwitch
          v-model="step.active"
          :label="step.active ? 'On' : 'Off'"
          size="small"
          class="step-switch"
        />
        <ControlKnob
          v-model="step.freq"
          :min="20"
          :max="2000"
          :step="1"
          :label="`${step.freq}Hz`"
          size="small"
          class="frequency-knob"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-sequencer {
  width: 100%;
  display: flex;
  flex-direction: column;
}

h3 {
  margin: 0 0 1rem 0;
  color: var(--text-accent);
}

.sequence-grid {
  display: flex;
  gap: 0.5rem;
  width: 100%;
  justify-content: space-between;
  padding: 0.5rem;
}

.step-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 60px;
  flex: 0 1 auto;
  position: relative;
}

.led-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--knob-background);
  margin-bottom: 4px;
  transition: all 0.2s ease;
}

.led-indicator.active {
  background: var(--led-active);
  box-shadow: 0 0 8px var(--led-glow);
}

.step-switch {
  margin: 0.25rem 0;
  min-width: 32px;
}

.frequency-knob {
  margin-top: 0.25rem;
  min-width: 50px;
}
</style>
