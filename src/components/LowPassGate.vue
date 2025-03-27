<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as Tone from 'tone'
import { useToneContext } from '../composables/useToneContext'

const props = defineProps<{
  isAudioReady: boolean
  label: string
}>()

const { getContext } = useToneContext()

let filter: Tone.Filter
let vca: Tone.Gain

const mode = ref<'COMBO' | 'VCF' | 'VCA'>('COMBO')
const amount = ref(0.5)

// Create input and output nodes for external connections
const input = new Tone.Gain()
const output = new Tone.Gain()

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
    gain: 1,
  })

  // Initial routing based on mode
  updateRouting()
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

  const normalizedAmount = amount.value

  // Update filter frequency (exponential scaling for more natural response)
  const minFreq = 20
  const maxFreq = 20000
  const frequency = Math.exp(
    Math.log(minFreq) + normalizedAmount * (Math.log(maxFreq) - Math.log(minFreq)),
  )
  filter.frequency.rampTo(frequency, 0.1)

  // Update VCA gain
  vca.gain.rampTo(normalizedAmount, 0.1)
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
})

// Expose input and output nodes for external connections
defineExpose({
  input,
  output,
})
</script>

<template>
  <div class="lpg">
    <div class="module">
      <h3>{{ label }}</h3>
      <div class="controls">
        <div class="control-group">
          <label>Mode</label>
          <select v-model="mode">
            <option value="COMBO">COMBO (VCA + VCF)</option>
            <option value="VCF">VCF</option>
            <option value="VCA">VCA</option>
          </select>
        </div>
        <div class="control-group">
          <label>Amount</label>
          <input type="range" min="0" max="1" step="0.01" v-model.number="amount" />
          <span>{{ Math.round(amount * 100) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lpg {
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

.control-group select,
.control-group input[type='range'] {
  width: 100%;
}

.control-group select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.control-group span {
  color: #666;
  font-size: 0.9rem;
}
</style>
