<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
  label?: string
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  label: '',
  size: 'medium',
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
  const valueChange = (deltaY / 200) * range // 200px movement = full range

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
      :style="{ transform: `rotate(${rotation}deg)` }"
    >
      <div class="indicator-line"></div>
    </div>

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
  gap: var(--spacing-xs);
  user-select: none;
  position: relative;
  width: var(--knob-size, 65px);
  height: var(--knob-size, 65px);
}

.control-knob-container.small {
  --knob-size: 50px;
  --label-font-size: var(--font-size-xs);
}

.control-knob-container.medium {
  --knob-size: 65px;
  --label-font-size: var(--font-size-sm);
}

.control-knob-container.large {
  --knob-size: 80px;
  --label-font-size: var(--font-size-md);
}

.knob-background {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--knob-background);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.2);
}

.control-knob {
  position: absolute;
  width: 85%;
  height: 85%;
  top: 7.5%;
  left: 7.5%;
  border-radius: 50%;
  background: var(--knob-background);
  cursor: pointer;
  display: flex;
  justify-content: center;
  transition: transform var(--transition-fast);
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
  width: 2px;
  height: 40%;
  background: var(--knob-indicator);
  margin-top: 4px;
  border-radius: 1px;
  position: relative;
  z-index: 1;
}

.label-container {
  position: absolute;
  bottom: -24px;
  text-align: center;
}

.knob-label {
  font-size: var(--label-font-size);
  color: var(--knob-label);
  text-transform: lowercase;
  font-family: var(--font-family);
}
</style>
