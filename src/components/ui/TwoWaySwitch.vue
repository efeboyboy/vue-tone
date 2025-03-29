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
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  showLed: false,
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
  <div class="switch-container">
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
  gap: 0.5rem;
  width: 120px;
  position: relative;
}

.led-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--knob-background);
  margin-bottom: 4px;
  transition: background-color 0.2s ease;
}

.led-indicator.active {
  background: #ff5f56;
  box-shadow: 0 0 8px rgba(255, 95, 86, 0.5);
}

.switch-track {
  position: relative;
  width: 100%;
  height: 40px;
  background: var(--knob-background);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
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
  font-size: 0.75rem;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  text-transform: uppercase;
  pointer-events: none;
  transition: all 0.2s ease;
  font-weight: 400;
}

.click-area.active .label {
  color: var(--color-primary);
  opacity: 1;
  font-weight: 600;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
}

.label-container {
  text-align: center;
}

.switch-label {
  font-size: 0.75rem;
  color: var(--knob-label);
  text-transform: lowercase;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}
</style>
