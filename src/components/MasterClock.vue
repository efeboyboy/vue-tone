<script setup lang="ts">
import * as Tone from 'tone'
import { ref, computed } from 'vue'

const transport = Tone.getTransport()
const isPlaying = ref(false)

// Create an emitter for our application events
const ToneEmitter = new Tone.Emitter()

// Format time as MM:SS.ms
const formattedTime = computed(() => {
  const seconds = transport.seconds
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  const milliseconds = Math.floor((seconds % 1) * 1000)
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`
})

const MasterClock = new Tone.Clock((time) => {
  // Get precise timing information
  const contextTime = Tone.getContext().currentTime
  const transportTime = transport.seconds

  // Emit the tick event with all timing info
  ToneEmitter.emit('tick', {
    clockTime: time,
    contextTime: contextTime,
    transportTime: transportTime,
  })
}, 1)

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

// Transport controls
async function playTransport() {
  try {
    await Tone.start() // Ensure audio context is started
    transport.start()
    MasterClock.start()
    isPlaying.value = true
    console.log('Transport started:', transport.state)
  } catch (error) {
    console.error('Error starting transport:', error)
  }
}

function stopTransport() {
  try {
    transport.pause() // Using pause instead of stop to maintain position
    MasterClock.pause()
    isPlaying.value = false
    console.log('Transport paused:', transport.state)
  } catch (error) {
    console.error('Error stopping transport:', error)
  }
}

function resetTransport() {
  try {
    transport.stop() // Full stop
    MasterClock.stop()
    transport.position = 0
    isPlaying.value = false
    console.log('Transport reset:', transport.state, 'Position:', transport.position)
  } catch (error) {
    console.error('Error resetting transport:', error)
  }
}
</script>

<template>
  <div class="master-clock">
    <div class="transport-controls">
      <button @click="playTransport" :class="{ active: isPlaying }">
        {{ isPlaying ? 'Playing' : 'Play' }}
      </button>
      <button @click="stopTransport" :disabled="!isPlaying">Stop</button>
      <button @click="resetTransport">Reset</button>
    </div>
    <div class="transport-info">
      <div class="time-display">{{ formattedTime }}</div>
      <div class="transport-state">State: {{ transport.state }}</div>
    </div>
  </div>
</template>

<style scoped>
.master-clock {
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.transport-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.transport-info {
  font-family: monospace;
  margin-top: 0.5rem;
  padding: 1rem;
  background: #fff;
  border-radius: 4px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.time-display {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2196f3;
  margin-bottom: 0.5rem;
}

.transport-state {
  font-size: 0.9rem;
  color: #666;
  text-transform: capitalize;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #4caf50;
  color: white;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

button:hover:not(:disabled) {
  background: #45a049;
}

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

button.active {
  background: #2196f3;
}

button.active:hover {
  background: #1976d2;
}
</style>
