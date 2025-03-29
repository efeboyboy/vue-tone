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

  // Clear with dark background
  ctx.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-bg-darker')
    .trim()
  ctx.fillRect(0, 0, width, height)

  // Draw grid
  ctx.strokeStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-border-dark')
    .trim()
  ctx.lineWidth = 1

  // Vertical grid lines
  const gridSize = 40
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // Horizontal grid lines
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // Draw waveform
  ctx.beginPath()
  ctx.strokeStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-primary')
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
  if (canvas.value) {
    // Make canvas responsive
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        canvas.value!.width = width
        canvas.value!.height = height
      }
    })
    resizeObserver.observe(canvas.value)
  }
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
  <div class="module oscilloscope-module">
    <div class="oscilloscope-content">
      <canvas ref="canvas" class="oscilloscope-canvas"></canvas>
    </div>
  </div>
</template>

<style>
/* Component specific styles only */
</style>
