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
    window.dispatchEvent(new Event('audioInitialized'))
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="!isStarted" class="modal-overlay">
      <div class="modal">
        <h2 class="modal-title">Welcome to Vue Tone</h2>
        <p>To start making music, we need to initialize the audio system.</p>
        <p class="info">This is required by web browsers for a better audio experience.</p>
        <button @click="startAudio" class="start-button">Initialize Audio</button>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import type * as Tone from 'tone'

declare global {
  interface Window {
    toneContext: Tone.Context
  }
}
</script>
