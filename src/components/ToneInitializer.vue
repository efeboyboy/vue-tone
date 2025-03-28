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
        <h2>Welcome to Vue Tone</h2>
        <p>To start making music, we need to initialize the audio system.</p>
        <p class="info">This is required by web browsers for a better audio experience.</p>
        <button @click="startAudio" class="start-button">Initialize Audio</button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.modal p {
  color: #34495e;
  margin-bottom: 1rem;
}

.modal .info {
  font-size: 0.9rem;
  color: #7f8c8d;
  font-style: italic;
}

.start-button {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.start-button:hover {
  background-color: #45a049;
  transform: translateY(-2px);
}

.start-button:active {
  transform: translateY(0);
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
