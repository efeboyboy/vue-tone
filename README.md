# Bongo Synth

![Bongo Synth](src/assets/bpp-logo-white.svg)

Bongo is a web-based FM synthesizer inspired by classic Braun design principles: simplicity, functionality, and elegance. Built with Vue.js and Tone.js, it provides a powerful yet accessible platform for sound design and musical exploration.

## Features

- **Multi-Channel Mixer**: Independent volume, mute, and solo controls for each channel
- **FM-Ready Oscillators**: Create complex sounds with customizable frequency modulation
- **Braun-Inspired UI**: Clean, intuitive interface with knobs, sliders, and switches
- **Responsive Design**: Works across desktop and tablet devices

## Overview

Bongo Synth is designed to bring the classic aesthetics of Dieter Rams' Braun design into the digital audio workspace. With its minimalist approach and focus on functionality, Bongo makes sound design accessible without sacrificing depth or creative potential.

### Key Components

- **Oscillators**: Generate and shape the primary sound sources
- **Mixer**: Control the balance between different sound elements
- **Effects**: Process and refine your sounds with various audio effects
- **Patch System**: Save and recall your favorite sound settings

## Synth Architecture

Bongo uses a modular architecture that allows for flexible signal routing:

```
Oscillators → Mixer → Effects → Output
```

Each oscillator can modulate others, creating complex FM synthesis possibilities. The mixer allows precise control over individual signal levels, while effects can be applied to shape the final sound.

## Technical Implementation

Bongo is built with:

- **Vue.js 3**: Frontend framework (Composition API)
- **Tone.js**: Web Audio framework for reliable sound generation
- **CSS Variables**: For consistent theming and responsive design

The synth leverages modern Web Audio API features through Tone.js, ensuring consistent audio performance across browsers.

## Running Locally

If you want to run Bongo Synth locally:

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to the URL shown in the terminal (typically http://localhost:5173)

## Credits

Designed and developed with ♥ by [Beats Per Plant](https://beatsperplant.com)  
Powered by [Vue.js](https://vuejs.org/) and [Tone.js](https://tonejs.github.io/)

---

v0.1 - Initial Release
