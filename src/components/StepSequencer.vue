<script setup lang="ts">
import * as Tone from 'tone'
import { ref, watch, onUnmounted, defineComponent } from 'vue'

defineComponent({
  name: 'StepSequencer',
})

const props = defineProps<{
  isAudioReady: boolean
}>()

// Sequencer state
const steps = ref(5)
const currentStep = ref(0)
const isSequencing = ref(false)
const channels = ref([
  {
    name: 'Osc 1',
    sequence: Array(5)
      .fill(null)
      .map(() => ({ active: 0, freq: 440 })),
  },
  {
    name: 'Osc 2',
    sequence: Array(5)
      .fill(null)
      .map(() => ({ active: 0, freq: 440 })),
  },
  {
    name: 'Noise',
    sequence: Array(5)
      .fill(null)
      .map(() => ({ active: 0, freq: 1000 })),
  },
])

// Create frequency outputs using Tone.Signal
const outputs = {
  freq1: new Tone.Signal(440),
  freq2: new Tone.Signal(440),
  playbackRate: new Tone.Signal(1),
}

// Initialize sequence
const initializeSequence = () => {
  // Schedule the sequence
  const repeat = (time: number) => {
    isSequencing.value = true
    const currentStepData = {
      osc1: channels.value[0].sequence[currentStep.value],
      osc2: channels.value[1].sequence[currentStep.value],
      noise: channels.value[2].sequence[currentStep.value],
    }

    // Update frequency outputs if step is active
    if (currentStepData.osc1.active) {
      outputs.freq1.setValueAtTime(currentStepData.osc1.freq, time)
    }
    if (currentStepData.osc2.active) {
      outputs.freq2.setValueAtTime(currentStepData.osc2.freq, time)
    }
    if (currentStepData.noise.active) {
      outputs.playbackRate.setValueAtTime(currentStepData.noise.freq / 1000, time)
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

// Sequence controls
const toggleStep = (channelIndex: number, stepIndex: number) => {
  const step = channels.value[channelIndex].sequence[stepIndex]
  step.active = step.active === 0 ? 1 : 0
}

const updateFrequency = (channelIndex: number, stepIndex: number, event: Event) => {
  const value = +(event.target as HTMLInputElement).value
  channels.value[channelIndex].sequence[stepIndex].freq = value
}

// Cleanup on component unmount
onUnmounted(() => {
  Tone.getTransport().clear(0) // Clear all scheduled events
  outputs.freq1.dispose()
  outputs.freq2.dispose()
  outputs.playbackRate.dispose()
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

// Get current step data for a channel
const getCurrentStepData = (channelIndex: number) => {
  return channels.value[channelIndex].sequence[currentStep.value]
}

// Expose outputs for parent component
defineExpose({
  outputs,
  getCurrentStepData,
})
</script>

<template>
  <div class="step-sequencer">
    <h3>Step Sequencer</h3>
    <div class="channels">
      <div v-for="(channel, channelIndex) in channels" :key="channel.name" class="channel">
        <div class="channel-label">{{ channel.name }}</div>
        <div class="sequence-grid">
          <div
            v-for="(step, stepIndex) in channel.sequence"
            :key="stepIndex"
            class="step-container"
            :class="{ playing: isSequencing && stepIndex === currentStep }"
          >
            <button
              @click="toggleStep(channelIndex, stepIndex)"
              :class="{
                step: true,
                active: step.active === 1,
                current: stepIndex === currentStep && isSequencing,
              }"
            />
            <input
              type="range"
              :value="step.freq"
              :min="channel.name === 'Noise' ? 100 : 20"
              :max="channel.name === 'Noise' ? 10000 : 2000"
              step="1"
              class="frequency-slider"
              @input="(e) => updateFrequency(channelIndex, stepIndex, e)"
            />
            <div class="freq-value">
              {{ step.freq }}{{ channel.name === 'Noise' ? 'Hz' : 'Hz' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.step-sequencer {
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  margin-top: 1rem;
}

.channels {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.channel {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.channel-label {
  width: 60px;
  font-weight: bold;
  color: #2196f3;
}

.sequence-grid {
  display: flex;
  gap: 1rem;
  flex-grow: 1;
}

.step-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  position: relative;
}

.step-container::after {
  content: '';
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4caf50;
  opacity: 0;
  transition: opacity 0.2s;
}

.step-container.playing::after {
  opacity: 1;
}

.step {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 2px solid #2196f3;
  background: white;
  cursor: pointer;
}

.step.active {
  background: #2196f3;
  box-shadow: 0 0 10px rgba(33, 150, 243, 0.5);
}

.step.current {
  border-color: #f44336;
  box-shadow: 0 0 10px rgba(244, 67, 54, 0.5);
}

.step.active.current {
  background: #f44336;
  box-shadow: 0 0 10px rgba(244, 67, 54, 0.5);
}

.frequency-slider {
  width: 100%;
  margin: 0;
}

.freq-value {
  font-size: 0.8rem;
  color: #666;
}
</style>
