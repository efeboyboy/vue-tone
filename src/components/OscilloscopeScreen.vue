<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as Tone from 'tone'

defineProps<{
  label?: string
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const analyzer = new Tone.Analyser('waveform', 1024)
const input = new Tone.Gain()
let resizeObserver: ResizeObserver | null = null
let resizeTimeout: number | null = null

// Debounced resize handler
const handleResize = (entries: ResizeObserverEntry[]) => {
  if (resizeTimeout) {
    window.cancelAnimationFrame(resizeTimeout)
  }

  resizeTimeout = window.requestAnimationFrame(() => {
    if (!canvas.value) return

    for (const entry of entries) {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) {
        canvas.value.width = width
        canvas.value.height = height
      }
    }
  })
}

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
    // Initial size setup
    const containerWidth = canvas.value.parentElement?.clientWidth || 300
    const containerHeight = canvas.value.parentElement?.clientHeight || 150
    canvas.value.width = containerWidth
    canvas.value.height = containerHeight

    // Make canvas responsive with debounced resize observer
    resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(canvas.value.parentElement as Element)
  }
  drawWaveform()
})

onUnmounted(() => {
  if (resizeObserver && canvas.value?.parentElement) {
    resizeObserver.unobserve(canvas.value.parentElement)
    resizeObserver.disconnect()
  }
  if (resizeTimeout) {
    window.cancelAnimationFrame(resizeTimeout)
  }
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

<style scoped>
.oscilloscope-module {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.oscilloscope-content {
  width: 100%;
  height: 100%;
  flex: 1;
  padding: var(--space-sm);
  background-color: var(--color-bg-darker);
  border: 1px solid var(--color-border-dark);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-inset);
  overflow: hidden;
  position: relative;
}

.oscilloscope-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(0.5px);
  pointer-events: none;
  z-index: 2;
}

.oscilloscope-content::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at center,
    transparent 30%,
    rgba(0, 0, 0, 0.2) 70%,
    rgba(0, 0, 0, 0.4) 100%
  );
  filter: blur(2px);
  pointer-events: none;
  z-index: 3;
}

.oscilloscope-canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
  position: relative;
  z-index: 1;
  filter: blur(0.5px) brightness(1.2);
}
</style>
