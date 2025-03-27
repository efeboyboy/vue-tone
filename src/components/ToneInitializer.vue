<script setup lang="ts">
import { ref } from 'vue'
import { useToneContext } from '../composables/useToneContext'

const isStarted = ref(false)
const { startAudioContext } = useToneContext()

const startAudio = async () => {
  const success = await startAudioContext()
  if (success) {
    isStarted.value = true
    console.log('Audio context started')
  }
}
</script>

<template>
  <div class="tone-initializer">
    <button v-if="!isStarted" @click="startAudio" class="start-button">Start Audio</button>
  </div>
</template>

<style scoped>
.tone-initializer {
  padding: 1rem;
  text-align: center;
}

.start-button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.start-button:hover {
  background-color: #45a049;
}
</style>

<script lang="ts">
import type * as Tone from 'tone'

declare global {
  interface Window {
    toneContext: Tone.Context
  }
}
</script>
