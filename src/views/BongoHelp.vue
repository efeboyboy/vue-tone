<template>
  <div class="help-container">
    <div class="help-header">
      <h1>Bongo Interactive Guide</h1>
      <p class="subtitle">Learn how to create sounds with your Bongo synth</p>
    </div>

    <div class="help-content">
      <!-- Tutorial Navigation -->
      <div class="tutorial-nav">
        <button
          v-for="(section, index) in tutorialSections"
          :key="index"
          :class="['nav-button', { active: currentSection === index }]"
          @click="currentSection = index"
        >
          {{ section.title }}
        </button>
      </div>

      <!-- Tutorial Content -->
      <div class="tutorial-content">
        <div class="tutorial-section" v-if="currentSection !== null">
          <h2>{{ tutorialSections[currentSection].title }}</h2>

          <div
            class="tutorial-step"
            v-for="(step, stepIndex) in tutorialSections[currentSection].steps"
            :key="stepIndex"
          >
            <div class="step-number">{{ stepIndex + 1 }}</div>
            <div class="step-content">
              <h3>{{ step.title }}</h3>
              <p v-html="step.description"></p>

              <!-- Visualization area -->
              <div class="visualization-area" v-if="step.visualization">
                <div class="visualization-container">
                  <component
                    :is="step.visualization.component"
                    v-bind="step.visualization.props"
                    class="visualization"
                  />
                </div>
                <div class="visualization-controls" v-if="step.visualization.interactive">
                  <div
                    v-for="(control, controlIndex) in step.visualization.controls"
                    :key="controlIndex"
                    class="interactive-control"
                  >
                    <label v-if="control.label">{{ control.label }}</label>
                    <template v-if="control.type === 'knob'">
                      <component
                        :is="control.component"
                        v-model="control.value"
                        :min="control.min"
                        :max="control.max"
                        :step="control.step"
                        :label="control.label"
                        size="medium"
                      />
                    </template>
                    <template v-else-if="control.type === 'select'">
                      <select v-model="control.value">
                        <option v-for="option in control.options" :key="option" :value="option">
                          {{ option }}
                        </option>
                      </select>
                    </template>
                    <template v-else-if="control.type === 'button'">
                      <component
                        :is="control.component"
                        v-model="control.value"
                        :label="control.text"
                        size="medium"
                        @click="control.action"
                      />
                    </template>
                  </div>
                </div>
              </div>

              <!-- Tips -->
              <div class="tips-container" v-if="step.tips && step.tips.length">
                <h4>Adjustment Tips:</h4>
                <ul class="tips-list">
                  <li v-for="(tip, tipIndex) in step.tips" :key="tipIndex">{{ tip }}</li>
                </ul>
              </div>

              <!-- Try It button at the end -->
              <div
                v-if="
                  currentSection === tutorialSections.length - 1 &&
                  stepIndex === tutorialSections[currentSection].steps.length - 1
                "
                class="try-it-container"
              >
                <button class="try-it-button" @click="goToSynth">Go to Synth Interface</button>
              </div>
            </div>
          </div>

          <!-- Navigation buttons -->
          <div class="tutorial-navigation">
            <button
              class="nav-button prev"
              @click="currentSection = Math.max(0, currentSection - 1)"
              :disabled="currentSection === 0"
            >
              Previous Section
            </button>
            <button
              class="nav-button next"
              @click="currentSection = Math.min(tutorialSections.length - 1, currentSection + 1)"
              :disabled="currentSection === tutorialSections.length - 1"
            >
              Next Section
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onUnmounted, watch, onMounted, markRaw } from 'vue'
import type { Ref } from 'vue'
import { useRouter } from 'vue-router'
import OscilloscopeScreen from '../components/OscilloscopeScreen.vue'
import EnvelopeScreen from '../components/EnvelopeScreen.vue'
import ControlKnob from '@/components/ui/ControlKnob.vue'
import ToggleButton from '@/components/ui/ToggleButton.vue'
import * as Tone from 'tone'

const router = useRouter()

// Mark components as raw to prevent reactivity
const RawOscilloscopeScreen = markRaw(OscilloscopeScreen)
const RawEnvelopeScreen = markRaw(EnvelopeScreen)
const RawControlKnob = markRaw(ControlKnob)
const RawToggleButton = markRaw(ToggleButton)

// Initialize analyzers with default values
let oscilloscopeAnalyzer = new Tone.Analyser('waveform', 1024)
let envelopeVisualizer = new Tone.Analyser('waveform', 1024)
let testOscillator: Tone.Oscillator
let lpgFilter: Tone.Filter
let lpgVCA: Tone.Gain
let envelope: Tone.Envelope

// Setup reactive state
const currentSection = ref(0)
const attackValue = ref<number>(0.01)
const decayValue = ref<number>(0.5)
const oscillatorFreq = ref<number>(440)
const lpgResonance = ref<number>(0.5)
const lpgDamping = ref<number>(0.7)
const isPlaying = ref(false)
const triggerEnvelope = ref(false)
const triggerButtonValue = ref<boolean>(false)

// Update the tutorial sections type
interface KnobControl {
  label: string
  type: 'knob'
  component: typeof RawControlKnob
  value: Ref<number>
  min: number
  max: number
  step: number
  unit?: string
}

interface ButtonControl {
  label: string
  type: 'button'
  component: typeof RawToggleButton
  value: Ref<boolean>
  text: string
  action: () => void
}

interface SelectControl {
  label: string
  type: 'select'
  value: Ref<string>
  options: string[]
}

type Control = KnobControl | ButtonControl | SelectControl

interface Visualization {
  component: typeof RawOscilloscopeScreen | typeof RawEnvelopeScreen
  props: Record<string, unknown>
  interactive?: boolean
  controls?: Control[]
}

interface Step {
  title: string
  description: string
  visualization?: Visualization
  tips?: string[]
}

interface TutorialSection {
  title: string
  steps: Step[]
}

// Add new reactive state for oscillator parameters
const oscillatorType = ref<'sine' | 'sawtooth' | 'square' | 'triangle'>('sawtooth')
const fmAmount = ref<number>(0)
const pulseWidth = ref<number>(0.5)
const lpgMode = ref<'vca' | 'vcf' | 'both'>('both')

// Initialize audio nodes
onMounted(() => {
  initializeAudio()
})

const initializeAudio = () => {
  // Create audio nodes
  testOscillator = new Tone.Oscillator(oscillatorFreq.value)
  testOscillator.type = oscillatorType.value
  testOscillator.volume.value = -20
  testOscillator.start()

  oscilloscopeAnalyzer = new Tone.Analyser('waveform', 1024)
  envelopeVisualizer = new Tone.Analyser('waveform', 1024)

  // LPG components (filter + VCA)
  lpgFilter = new Tone.Filter({
    frequency: 1000,
    type: 'lowpass',
    Q: lpgResonance.value,
  })

  lpgVCA = new Tone.Gain(0)

  // Envelope for LPG and visualizer
  envelope = new Tone.Envelope({
    attack: attackValue.value,
    decay: decayValue.value,
    sustain: 0,
    release: 0.1,
  }).connect(lpgVCA.gain)

  // Connect main signal path
  testOscillator.connect(lpgFilter)
  lpgFilter.connect(lpgVCA)

  // Connect to analyzers
  testOscillator.connect(oscilloscopeAnalyzer)
  lpgVCA.connect(envelopeVisualizer)

  // Connect to output
  lpgVCA.toDestination()

  // Initially mute the oscillator
  testOscillator.volume.value = -Infinity
}

// Watch for oscillator type changes
watch(oscillatorType, (newType) => {
  if (testOscillator) {
    testOscillator.type = newType
  }
})

// Watch for FM amount changes
watch(fmAmount, (newAmount) => {
  if (testOscillator) {
    // Apply FM using frequency modulation
    const modulator = new Tone.Oscillator(oscillatorFreq.value * 2).start()
    const modulationScale = new Tone.Gain(newAmount * 100)
    modulator.connect(modulationScale)
    modulationScale.connect(testOscillator.frequency)
  }
})

// Watch for pulse width changes
watch(pulseWidth, (newWidth) => {
  if (testOscillator && oscillatorType.value === 'square') {
    // Adjust duty cycle for square wave
    testOscillator.type = 'square'
    testOscillator.phase = newWidth * 360
  }
})

// Watch for LPG mode changes
watch(lpgMode, (newMode) => {
  if (lpgFilter && lpgVCA) {
    switch (newMode) {
      case 'vca':
        // Bypass filter, only use VCA
        lpgFilter.frequency.value = 20000
        lpgFilter.Q.value = 0
        break
      case 'vcf':
        // Use filter with current settings, bypass VCA
        lpgVCA.gain.value = 1
        break
      case 'both':
        // Use both with current settings
        lpgFilter.frequency.value = 1000 * (1 - lpgDamping.value / 2)
        lpgFilter.Q.value = lpgResonance.value
        break
    }
  }
})

// Update toggleOscillator function
const toggleOscillator = () => {
  isPlaying.value = !isPlaying.value
  if (testOscillator) {
    testOscillator.volume.value = isPlaying.value ? -20 : -Infinity
  }
}

// Trigger envelope for visualization and sound
const toggleEnvelope = () => {
  triggerEnvelope.value = !triggerEnvelope.value
  if (envelope && isPlaying.value) {
    envelope.triggerAttackRelease(2)
  }
}

// Navigate to main synth page
const goToSynth = () => {
  router.push('/')
}

// Define tutorial sections and steps
const tutorialSections = reactive<TutorialSection[]>([
  {
    title: 'Welcome to Bongo Synth',
    steps: [
      {
        title: 'Understanding the Interface',
        description: 'Bongo is organized into several key sections, each with specific functions:',
        tips: [
          'Clock & Sequencers: Control timing and generate patterns',
          'Oscillators & Noise: Generate sound sources (saw, square, noise)',
          'LPGs (Low Pass Gates): Shape tone and dynamics',
          'Envelopes: Control how sounds evolve over time',
          'Mixer: Balance and blend different sound sources',
          'Effects: Add space and character to your sounds',
          'Visualizers: See your sound in real-time',
        ],
      },
      {
        title: 'Signal Flow',
        description: 'Audio signals in Bongo follow a specific path:',
        tips: [
          'Clock → Sequencers: Generate timing and pitch patterns',
          'Sequencers → Oscillators/Noise: Control pitch and rate',
          'Oscillators/Noise → LPGs: Raw sound gets shaped',
          'Clock → Envelopes → LPGs: Control dynamics and timbre',
          'LPGs → Mixer: Balance different voices',
          'Mixer → Effects → Output: Final sound processing',
        ],
      },
    ],
  },
  {
    title: 'Oscillator Controls',
    steps: [
      {
        title: 'Frequency',
        description:
          'The oscillator is the sound source. Control its frequency, shape, and modulation.',
        visualization: {
          component: RawOscilloscopeScreen,
          props: { label: 'Oscillator Output', input: oscilloscopeAnalyzer },
          interactive: true,
          controls: [
            {
              label: 'Start/Stop',
              type: 'button',
              component: RawToggleButton,
              value: isPlaying,
              action: toggleOscillator,
              text: 'Start',
            },
            {
              label: 'Waveform',
              type: 'select',
              value: oscillatorType,
              options: ['sine', 'sawtooth', 'square', 'triangle'],
            },
            {
              label: 'Frequency',
              type: 'knob',
              component: RawControlKnob,
              value: oscillatorFreq,
              min: 20,
              max: 2000,
              step: 1,
              unit: 'Hz',
            },
            {
              label: 'FM Amount',
              type: 'knob',
              component: RawControlKnob,
              value: fmAmount,
              min: 0,
              max: 100,
              step: 1,
            },
            {
              label: 'Pulse Width',
              type: 'knob',
              component: RawControlKnob,
              value: pulseWidth,
              min: 0,
              max: 1,
              step: 0.01,
            },
          ],
        },
        tips: [
          'Click Start to begin hearing the oscillator',
          'Choose different waveforms to change the timbre',
          'Adjust frequency to change the pitch',
          'FM Amount adds frequency modulation',
          'Pulse Width affects the square wave shape',
        ],
      },
      {
        title: 'Noise Generator',
        description: 'A versatile noise source with variable color and rate control.',
        tips: [
          'Type switch selects between white, pink, and brown noise',
          'Rate control affects the texture and character',
          'Can be sequenced for rhythmic effects',
          'Perfect for percussion and textural sounds',
        ],
      },
    ],
  },
  {
    title: 'Dynamic Control',
    steps: [
      {
        title: 'Low Pass Gates',
        description:
          'LPGs shape both the tone and dynamics of your sound, creating natural and expressive results.',
        visualization: {
          component: RawOscilloscopeScreen,
          props: { label: 'LPG Output', input: envelopeVisualizer },
          interactive: true,
          controls: [
            {
              label: 'Mode',
              type: 'select',
              value: lpgMode,
              options: ['vca', 'vcf', 'both'],
            },
            {
              label: 'Resonance',
              type: 'knob',
              component: RawControlKnob,
              value: lpgResonance,
              min: 0,
              max: 10,
              step: 0.1,
            },
            {
              label: 'Response',
              type: 'knob',
              component: RawControlKnob,
              value: lpgDamping,
              min: 0,
              max: 1,
              step: 0.01,
            },
          ],
        },
        tips: [
          'VCA mode acts as a volume control',
          'VCF mode acts as a filter',
          'Both mode combines VCA and VCF',
          'Resonance creates ringing at high settings',
          'Response shapes the decay character',
        ],
      },
      {
        title: 'Function Generators',
        description: 'Envelopes that shape how your sounds evolve over time.',
        visualization: {
          component: RawEnvelopeScreen,
          props: {
            attackTime: attackValue,
            decayTime: decayValue,
            triggered: triggerEnvelope,
          },
          interactive: true,
          controls: [
            {
              label: 'Attack',
              type: 'knob',
              component: RawControlKnob,
              value: attackValue,
              min: 0.01,
              max: 2,
              step: 0.01,
              unit: 's',
            },
            {
              label: 'Decay',
              type: 'knob',
              component: RawControlKnob,
              value: decayValue,
              min: 0.01,
              max: 4,
              step: 0.01,
              unit: 's',
            },
            {
              label: 'Trigger',
              type: 'button',
              component: RawToggleButton,
              value: triggerButtonValue,
              action: toggleEnvelope,
              text: 'Trigger',
            },
          ],
        },
        tips: [
          'Attack sets how quickly the sound fades in',
          'Decay determines how long it takes to fade out',
          'Triggered by the clock when steps are active',
          'Controls the LPG response for each voice',
        ],
      },
    ],
  },
  {
    title: 'Mixing and Effects',
    steps: [
      {
        title: 'Main Mixer',
        description: 'The mixer lets you balance your three voices and control the final output.',
        tips: [
          'Each channel has independent level control',
          'Mute buttons silence individual channels',
          'Solo buttons isolate specific channels',
          'Master volume controls overall output',
        ],
      },
      {
        title: 'Effects Processing',
        description: 'The effects section adds space and character to your sound.',
        tips: [
          'Delay creates echoes and rhythmic effects',
          'Reverb adds space and atmosphere',
          'Filter can shape the overall tone',
          'Mix controls blend dry and processed sound',
        ],
      },
    ],
  },
])

// Cleanup on component unmount
onUnmounted(() => {
  if (testOscillator) {
    testOscillator.stop()
    testOscillator.dispose()
  }

  if (lpgFilter) lpgFilter.dispose()
  if (lpgVCA) lpgVCA.dispose()
  if (envelope) envelope.dispose()
  if (oscilloscopeAnalyzer) oscilloscopeAnalyzer.dispose()
  if (envelopeVisualizer) envelopeVisualizer.dispose()
})
</script>

<style scoped>
.help-container {
  display: flex;
  flex-direction: column;
  padding: var(--space-lg);
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100%;
  box-sizing: border-box;
  background-color: var(--color-bg-darker);
}

.help-header {
  text-align: center;
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--color-border-primary);
}

.help-header h1 {
  color: var(--color-primary);
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--space-md);
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 1.2rem;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  flex: 1;
}

.tutorial-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  justify-content: center;
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-md);
  border-bottom: 1px solid var(--color-border-dark);
}

.nav-button {
  background: var(--gradient-darker);
  border: 1px solid var(--color-border-dark);
  color: var(--color-text-secondary);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-sm);
}

.nav-button:hover {
  background: var(--gradient-dark);
  border-color: var(--color-border-primary);
  color: var(--color-text-primary);
}

.nav-button.active {
  background: var(--color-primary-dark);
  border-color: var(--color-primary);
  color: var(--color-text-primary);
  box-shadow: var(--shadow-glow);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tutorial-content {
  flex: 1;
  background: var(--gradient-dark);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-md);
  padding: var(--space-xl);
}

.tutorial-section h2 {
  color: var(--color-primary);
  font-size: 1.8rem;
  margin-bottom: var(--space-xl);
  text-align: center;
}

.tutorial-step {
  display: flex;
  margin-bottom: var(--space-xl);
  gap: var(--space-lg);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  background: var(--color-primary-dark);
  color: var(--color-text-primary);
  border-radius: var(--radius-full);
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-content h3 {
  color: var(--color-text-primary);
  font-size: 1.3rem;
  margin-bottom: var(--space-md);
}

.step-content p {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-lg);
}

.visualization-area {
  background: var(--gradient-darker);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-dark);
  padding: var(--space-md);
  margin-bottom: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.visualization-container {
  height: 200px;
  width: 100%;
}

.visualization {
  height: 100%;
  width: 100%;
}

.visualization-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  justify-content: center;
}

.interactive-control {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  min-width: 150px;
}

.interactive-control label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.interactive-control input,
.interactive-control select {
  background: var(--color-bg-dark);
  border: 1px solid var(--color-border-dark);
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
}

.interactive-control select {
  min-width: 120px;
  height: 32px;
}

.control-value {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: center;
}

.control-button {
  background: var(--gradient-darker);
  border: 1px solid var(--color-border-dark);
  color: var(--color-text-primary);
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-sm);
  min-height: 32px;
}

.control-button:hover {
  background: var(--gradient-dark);
  border-color: var(--color-primary);
}

.control-button.active {
  background: var(--color-primary-dark);
  border-color: var(--color-primary);
  box-shadow: 0 0 5px var(--color-primary-glow);
}

.tips-container {
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  margin-top: var(--space-lg);
}

.tips-container h4 {
  color: var(--color-primary);
  margin-bottom: var(--space-md);
  font-size: 1.1rem;
}

.tips-list {
  padding-left: var(--space-lg);
}

.tips-list li {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-sm);
  line-height: 1.5;
}

.tutorial-navigation {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-border-dark);
}

.signal-flow-diagram {
  height: 100px;
  background-image: url('data:image/svg+xml;utf8,<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="%2365e18b" /></marker></defs><g><rect x="10%" y="20%" width="15%" height="60%" rx="5" ry="5" fill="%231a1a1a" stroke="%233c3c3c" stroke-width="2" /><text x="17.5%" y="52%" font-size="14" text-anchor="middle" fill="%2395a5a6">OSC</text><rect x="35%" y="20%" width="15%" height="60%" rx="5" ry="5" fill="%231a1a1a" stroke="%233c3c3c" stroke-width="2" /><text x="42.5%" y="52%" font-size="14" text-anchor="middle" fill="%2395a5a6">MOD</text><rect x="60%" y="20%" width="15%" height="60%" rx="5" ry="5" fill="%231a1a1a" stroke="%233c3c3c" stroke-width="2" /><text x="67.5%" y="52%" font-size="14" text-anchor="middle" fill="%2395a5a6">MIX</text><rect x="85%" y="20%" width="10%" height="60%" rx="5" ry="5" fill="%231a1a1a" stroke="%233c3c3c" stroke-width="2" /><text x="90%" y="52%" font-size="14" text-anchor="middle" fill="%2395a5a6">OUT</text><line x1="25%" y1="50%" x2="35%" y2="50%" stroke="%2365e18b" stroke-width="2" marker-end="url(%23arrowhead)" /><line x1="50%" y1="50%" x2="60%" y2="50%" stroke="%2365e18b" stroke-width="2" marker-end="url(%23arrowhead)" /><line x1="75%" y1="50%" x2="85%" y2="50%" stroke="%2365e18b" stroke-width="2" marker-end="url(%23arrowhead)" /></g></svg>');
  background-repeat: no-repeat;
  background-position: center;
  margin: var(--space-lg) 0;
}

.try-it-container {
  display: flex;
  justify-content: center;
  margin-top: var(--space-xl);
}

.try-it-button {
  background: var(--color-primary-dark);
  color: var(--color-text-primary);
  border: none;
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-md);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px var(--color-primary-glow);
}

.try-it-button:hover {
  background: var(--color-primary);
  transform: scale(1.05);
  box-shadow: 0 0 15px var(--color-primary-glow);
}

@media (max-width: 768px) {
  .help-container {
    padding: var(--space-md);
  }

  .tutorial-step {
    flex-direction: column;
    gap: var(--space-md);
  }

  .step-number {
    margin-bottom: var(--space-sm);
  }

  .tutorial-navigation {
    flex-direction: column;
    gap: var(--space-md);
  }

  .help-header h1 {
    font-size: 2rem;
  }
}
</style>
