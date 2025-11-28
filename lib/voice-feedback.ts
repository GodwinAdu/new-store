'use client'

interface VoiceFeedbackOptions {
  enabled: boolean
  rate: number
  pitch: number
  volume: number
  voice?: SpeechSynthesisVoice
}

class VoiceFeedbackManager {
  private synth: SpeechSynthesis | null = null
  private options: VoiceFeedbackOptions = {
    enabled: true,
    rate: 0.9,
    pitch: 1,
    volume: 0.8
  }
  private voices: SpeechSynthesisVoice[] = []

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis
      this.loadVoices()
      
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices()
      }
    }
  }

  private loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices()
      const englishVoice = this.voices.find(voice => 
        voice.lang.startsWith('en') && voice.localService
      )
      if (englishVoice) {
        this.options.voice = englishVoice
      }
    }
  }

  getVoices() {
    return this.voices
  }

  getOptions() {
    return { ...this.options }
  }

  setRate(rate: number) {
    this.options.rate = Math.max(0.1, Math.min(2, rate))
  }

  setPitch(pitch: number) {
    this.options.pitch = Math.max(0, Math.min(2, pitch))
  }

  setVolume(volume: number) {
    this.options.volume = Math.max(0, Math.min(1, volume))
  }

  setVoice(voiceIndex: number) {
    if (this.voices[voiceIndex]) {
      this.options.voice = this.voices[voiceIndex]
    }
  }

  speak(text: string, priority: 'low' | 'normal' | 'high' = 'normal') {
    if (!this.synth || !this.options.enabled || !text.trim()) return

    if (priority === 'high') {
      this.synth.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = this.options.rate
    utterance.pitch = this.options.pitch
    utterance.volume = this.options.volume
    
    if (this.options.voice) {
      utterance.voice = this.options.voice
    }

    // Pause speech recognition while speaking
    window.dispatchEvent(new CustomEvent('voiceFeedbackStart'))
    
    utterance.onend = () => {
      window.dispatchEvent(new CustomEvent('voiceFeedbackEnd'))
    }
    
    utterance.onerror = () => {
      window.dispatchEvent(new CustomEvent('voiceFeedbackEnd'))
    }

    this.synth.speak(utterance)
  }

  announceProductAdded(productName: string, quantity: number = 1) {
    const message = quantity === 1 
      ? `${productName} added to cart`
      : `${quantity} ${productName} added to cart`
    this.speak(message)
  }

  announcePaymentSuccess() {
    this.speak('Payment processed successfully', 'high')
  }

  announceTotal(amount: number) {
    this.speak(`Total amount: ${amount} cedis`)
  }

  setEnabled(enabled: boolean) {
    this.options.enabled = enabled
    if (enabled) {
      this.speak('Voice feedback enabled')
    }
  }

  isSupported() {
    return this.synth !== null
  }

  isSpeaking() {
    return this.synth ? this.synth.speaking : false
  }
}

export const voiceFeedback = new VoiceFeedbackManager()

export function useVoiceFeedback() {
  return {
    speak: voiceFeedback.speak.bind(voiceFeedback),
    announceProductAdded: voiceFeedback.announceProductAdded.bind(voiceFeedback),
    announcePaymentSuccess: voiceFeedback.announcePaymentSuccess.bind(voiceFeedback),
    announceTotal: voiceFeedback.announceTotal.bind(voiceFeedback),
    setEnabled: voiceFeedback.setEnabled.bind(voiceFeedback),
    isSupported: voiceFeedback.isSupported.bind(voiceFeedback),
    getVoices: voiceFeedback.getVoices.bind(voiceFeedback),
    getOptions: voiceFeedback.getOptions.bind(voiceFeedback),
    setRate: voiceFeedback.setRate.bind(voiceFeedback),
    setPitch: voiceFeedback.setPitch.bind(voiceFeedback),
    setVolume: voiceFeedback.setVolume.bind(voiceFeedback),
    setVoice: voiceFeedback.setVoice.bind(voiceFeedback)
  }
}