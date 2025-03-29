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

// Randomize sequence steps
const randomize = (activeProbability = 0.5, freqMin = 100, freqMax = 1200) => {
  sequence.value = sequence.value.map(() => {
    // Randomly set each step as active based on probability
    const active = Math.random() < activeProbability

    // Generate random frequency within range
    const freq = Math.floor(freqMin + Math.random() * (freqMax - freqMin))

    return { active, freq }
  })
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
  randomize,
})
</script>

<template>
  <div class="module step-sequencer">
    <div class="module-header">
      <h3>{{ label || 'Sequencer' }}</h3>
    </div>
    <div class="module-content">
      <div class="sequence-grid">
        <div v-for="(step, stepIndex) in sequence" :key="stepIndex" class="step-container">
          <div
            class="led-indicator"
            :class="{ active: isSequencing && stepIndex === currentStep }"
          ></div>
          <MonoSwitch v-model="step.active" :label="''" size="small" class="step-switch" />
          <div class="knob-container">
            <div class="knob-socket"></div>
            <ControlKnob
              v-model="step.freq"
              :min="20"
              :max="2000"
              :step="1"
              :label="`${step.freq}Hz`"
              size="medium"
              class="frequency-knob"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sequence-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: clamp(2px, 0.5vw, 4px);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  place-items: stretch;
}

.step-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  position: relative;
  width: 100%;
  height: 100%;
  justify-content: space-between;
  padding: var(--space-xs) 0;
}

.led-indicator {
  width: var(--led-size);
  height: var(--led-size);
  border-radius: var(--radius-full);
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-dark);
  box-shadow: var(--shadow-inset);
  transition: all 0.1s ease;
  margin-bottom: 0;
}

.led-indicator.active {
  background-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}

.step-switch {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 0;
  max-width: calc(var(--knob-size, clamp(40px, 5vw, 60px)) * 0.8);
}

.knob-container {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.knob-socket {
  position: absolute;
  width: clamp(44px, 5.5vw, 66px);
  height: clamp(44px, 5.5vw, 66px);
  border-radius: 50%;
  background: var(--color-bg-darkest);
  box-shadow: var(--shadow-inset);
  border: 1px solid var(--color-border-darkest);
  z-index: -1;
}

.frequency-knob {
  position: relative;
  z-index: 1;
}

.module-content {
  height: calc(100% - 25px);
  padding: var(--space-sm);
  overflow: hidden;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.step-sequencer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
