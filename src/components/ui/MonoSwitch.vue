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

<style scoped></style>
