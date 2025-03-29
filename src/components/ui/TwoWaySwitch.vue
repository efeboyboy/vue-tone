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
  gap: var(--spacing-xs);
  position: relative;
  width: var(--switch-width, 100px);
}

.switch-container.small {
  --switch-width: 80px;
  --switch-height: 32px;
  --label-font-size: var(--font-size-xs);
}

.switch-container.medium {
  --switch-width: 100px;
  --switch-height: 36px;
  --label-font-size: var(--font-size-sm);
}

.switch-container.large {
  --switch-width: 120px;
  --switch-height: 40px;
  --label-font-size: var(--font-size-md);
}

.led-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--led-inactive);
  margin-bottom: var(--spacing-xs);
  transition: all var(--transition-normal);
}

.led-indicator.active {
  background: var(--led-active);
  box-shadow: 0 0 8px var(--led-glow);
}

.switch-track {
  position: relative;
  width: 100%;
  height: var(--switch-height);
  background: var(--knob-background);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
}

.switch-track.no-led {
  margin-top: 0;
}

.switch-handle {
  position: absolute;
  width: 50%;
  height: 100%;
  background: var(--knob-indicator);
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
  color: var(--knob-label);
  opacity: 0.5;
  font-size: var(--label-font-size);
  font-family: var(--font-family);
  text-transform: uppercase;
  pointer-events: none;
  transition: all var(--transition-normal);
  font-weight: 400;
}

.click-area.active .label {
  opacity: 1;
  font-weight: 600;
  text-shadow: 0 0 8px var(--led-glow);
}

.label-container {
  text-align: center;
}

.switch-label {
  font-size: var(--label-font-size);
  color: var(--knob-label);
  text-transform: lowercase;
  font-family: var(--font-family);
}
</style>
