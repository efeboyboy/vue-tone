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
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  middleIndicator: false,
  showLed: false,
  size: 'medium',
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
  <div class="switch-container" :class="size">
    <!-- LED Indicator -->
    <div
      v-if="showLed"
      class="led-indicator"
      :class="{ active: middleIndicator && isMiddleSelected }"
    ></div>

    <!-- Label -->
    <div v-if="label" class="label-container">
      <span class="switch-label">{{ label }}</span>
    </div>

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
  </div>
</template>

<style scoped>
.switch-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  width: var(--switch-width, clamp(120px, 14vw, 140px));
}

.switch-container.small {
  --switch-width: clamp(100px, 12vw, 120px);
  --switch-height: clamp(24px, 3vh, 32px);
}

.switch-container.medium {
  --switch-width: clamp(120px, 14vw, 140px);
  --switch-height: clamp(28px, 4vh, 36px);
}

.switch-container.large {
  --switch-width: clamp(140px, 18vw, 180px);
  --switch-height: clamp(32px, 5vh, 40px);
}

.led-indicator {
  width: var(--led-size, clamp(6px, 0.75vw, 8px));
  height: var(--led-size, clamp(6px, 0.75vw, 8px));
  border-radius: var(--radius-full);
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

.switch-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  font-family: var(--font-sans);
  letter-spacing: 0.05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.switch-track {
  position: relative;
  width: 100%;
  height: var(--switch-height);
  background: var(--color-bg-darker);
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-inset);
  overflow: hidden;
}

.switch-track.no-led {
  margin-top: 0;
}

.switch-handle {
  position: absolute;
  width: 33.33%;
  height: 100%;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border-dark);
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
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-family: var(--font-sans);
  text-transform: uppercase;
  pointer-events: none;
  transition: all 0.2s ease;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}

.click-area.active .label {
  color: var(--color-text-primary);
  font-weight: 600;
  text-shadow: 0 0 4px var(--color-primary-glow);
}

@media (max-width: 768px) {
  .click-area .label {
    font-size: clamp(0.55rem, 1.2vw, 0.65rem);
  }
}
</style>
