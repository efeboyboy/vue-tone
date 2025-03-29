<template>
  <div class="about-container">
    <div class="about-card">
      <h1 class="about-title">Bongo Synth v0.1</h1>

      <div class="about-section">
        <h2>About this Synth</h2>
        <p>
          Bongo is a web-based FM synthesizer inspired by classic Braun design principles:
          simplicity, functionality, and elegance. Built with Vue.js and Tone.js, it provides a
          powerful yet accessible platform for sound design and musical exploration.
        </p>
      </div>

      <div class="about-section">
        <h2>Features</h2>
        <ul class="feature-list">
          <li>Multi-channel mixer with independent volume, mute, and solo controls</li>
          <li>FM-ready oscillators with customizable parameters</li>
          <li>Intuitive Braun-style interface with knobs, sliders, and switches</li>
          <li>Responsive design that works across devices</li>
        </ul>
      </div>

      <div class="about-section credits-section">
        <h2>Credits</h2>
        <p>
          Designed and developed with ♥ by the
          <a href="https://beatsperplant.com" target="_blank" rel="noopener">Beats Per Plant</a
          ><br />
          Powered by <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue.js</a> and
          <a href="https://tonejs.github.io/" target="_blank" rel="noopener">Tone.js</a>.
        </p>
        <div class="version-info">v0.1 - Initial Release</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-xl);
  min-height: 100%;
  background-color: var(--color-bg-darker);
}

.about-card {
  max-width: 800px;
  width: 100%;
  background: var(--gradient-dark);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-md);
  padding: var(--space-xl);
  color: var(--color-text-primary);
}

.about-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: var(--space-xl);
  text-align: center;
  letter-spacing: -0.02em;
}

.about-section {
  margin-bottom: var(--space-xl);
}

.about-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: var(--space-md);
  color: var(--color-text-primary);
}

.about-section p {
  font-size: var(--font-size-base);
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.feature-list {
  list-style-type: none;
  padding: 0;
}

.feature-list li {
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--color-border-dark);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.feature-list li:last-child {
  border-bottom: none;
}

.credits-section {
  text-align: center;
  margin-top: var(--space-xl);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-border-primary);
}

.version-info {
  margin-top: var(--space-lg);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

a:hover {
  color: var(--color-primary-dark);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .about-card {
    padding: var(--space-lg);
  }

  .about-title {
    font-size: 2rem;
  }
}
</style>
