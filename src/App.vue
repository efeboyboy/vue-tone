<script setup lang="ts">
import * as Tone from 'tone'
import MasterClock from './components/MasterClock.vue'

// Create a context for our audio application
const audioContext = new Tone.Context({
  latencyHint: 'interactive',
  lookAhead: 0.01, // Reduced lookAhead for tighter timing
  updateInterval: 0.01, // More frequent updates
})

// Set Tone's global context
Tone.setContext(audioContext)

// Start audio context when needed
async function startAudio() {
  await audioContext.resume()
  console.log('Audio Context State:', audioContext.state)
}

// Start audio on user interaction
startAudio()
</script>

<template>
  <div id="app">
    <MasterClock />
    <router-view></router-view>
  </div>
</template>

<style>
#app {
  font-family: Arial, sans-serif;
}
</style>
