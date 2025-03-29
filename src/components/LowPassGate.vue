<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as Tone from 'tone'
import { useToneContext } from '../composables/useToneContext'
import ControlKnob from './ui/ControlKnob.vue'
import ThreeWaySwitch from './ui/ThreeWaySwitch.vue'

const props = defineProps<{
  isAudioReady: boolean
  label: string
}>()

const { getContext } = useToneContext()

let filter: Tone.Filter
let vca: Tone.Gain

const mode = ref<'COMBO' | 'VCF' | 'VCA'>('COMBO')
const amount = ref(0)

// Create input and output nodes for external connections
const input = new Tone.Gain()
const output = new Tone.Gain()
const amountNode = new Tone.Gain()

// Initialize with amount as base level
amountNode.gain.value = 0

const initializeLPG = () => {
  const context = getContext()

  // Create filter and VCA
  filter = new Tone.Filter({
    context,
    frequency: 20000,
    type: 'lowpass',
    rolloff: -24,
  })

  vca = new Tone.Gain({
    context,
    gain: amount.value, // Initialize with amount value
  })

  // Create a gain node for filter frequency modulation
  const filterAmountNode = new Tone.Gain()
  amountNode.connect(filterAmountNode)

  // Scale and offset the filter frequency modulation
  filterAmountNode.gain.value = 19980 // maxFreq - minFreq
  filter.frequency.value = 20 // Set minimum frequency as base value
  filterAmountNode.connect(filter.frequency)

  // Create a base gain for manual amount control
  const baseGain = new Tone.Signal(amount.value)

  // Use Tone.Add to sum the base amount and CV
  const summedSignal = new Tone.Add()
  baseGain.connect(summedSignal)
  amountNode.connect(summedSignal)

  // Connect the summed signal to VCA gain
  summedSignal.connect(vca.gain)

  // Initial routing based on mode
  updateRouting()

  // Update base amount when amount changes
  watch(amount, (newAmount) => {
    const normalizedAmount = Math.pow(newAmount, 0.5)
    baseGain.value = normalizedAmount
  })
}

const updateRouting = () => {
  if (!filter || !vca) return

  // Disconnect everything
  input.disconnect()
  filter.disconnect()
  vca.disconnect()

  // Set up new routing based on mode
  switch (mode.value) {
    case 'COMBO':
      input.connect(filter)
      filter.connect(vca)
      vca.connect(output)
      break
    case 'VCF':
      input.connect(filter)
      filter.connect(output)
      break
    case 'VCA':
      input.connect(vca)
      vca.connect(output)
      break
  }
}

const updateAmount = () => {
  if (!filter || !vca) return

  // Update filter frequency with adjusted exponential scaling
  const minFreq = 20 // Lower minimum frequency
  const maxFreq = 20000
  const freqRange = Math.log(maxFreq / minFreq)
  const normalizedAmount = Math.pow(amount.value, 0.5)
  const frequency = amount.value === 0 ? minFreq : minFreq * Math.exp(freqRange * normalizedAmount)
  filter.frequency.rampTo(frequency, 0.1)
}

// Watch for audio initialization
watch(
  () => props.isAudioReady,
  (isReady) => {
    if (isReady) {
      initializeLPG()
    }
  },
)

// Watch for mode and amount changes
watch(mode, updateRouting)
watch(amount, updateAmount)

onMounted(() => {
  if (props.isAudioReady) {
    initializeLPG()
  }
})

onUnmounted(() => {
  if (filter) filter.dispose()
  if (vca) vca.dispose()
  input.dispose()
  output.dispose()
  amountNode.dispose()
})

// Expose input and output nodes for external connections
defineExpose({
  input,
  output,
  amount: amountNode,
})
</script>

<template>
  <div class="module">
    <h3>{{ label }}</h3>
    <div class="controls">
      <div class="control-group">
        <ThreeWaySwitch
          v-model="mode"
          :options="{
            left: 'VCF',
            middle: 'COMBO',
            right: 'VCA',
          }"
          :middle-indicator="true"
          :show-led="true"
          label="Mode"
        />
      </div>
      <div class="control-group">
        <label>Amount</label>
        <ControlKnob v-model="amount" :min="0" :max="1" :step="0.01" label="amount" />
        <span>{{ Math.round(amount * 100) }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.module {
  display: flex;
  flex-direction: column;
  padding: 2rem;
  border-radius: 8px;
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
</style>
