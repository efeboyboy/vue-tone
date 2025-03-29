<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, reactive } from 'vue'
import * as Tone from 'tone'
import ControlKnob from './ui/ControlKnob.vue'
import ToggleButton from './ui/ToggleButton.vue'

const props = defineProps<{
  isAudioInitialized: boolean
}>()

// Master volume control
const masterVolume = ref(80)
const masterGain = new Tone.Gain(0.8)
const output = new Tone.Gain()

// Create reactive channel states
const channelStates = reactive([
  { volume: 50, mute: false, solo: false },
  { volume: 50, mute: false, solo: false },
  { volume: 10, mute: false, solo: false },
])

// Create audio nodes for each channel
const channelNodes = [
  { label: 'A', input: new Tone.Gain(), gain: new Tone.Gain(0.8) },
  { label: 'B', input: new Tone.Gain(), gain: new Tone.Gain(0.8) },
  { label: 'C', input: new Tone.Gain(), gain: new Tone.Gain(0.8) },
]

// Initialize mixer
const initializeMixer = () => {
  // Connect each channel to the master output
  channelNodes.forEach((channel) => {
    channel.input.connect(channel.gain)
    channel.gain.connect(masterGain)
  })

  // Connect master gain to output
  masterGain.connect(output)

  updateAllChannels()
}

// Update channel gain values based on volume, mute, and solo settings
const updateAllChannels = () => {
  const hasSolo = channelStates.some((ch) => ch.solo)

  channelStates.forEach((state, index) => {
    // Convert volume (0-100) to gain (0-1)
    const gainValue = state.volume / 100

    // Apply gain based on mute/solo status
    if (state.mute || (hasSolo && !state.solo)) {
      channelNodes[index].gain.gain.rampTo(0, 0.1)
    } else {
      channelNodes[index].gain.gain.rampTo(gainValue, 0.1)
    }
  })

  // Update master volume
  masterGain.gain.rampTo(masterVolume.value / 100, 0.1)
}

// Watch for audio initialization
watch(
  () => props.isAudioInitialized,
  (isReady) => {
    if (isReady) {
      initializeMixer()
    }
  },
)

// Watch for changes in channel states
watch(channelStates, updateAllChannels, { deep: true })

// Watch master volume
watch(masterVolume, updateAllChannels)

onMounted(() => {
  if (props.isAudioInitialized) {
    initializeMixer()
  }
})

onUnmounted(() => {
  // Clean up audio nodes
  channelNodes.forEach((channel) => {
    channel.input.dispose()
    channel.gain.dispose()
  })
  masterGain.dispose()
  output.dispose()
})

// Expose inputs and output for external connections
defineExpose({
  channelA: channelNodes[0].input,
  channelB: channelNodes[1].input,
  channelC: channelNodes[2].input,
  output,
})
</script>

<template>
  <div class="module main-mixer">
    <div class="module-header">
      <h3>Mixer</h3>
    </div>
    <div class="module-content">
      <div class="control-section">
        <div class="mixer-channels">
          <div
            v-for="(state, index) in channelStates"
            :key="`channel-${index}`"
            class="mixer-channel"
          >
            <div class="channel-label">{{ channelNodes[index].label }}</div>
            <ControlKnob
              v-model="state.volume"
              :min="0"
              :max="100"
              :step="1"
              label="vol"
              size="small"
            />
            <div class="button-group">
              <ToggleButton
                v-model="state.mute"
                label="M"
                size="small"
                :active-color="'var(--color-danger)'"
              />
              <ToggleButton
                v-model="state.solo"
                label="S"
                size="small"
                :active-color="'var(--color-warn)'"
              />
            </div>
          </div>
          <!-- <div class="mixer-channel master-channel">
            <div class="channel-label">Master</div>
            <ControlKnob
              v-model="masterVolume"
              :min="0"
              :max="100"
              :step="1"
              label="vol"
              size="small"
            />
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-mixer {
  display: flex;
  flex-direction: column;
  padding: var(--space-sm);
  width: 100%;
  height: 100%;
  justify-content: space-between;
}

.module-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-section {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mixer-channels {
  display: flex;
  justify-content: space-evenly;
  width: 100%;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.mixer-channel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.channel-label {
  font-weight: bold;
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
}

.button-group {
  display: flex;
  gap: var(--space-xs);
}
</style>
