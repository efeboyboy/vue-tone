<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
  label?: string
  size?: 'small' | 'medium' | 'large'
  default?: number
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  label: '',
  size: 'medium',
  default: 50, // Default value if not specified
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const knobRef = ref<HTMLDivElement | null>(null)
const isDragging = ref(false)
const startY = ref(0)
const startValue = ref(0)

// Calculate the angle based on the current value
const rotation = computed(() => {
  const range = props.max - props.min
  const percentage = (props.modelValue - props.min) / range
  return percentage * 300 - 150 // -150 to +150 degrees rotation
})

const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  startY.value = e.clientY
  startValue.value = props.modelValue
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return

  const deltaY = startY.value - e.clientY
  const range = props.max - props.min
  // Adjust sensitivity when shift is pressed
  const sensitivity = e.shiftKey ? 400 : 200
  const valueChange = (deltaY / sensitivity) * range

  let newValue = startValue.value + valueChange
  newValue = Math.round(newValue / props.step) * props.step
  newValue = Math.max(props.min, Math.min(props.max, newValue))

  emit('update:modelValue', newValue)
}

const handleMouseUp = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

const handleDoubleClick = () => {
  emit('update:modelValue', props.default)
}
</script>

<template>
  <div class="control-knob-container" :class="size">
    <!-- Background -->
    <div class="knob-background"></div>

    <!-- Actual knob -->
    <div
      ref="knobRef"
      class="control-knob"
      @mousedown="handleMouseDown"
      @dblclick="handleDoubleClick"
      :style="{ transform: `rotate(${rotation}deg)` }"
    >
      <div class="indicator-line"></div>
    </div>

    <!-- Label -->
    <div class="label-container" v-if="label">
      <span class="knob-label">{{ label }}</span>
    </div>
  </div>
</template>

<style scoped>
.control-knob-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xxs);
  user-select: none;
  position: relative;
  width: var(--knob-size, clamp(40px, 5vw, 65px));
  height: calc(var(--knob-size, clamp(40px, 5vw, 65px)) * 1.2);
  contain: layout paint style;
}

.control-knob-container.small {
  --knob-size: clamp(28px, 3.5vw, 44px);
}

.control-knob-container.medium {
  --knob-size: clamp(40px, 5vw, 60px);
}

.control-knob-container.large {
  --knob-size: clamp(54px, 7vw, 76px);
}

.knob-background {
  position: absolute;
  width: var(--knob-size);
  height: var(--knob-size);
  border-radius: 50%;
  background: var(--color-bg-darker);
  box-shadow: var(--shadow-inset);
  border: 1px solid var(--color-border-dark);
  contain: paint style;
}

.control-knob {
  position: absolute;
  width: calc(var(--knob-size) * 0.85);
  height: calc(var(--knob-size) * 0.85);
  top: calc(var(--knob-size) * 0.075);
  left: calc(var(--knob-size) * 0.075);
  border-radius: 50%;
  background: var(--color-bg-dark);
  cursor: pointer;
  display: flex;
  justify-content: center;
  box-shadow: var(--shadow-inset);
  transition: transform 0.1s ease;
  contain: layout paint;
}

/* Add a pseudo-element for the static shadow */
.control-knob::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  box-shadow:
    inset 0 2px 4px rgba(255, 255, 255, 0.1),
    0 2px 4px rgba(0, 0, 0, 0.2);
  /* Prevent the shadow from rotating */
  transform: rotate(0deg);
}

.indicator-line {
  position: absolute;
  width: clamp(2px, 0.5vw, 3px);
  height: clamp(6px, 15%, 8px);
  background: var(--color-primary);
  border-radius: 1px;
  top: 10%;
  box-shadow: 0 0 4px var(--color-primary-glow);
  z-index: 1;
}

.label-container {
  position: absolute;
  bottom: 0;
  text-align: center;
  width: 100%;
  height: calc(var(--knob-size) * 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.knob-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  font-family: var(--font-sans);
  letter-spacing: 0.05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  padding: 0 var(--space-xxs);
}

@media (max-width: 768px) {
  .control-knob-container {
    gap: var(--space-xxs);
  }

  .knob-label {
    font-size: clamp(0.55rem, 1.2vw, 0.65rem);
  }
}
</style>
