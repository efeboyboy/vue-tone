<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import * as Tone from 'tone'
import { useToneContext } from '@/composables/useToneContext'

const props = defineProps<{
  isAudioReady: boolean
  label: string
}>()

const { getContext } = useToneContext()

let func: Tone.Envelope
let vca: Tone.Gain

const input = new Tone.Gain()
const output = new Tone.Gain()

const initializeFunctionGenerator = () => {
  const context = getContext()

  // Create envelope and VCA
  func = new Tone.Envelope({
    context,
    attack: 0.01,
    decay: 0.1,
    sustain: 0,
    release: 0,
  })

  vca = new Tone.Gain({
    context,
    gain: 1,
  })
}

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
  if (vca) vca.dispose()
  input.dispose()
  output.dispose()
})

defineExpose({
  input,
  output,
})
</script>

<template>
  <div class="function-generator">
    <h3>{{ props.label }}</h3>
  </div>
</template>
