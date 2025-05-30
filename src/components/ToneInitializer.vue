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
        <h2 class="modal-title">Bongos!</h2>
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

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-bg-darkest);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--gradient-darker);
  padding: var(--space-xl);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-lg);
  max-width: 400px;
  width: 90%;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.modal-title {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  font-family: var(--font-sans);
}

.modal p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

.modal .info {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

.start-button {
  padding: var(--space-md) var(--space-lg);
  font-size: var(--font-size-sm);
  background: var(--gradient-dark);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: var(--space-md);
  font-family: var(--font-sans);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: var(--shadow-inset);
}

.start-button:hover {
  background: var(--color-primary-dark);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
  color: var(--color-text-primary);
  text-shadow: 0 0 4px var(--color-primary-glow);
}

.start-button:active {
  transform: translateY(1px);
  box-shadow: var(--shadow-inset);
}
</style>
