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
  gap: var(--space-xxs);
  cursor: pointer;
  user-select: none;
  position: relative;
  width: 100%;
}

.mono-switch-container.small {
  --switch-width: clamp(28px, 3.5vw, 36px);
  --switch-height: clamp(16px, 2.2vw, 22px);
}

.mono-switch-container.medium {
  --switch-width: clamp(36px, 4.5vw, 48px);
  --switch-height: clamp(20px, 2.5vw, 26px);
}

.mono-switch-container.large {
  --switch-width: clamp(44px, 5.5vw, 56px);
  --switch-height: clamp(24px, 3vw, 32px);
}

.switch-body {
  position: relative;
  width: var(--switch-width);
  height: var(--switch-height);
  border-radius: var(--radius-sm);
  background: var(--color-bg-darker);
  box-shadow: var(--shadow-inset);
  border: 1px solid var(--color-border-dark);
  transition: all 0.2s ease;
  overflow: hidden;
}

.switch-indicator {
  position: absolute;
  width: calc(50% - 2px);
  height: calc(100% - 4px);
  top: 2px;
  left: 2px;
  border-radius: calc(var(--radius-sm) - 2px);
  background: var(--color-bg-dark);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
}

.active .switch-indicator {
  left: calc(50% + 0px);
  background: var(--color-primary);
  box-shadow: 0 0 4px var(--color-primary-glow);
}

.label-container {
  text-align: center;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.switch-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  font-family: var(--font-sans);
  letter-spacing: 0.05em;
}

.active .switch-label {
  color: var(--color-text-primary);
}
</style>
