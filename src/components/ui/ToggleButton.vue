<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
  label?: string
  size?: 'small' | 'medium' | 'large'
  activeColor?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const toggleSwitch = () => {
  emit('update:modelValue', !props.modelValue)
}

const buttonSize = computed(() => {
  switch (props.size) {
    case 'small':
      return {
        width: 'auto',
        minWidth: 'calc(var(--knob-base-size) * 0.7)',
        height: 'calc(var(--knob-base-size) * 0.7)',
        fontSize: 'var(--font-size-xs)',
      }
    case 'large':
      return {
        width: 'auto',
        minWidth: 'calc(var(--knob-base-size) * 1.2)',
        height: 'calc(var(--knob-base-size) * 1.2)',
        fontSize: 'var(--font-size-base)',
      }
    default:
      return {
        width: 'auto',
        minWidth: 'var(--knob-base-size)',
        height: 'var(--knob-base-size)',
        fontSize: 'var(--font-size-sm)',
      }
  }
})

const activeColorStyle = computed(() => {
  return props.activeColor || 'var(--color-primary)'
})
</script>

<template>
  <div class="toggle-button-container">
    <button
      class="toggle-button"
      :class="{ active: modelValue }"
      @click="toggleSwitch"
      :style="{
        width: buttonSize.width,
        minWidth: buttonSize.minWidth,
        height: buttonSize.height,
        fontSize: buttonSize.fontSize,
        '--active-color': activeColorStyle,
      }"
    >
      {{ label }}
    </button>
    <div class="led-indicator" :class="{ active: modelValue }"></div>
  </div>
</template>

<style scoped>
.toggle-button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

.toggle-button {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-inset);
  cursor: pointer;
  transition: all 0.1s ease;
  font-family: var(--font-sans);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: var(--space-xs) var(--space-sm);
  user-select: none;
  white-space: nowrap;
}

.toggle-button:active {
  transform: scale(0.95);
}

.toggle-button.active {
  background-color: var(--color-primary);
  box-shadow: var(--shadow-glow), var(--shadow-inset);
  border-color: var(--active-color);
  font-weight: 600;
  color: var(--color-bg-darkest);
  text-shadow: none;
}

.led-indicator {
  width: var(--led-size);
  height: var(--led-size);
  border-radius: var(--radius-full);
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-dark);
  box-shadow: var(--shadow-inset);
  transition: all 0.1s ease;
}

.led-indicator.active {
  background-color: var(--active-color, var(--color-primary));
  box-shadow: 0 0 8px var(--active-color, var(--color-primary-glow));
}
</style>
