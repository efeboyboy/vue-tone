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

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--gradient-darker);
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-lg);
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal-title {
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
  font-size: 1.5rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.modal p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
  font-size: 0.875rem;
}

.modal .info {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-style: italic;
}

.start-button {
  padding: var(--space-sm) var(--space-md);
  font-size: 0.875rem;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: var(--space-md);
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: var(--shadow-inset);
}

.start-button:hover {
  background-color: var(--color-primary-dark);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
  color: var(--color-text-primary);
  text-shadow: 0 0 4px var(--color-primary-glow);
}

.start-button:active {
  transform: translateY(1px);
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
