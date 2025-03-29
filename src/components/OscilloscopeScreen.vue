<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as Tone from 'tone'

defineProps<{
  label?: string
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const analyzer = new Tone.Analyser('waveform', 1024)
const input = new Tone.Gain()

// Connect input to analyzer
input.connect(analyzer)

// Waveform visualization
const drawWaveform = () => {
  if (!canvas.value || !analyzer) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  const width = canvas.value.width
  const height = canvas.value.height
  const wave = analyzer.getValue() as Float32Array

  ctx.clearRect(0, 0, width, height)
  ctx.beginPath()
  ctx.strokeStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--secondary-color')
    .trim()
  ctx.lineWidth = 2

  wave.forEach((value, i) => {
    const x = (i / wave.length) * width
    const y = (((value as number) + 1) / 2) * height
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()

  requestAnimationFrame(drawWaveform)
}

onMounted(() => {
  drawWaveform()
})

onUnmounted(() => {
  analyzer.dispose()
  input.dispose()
})

// Expose input for external connections
defineExpose({
  input,
})
</script>

<template>
  <div class="oscilloscope">
    <h3 v-if="label">{{ label }}</h3>
    <canvas ref="canvas" width="300" height="100" class="waveform"></canvas>
  </div>
</template>

<style scoped>
.oscilloscope {
  padding: var(--module-padding);
  background: var(--panel-background);
  border-radius: var(--module-border-radius);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

h3 {
  color: var(--secondary-color);
  margin: 0;
  text-align: center;
  font-family: var(--font-family);
  font-weight: 400;
  font-size: var(--font-size-xl);
}

.waveform {
  width: 100%;
  height: 100px;
  background: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
}
</style>
