<script setup lang="ts">
import * as Tone from 'tone'
import { ref } from 'vue'

const isPlaying = ref(false)
const oscillator = new Tone.Oscillator({
  type: 'sine',
  frequency: 440,
})

function toggleOscillator() {
  isPlaying.value = !isPlaying.value
  isPlaying.value ? oscillator.start() : oscillator.stop()
}
</script>

<template>
  <div>
    <h1>Dual Oscillator</h1>
    <button @click="toggleOscillator">{{ isPlaying ? 'Stop' : 'Start' }} Oscillator</button>
  </div>
</template>
