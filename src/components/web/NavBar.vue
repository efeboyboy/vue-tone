<template>
  <nav class="navbar">
    <div class="logo-container">
      <h1>Vue Tone</h1>
    </div>
    <div class="menu-container">
      <router-link to="/new-patch" class="nav-link">Bongos</router-link>
      <router-link to="/about" class="nav-link">About</router-link>
      <router-link to="/help" class="nav-link">Help & Learn</router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
// Component logic can be added here if needed
</script>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: var(--surface-color);
  border-bottom: 1px solid var(--border-color);
}

.logo-container h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--text-primary);
}

.menu-container {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: var(--text-primary);
  text-decoration: none;
  font-size: 1rem;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: var(--accent-color);
}

.nav-link.router-link-active {
  color: var(--accent-color);
  font-weight: 500;
}
</style>
