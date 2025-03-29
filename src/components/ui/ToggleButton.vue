<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
  label: string
  size?: 'small' | 'medium' | 'large'
  activeColor?: string
}>()

const emit = defineEmits(['update:modelValue'])

const buttonClass = computed(() => {
  return {
    'toggle-button': true,
    'toggle-button--active': props.modelValue,
    [`toggle-button--${props.size || 'medium'}`]: true,
  }
})

const buttonStyle = computed(() => {
  if (props.modelValue && props.activeColor) {
    return {
      backgroundColor: props.activeColor,
      borderColor: props.activeColor,
    }
  }
  return {}
})

const indicatorColor = computed(() => {
  if (props.modelValue) {
    return props.activeColor || 'var(--color-primary)'
  }
  return 'transparent'
})

const indicatorStyle = computed(() => {
  if (props.modelValue) {
    return {
      '--led-color': indicatorColor.value,
    }
  }
  return {
    '--led-color': 'transparent',
  }
})

const handleClick = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <div class="toggle-button-container">
    <div class="led-container">
      <div class="led" :class="{ 'led--active': modelValue }" :style="indicatorStyle"></div>
    </div>
    <button :class="buttonClass" :style="buttonStyle" @click="handleClick">
      {{ label }}
    </button>
  </div>
</template>

<style scoped>
.toggle-button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.led-container {
  height: 12px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.led {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-background-dark);
  border: 1px solid var(--color-border);
  position: relative;
  transition: all 0.2s ease;
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.2);
}

.led::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.led--active {
  background-color: var(--led-color);
  box-shadow:
    0 0 2px var(--led-color),
    0 0 4px var(--led-color),
    0 0 6px var(--led-color),
    inset 0 0 2px rgba(255, 255, 255, 0.6);
}

.led--active::before {
  opacity: 1;
}

.toggle-button {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--color-background);
  color: var(--color-text);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
  user-select: none;
}

.toggle-button:hover {
  background-color: var(--color-border);
}

.toggle-button--active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-light);
}

.toggle-button--small {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  min-width: 40px;
}

.toggle-button--medium {
  font-size: 0.875rem;
  padding: 0.375rem 0.75rem;
  min-width: 60px;
}

.toggle-button--large {
  font-size: 1rem;
  padding: 0.5rem 1rem;
  min-width: 80px;
}
</style>
