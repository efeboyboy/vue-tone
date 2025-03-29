<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  options: {
    left: string
    middle: string
    right: string
  }
  label?: string
  middleIndicator?: boolean
  showLed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  middleIndicator: false,
  showLed: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const isMiddleSelected = computed(() => props.modelValue === props.options.middle)

const handleClick = (position: 'left' | 'middle' | 'right') => {
  emit('update:modelValue', props.options[position])
}
</script>

<template>
  <div class="switch-container">
    <!-- LED Indicator -->
    <div
      v-if="showLed"
      class="led-indicator"
      :class="{ active: middleIndicator && isMiddleSelected }"
    ></div>

    <!-- Switch Track -->
    <div class="switch-track" :class="{ 'no-led': !showLed }">
      <!-- Switch Handle -->
      <div
        class="switch-handle"
        :class="{
          'position-left': modelValue === options.left,
          'position-middle': modelValue === options.middle,
          'position-right': modelValue === options.right,
        }"
      ></div>

      <!-- Click Areas -->
      <div class="click-areas">
        <div
          class="click-area"
          :class="{ active: modelValue === options.left }"
          @click="handleClick('left')"
        >
          <span class="label">{{ options.left }}</span>
        </div>
        <div
          class="click-area"
          :class="{ active: modelValue === options.middle }"
          @click="handleClick('middle')"
        >
          <span class="label">{{ options.middle }}</span>
        </div>
        <div
          class="click-area"
          :class="{ active: modelValue === options.right }"
          @click="handleClick('right')"
        >
          <span class="label">{{ options.right }}</span>
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
  width: 180px;
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
  width: 33.33%;
  height: 100%;
  background: var(--knob-indicator);
  transition: transform 0.2s ease;
  z-index: 1;
}

.switch-handle.position-left {
  transform: translateX(0%);
}

.switch-handle.position-middle {
  transform: translateX(100%);
}

.switch-handle.position-right {
  transform: translateX(200%);
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
