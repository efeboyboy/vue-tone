<template>
  <nav class="navbar">
    <div class="logo-container">
      <img src="@/assets/bpp-logo-white.svg" alt="Logo" class="logo" />
    </div>
    <div class="menu-container">
      <router-link to="/" class="nav-link">Bongos</router-link>
      <router-link to="/about" class="nav-link">About</router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
// Component logic can be added here if needed
</script>

<style scoped>
.logo {
  width: 100px;
  height: 100px;
  padding: var(--space-xl);
  padding-left: 0;
  transition: filter 0.3s ease;
}

.logo:hover {
  filter: brightness(1.2);
}
</style>
