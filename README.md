# Vue Tone.js Timing Demo

A Vue 3 + TypeScript application demonstrating precise timing control using Tone.js.

## Features

- Precise audio timing using Tone.js Context, Clock, and Transport
- Event emission system for timing synchronization
- High-resolution timing measurements
- Interactive audio context management

## Timing System

The application uses three synchronized timing systems:

1. **Clock Time**: Deterministic scheduling time

   - Starts at lookAhead value (0.01s)
   - Increments exactly 1 second per tick
   - Used for precise event scheduling

2. **Context Time**: Web Audio context time

   - Real-time audio system clock
   - Typically within 1ms of Clock Time
   - Represents actual audio timing

3. **Transport Time**: Musical timeline
   - Synchronized with global transport
   - Used for musical events and scheduling
   - Maintains consistent timing offset

## Configuration

```typescript
const audioContext = new Tone.Context({
  latencyHint: 'interactive', // Optimized for interactive applications
  lookAhead: 0.01, // 10ms lookahead for scheduling
  updateInterval: 0.01, // 10ms update interval for timing
})
```

## Sample Output

```javascript
Timing Info: {
  'Clock Time': '0.010',      // Deterministic scheduling time
  'Context Time': '0.011',    // Actual audio context time
  'Transport Time': '0.029'   // Musical timeline time
}
```

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Dependencies

- Vue 3
- TypeScript
- Tone.js
- Vite

## License

MIT
