<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  label: '',
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

// Generate tick marks
const ticks = computed(() => {
  const numTicks = 13 // More ticks for finer control
  const tickArray = []
  for (let i = 0; i < numTicks; i++) {
    const value = props.min + ((props.max - props.min) / (numTicks - 1)) * i
    const angle = (i / (numTicks - 1)) * 300 - 150
    tickArray.push({
      value: Math.round(value),
      angle,
    })
  }
  return tickArray
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
  <div class="control-knob-container">
    <!-- Background with ticks -->
    <div class="knob-background">
      <div
        v-for="tick in ticks"
        :key="tick.value"
        class="tick"
        :style="{
          transform: `rotate(${tick.angle}deg)`,
        }"
      >
        <div class="tick-line"></div>
        <span
          class="tick-value"
          :style="{
            transform: `rotate(${-tick.angle}deg)`,
          }"
          >{{ tick.value }}</span
        >
      </div>
    </div>

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
  gap: 0.5rem;
  user-select: none;
  position: relative;
  width: 80px;
  height: 80px;
}

.knob-background {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--knob-background);
}

.tick {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
}

.tick-line {
  position: absolute;
  top: 0;
  width: 1px;
  height: 8px;
  background: var(--knob-indicator);
  transform-origin: bottom center;
}

.tick-value {
  position: absolute;
  color: var(--knob-label);
  font-size: 0.65rem;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  top: 12px;
  transform-origin: center;
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
  transition: transform 0.1s ease;
}

.indicator-line {
  width: 2px;
  height: 40%;
  background: var(--knob-indicator);
  margin-top: 4px;
  border-radius: 1px;
}

.label-container {
  position: absolute;
  bottom: -24px;
  text-align: center;
}

.knob-label {
  font-size: 0.75rem;
  color: var(--knob-label);
  text-transform: lowercase;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}
</style>
