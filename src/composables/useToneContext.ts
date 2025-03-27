import * as Tone from 'tone'

declare global {
  interface Window {
    toneContext: Tone.Context
  }
}

if (!window.toneContext) {
  window.toneContext = new Tone.Context({
    latencyHint: 'interactive',
    lookAhead: 0.01,
    updateInterval: 0.01,
  })
  Tone.setContext(window.toneContext)
}

export const useToneContext = () => {
  const getContext = () => window.toneContext

  const startAudioContext = async () => {
    try {
      await Tone.start()
      return true
    } catch (error) {
      console.error('Failed to start audio context:', error)
      return false
    }
  }

  return {
    getContext,
    startAudioContext,
  }
}
