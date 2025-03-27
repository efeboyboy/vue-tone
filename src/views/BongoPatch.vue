<script setup lang="ts">
import DualOscillator from '../components/DualOscillator.vue'
</script>

<template>
  <div class="bongo-patch">
    <h1>Bongo Patch</h1>
    <div class="oscillators">
      <DualOscillator />
    </div>
  </div>
</template>

<style scoped>
.bongo-patch {
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  color: #333;
}

.oscillators {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
}
</style>
