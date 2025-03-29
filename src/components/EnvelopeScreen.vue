<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  label?: string
  attackTime?: number
  decayTime?: number
  triggered?: boolean
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
let animationFrameId: number | null = null
let startTime: number | null = null
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

// Draw envelope visualization
const drawEnvelope = (timestamp: number) => {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  const width = canvas.value.width
  const height = canvas.value.height

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

  // Draw envelope shape
  ctx.beginPath()
  ctx.strokeStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-primary')
    .trim()
  ctx.lineWidth = 2

  const attackTime = props.attackTime || 0.1
  const decayTime = props.decayTime || 0.5
  const totalTime = attackTime + decayTime

  // Start point
  ctx.moveTo(0, height)

  if (props.triggered && startTime === null) {
    startTime = timestamp
  }

  if (!props.triggered) {
    startTime = null
  }

  const progress = startTime ? (timestamp - startTime) / 1000 : 0
  const normalizedProgress = Math.min(progress / totalTime, 1)

  // Calculate envelope points
  const points: [number, number][] = []
  const numPoints = 100

  for (let i = 0; i <= numPoints; i++) {
    const t = (i / numPoints) * totalTime
    let value = 0

    if (t <= attackTime) {
      // Attack phase - exponential rise
      const attackProgress = t / attackTime
      value = 1 - Math.exp(-attackProgress * 3)
    } else {
      // Decay phase - exponential decay
      const decayProgress = (t - attackTime) / decayTime
      value = Math.exp(-decayProgress * 3)
    }

    // Clip the value between 0 and 1
    value = Math.max(0, Math.min(1, value))

    const x = (t / totalTime) * width
    const y = height - value * height
    points.push([x, y])
  }

  // Draw the envelope path
  ctx.beginPath()
  ctx.moveTo(0, height)
  points.forEach(([x, y], i) => {
    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.lineTo(width, height)
  ctx.stroke()

  // Draw progress indicator when triggered
  if (props.triggered && startTime) {
    const x = normalizedProgress * width
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-primary-glow')
      .trim()
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  animationFrameId = requestAnimationFrame(drawEnvelope)
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
  animationFrameId = requestAnimationFrame(drawEnvelope)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  if (resizeObserver && canvas.value?.parentElement) {
    resizeObserver.unobserve(canvas.value.parentElement)
    resizeObserver.disconnect()
  }

  if (resizeTimeout) {
    window.cancelAnimationFrame(resizeTimeout)
  }
})

// Watch for changes in attack and decay times
watch([() => props.attackTime, () => props.decayTime], () => {
  if (canvas.value) {
    drawEnvelope(performance.now())
  }
})
</script>

<template>
  <div class="module envelope-screen-module">
    <div class="oscilloscope-content">
      <canvas ref="canvas" class="oscilloscope-canvas"></canvas>
    </div>
  </div>
</template>

<style scoped>
.envelope-screen-module {
  width: 100%;
  height: 100%;
  display: flex;
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
  display: flex;
}

.oscilloscope-canvas {
  width: 100% !important;
  height: 100% !important;
  background-color: var(--color-bg-darker);
  border-radius: var(--radius-sm);
  display: block;
  position: relative;
  z-index: 1;
  filter: blur(0.5px) brightness(1.2);
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

.envelope-module .screen-container {
  flex: 0.8;
  height: 100%;
}

.envelope-module .control-section {
  flex: 1;
}

.envelope-module .control-row {
  transform-origin: center center;
}
</style>
