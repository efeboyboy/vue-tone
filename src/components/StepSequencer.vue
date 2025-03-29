<script setup lang="ts">
import * as Tone from 'tone'
import { ref, watch, onUnmounted, defineComponent } from 'vue'
import ControlKnob from './ui/ControlKnob.vue'
import TwoWaySwitch from './ui/TwoWaySwitch.vue'

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
    .map(() => ({ active: 0, freq: 440 })),
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
        <TwoWaySwitch
          v-model="step.active"
          :options="{ off: 'Skip', on: 'Play' }"
          :show-led="false"
          class="step-switch"
        />
        <ControlKnob
          v-model="step.freq"
          :min="20"
          :max="2000"
          :step="1"
          :label="`${step.freq}Hz`"
          class="frequency-knob"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-sequencer {
  padding: 1rem;
  background: var(--panel-background);
  border-radius: 8px;
  margin-top: 1rem;
  color: var(--text-primary);
}

h3 {
  margin: 0 0 1rem 0;
  color: var(--text-accent);
}

.sequence-grid {
  display: flex;
  gap: 1.5rem;
  flex-grow: 1;
  justify-content: space-between;
  padding: 1rem;
}

.step-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  flex: 1;
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
  background: #ff5f56;
  box-shadow: 0 0 8px rgba(255, 95, 86, 0.5);
}

.step-switch {
  margin: 0.5rem 0;
}

.frequency-knob {
  margin-top: 0.5rem;
}
</style>
