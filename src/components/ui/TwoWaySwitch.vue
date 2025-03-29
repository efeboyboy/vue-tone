<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: number // 0 or 1
  options?: {
    off: string
    on: string
  }
  label?: string
  showLed?: boolean
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  showLed: false,
  size: 'medium',
  options: () => ({
    off: 'Off',
    on: 'On',
  }),
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const isOn = computed(() => props.modelValue === 1)

const handleClick = (position: 'off' | 'on') => {
  emit('update:modelValue', position === 'on' ? 1 : 0)
}
</script>

<template>
  <div class="switch-container" :class="size">
    <!-- LED Indicator -->
    <div v-if="showLed" class="led-indicator" :class="{ active: isOn }"></div>

    <!-- Switch Track -->
    <div class="switch-track" :class="{ 'no-led': !showLed }">
      <!-- Switch Handle -->
      <div class="switch-handle" :class="{ 'position-on': isOn }"></div>

      <!-- Click Areas -->
      <div class="click-areas">
        <div class="click-area" :class="{ active: !isOn }" @click="handleClick('off')">
          <span class="label">{{ options.off }}</span>
        </div>
        <div class="click-area" :class="{ active: isOn }" @click="handleClick('on')">
          <span class="label">{{ options.on }}</span>
        </div>
      </div>
    </div>

    <!-- Label -->
    <div v-if="label" class="label-container">
      <span class="switch-label">{{ label }}</span>
    </div>
  </div>
</template>

<style scoped>
.switch-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  position: relative;
  width: var(--switch-width, clamp(80px, 10vw, 100px));
}

.switch-container.small {
  --switch-width: clamp(60px, 8vw, 80px);
  --switch-height: clamp(24px, 3vh, 32px);
}

.switch-container.medium {
  --switch-width: clamp(80px, 10vw, 100px);
  --switch-height: clamp(28px, 4vh, 36px);
}

.switch-container.large {
  --switch-width: clamp(100px, 12vw, 120px);
  --switch-height: clamp(32px, 5vh, 40px);
}

.led-indicator {
  width: var(--led-size, clamp(6px, 0.75vw, 8px));
  height: var(--led-size, clamp(6px, 0.75vw, 8px));
  border-radius: 50%;
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-dark);
  box-shadow: var(--shadow-inset);
  margin-bottom: var(--space-xxs);
  transition: all 0.2s ease;
}

.led-indicator.active {
  background-color: var(--color-primary);
  box-shadow: var(--shadow-glow);
}

.switch-track {
  position: relative;
  width: 100%;
  height: var(--switch-height);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-inset);
  overflow: hidden;
}

.switch-track.no-led {
  margin-top: 0;
}

.switch-handle {
  position: absolute;
  width: 50%;
  height: 100%;
  background: var(--color-bg-tertiary);
  transition: transform 0.2s ease;
  z-index: 1;
}

.switch-handle.position-on {
  transform: translateX(100%);
}

.click-areas {
  position: absolute;
  display: flex;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.click-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.click-area .label {
  color: var(--color-text-muted);
  opacity: 0.5;
  font-size: var(--font-size-xs);
  font-family: var(--font-sans);
  text-transform: uppercase;
  pointer-events: none;
  transition: all 0.2s ease;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.click-area.active .label {
  opacity: 1;
  font-weight: 600;
  color: var(--color-text-primary);
}

.label-container {
  text-align: center;
  width: 100%;
}

.switch-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-transform: uppercase;
  font-family: var(--font-sans);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
