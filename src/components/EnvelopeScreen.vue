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
      // Attack phase - linear ramp up
      value = t / attackTime
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
  animationFrameId = requestAnimationFrame(drawEnvelope)
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
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

<style>
/* Using existing oscilloscope styles from theme.css */
</style>
