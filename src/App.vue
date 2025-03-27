<script setup lang="ts">
import * as Tone from 'tone'

// Create a context for our audio application
const audioContext = new Tone.Context({
  latencyHint: 'interactive',
  lookAhead: 0.01, // Reduced lookAhead for tighter timing
  updateInterval: 0.01, // More frequent updates
})

// Set Tone's global context
Tone.setContext(audioContext)

// Create an emitter for our application events
const ToneEmitter = new Tone.Emitter()

// Example of using the emitter with the context
const MasterClock = new Tone.Clock((time) => {
  // Get precise timing information
  const contextTime = audioContext.currentTime
  const transportTime = Tone.Transport.seconds

  // Emit the tick event with all timing info
  ToneEmitter.emit('tick', {
    clockTime: time,
    contextTime: contextTime,
    transportTime: transportTime,
  })
}, 1) // 1 second interval

// Add event listeners
ToneEmitter.on(
  'tick',
  (timing: { clockTime: number; contextTime: number; transportTime: number }) => {
    console.log('Timing Info:', {
      'Clock Time': timing.clockTime.toFixed(3),
      'Context Time': timing.contextTime.toFixed(3),
      'Transport Time': timing.transportTime.toFixed(3),
    })
  },
)

ToneEmitter.on('statechange', () => {
  console.log('Context state changed to:', audioContext.state)
})

// Start audio context and clock when needed
async function startAudio() {
  await audioContext.resume()
  console.log('Audio Context State:', audioContext.state)
  console.log('Transport State:', Tone.Transport.state)

  // Start both transport and clock
  Tone.Transport.start()
  MasterClock.start()
}

// Start audio on user interaction
startAudio()
</script>

<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
