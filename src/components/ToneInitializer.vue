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
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: var(--panel-background);
  padding: var(--module-padding);
  border-radius: var(--module-border-radius);
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 90%;
  text-align: center;
  color: var(--secondary-color);
  font-family: var(--font-family);
}

.modal h2 {
  color: var(--secondary-color);
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-xl);
  font-weight: 400;
}

.modal p {
  color: var(--secondary-color);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-md);
}

.modal .info {
  font-size: var(--font-size-sm);
  color: var(--knob-label);
  font-style: italic;
  opacity: 0.8;
}

.start-button {
  padding: var(--spacing-sm) var(--spacing-xl);
  font-size: var(--font-size-lg);
  background-color: var(--accent-color);
  color: var(--secondary-color);
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  margin-top: var(--spacing-lg);
  font-family: var(--font-family);
}

.start-button:hover {
  filter: brightness(1.1);
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
