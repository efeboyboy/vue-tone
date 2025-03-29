<script setup lang="ts">
interface Props {
  modelValue: boolean
  label?: string
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  size: 'medium',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <div class="mono-switch-container" :class="[size, { active: modelValue }]" @click="toggle">
    <div class="switch-body">
      <div class="switch-indicator"></div>
    </div>
    <div class="label-container" v-if="label">
      <span class="switch-label">{{ label }}</span>
    </div>
  </div>
</template>

<style scoped>
.mono-switch-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  user-select: none;
  cursor: pointer;
}

.switch-body {
  width: var(--switch-width, 40px);
  height: var(--switch-height, 20px);
  background: var(--knob-background);
  border-radius: var(--border-radius-sm);
  position: relative;
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.1);
  transition: background-color var(--transition-normal);
}

.switch-indicator {
  position: absolute;
  width: 40%;
  height: 80%;
  background: var(--knob-indicator);
  border-radius: calc(var(--border-radius-sm) - 2px);
  top: 10%;
  left: 5%;
  transition: transform var(--transition-normal);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.active .switch-indicator {
  transform: translateX(140%);
}

.active .switch-body {
  background: var(--led-active);
}

/* Sizes */
.mono-switch-container.small {
  --switch-width: 32px;
  --switch-height: 16px;
  --label-font-size: var(--font-size-xs);
}

.mono-switch-container.medium {
  --switch-width: 40px;
  --switch-height: 20px;
  --label-font-size: var(--font-size-sm);
}

.mono-switch-container.large {
  --switch-width: 48px;
  --switch-height: 24px;
  --label-font-size: var(--font-size-md);
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
