'use client'

class VoiceManager {
  private recognition: SpeechRecognition | null = null
  private synthesis: SpeechSynthesis | null = null
  private isListening = false
  private isSpeaking = false
  private isEnabled = true
  private callbacks: Set<(transcript: string, isFinal: boolean) => void> = new Set()
  private commandCallbacks: Set<(command: string, params?: any) => void> = new Set()

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition()
        this.recognition.continuous = true
        this.recognition.interimResults = true
        this.recognition.lang = 'en-US'
        this.setupRecognition()
      }
      
      if (window.speechSynthesis) {
        this.synthesis = window.speechSynthesis
      }
    }
  }

  private setupRecognition() {
    if (!this.recognition) return

    this.recognition.onstart = () => {
      this.isListening = true
    }

    this.recognition.onend = () => {
      this.isListening = false
      // Auto-restart if not speaking
      if (this.isEnabled && !this.isSpeaking) {
        setTimeout(() => this.startListening(), 100)
      }
    }

    this.recognition.onresult = (event) => {
      if (this.isSpeaking) return

      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript.trim()
        } else {
          interimTranscript += result[0].transcript
        }
      }

      // Notify listeners
      this.callbacks.forEach(callback => {
        if (finalTranscript) {
          callback(finalTranscript, true)
          this.processCommand(finalTranscript)
        } else if (interimTranscript) {
          callback(interimTranscript, false)
        }
      })
    }

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'not-allowed') {
        this.isEnabled = false
      }
    }
  }

  private processCommand(transcript: string) {
    const command = transcript.toLowerCase().trim()
    
    // Product commands
    if (command.includes('add') && command.includes('to cart')) {
      const match = command.match(/add (.+?) to cart/)
      if (match) {
        this.commandCallbacks.forEach(cb => cb('ADD_PRODUCT', { name: match[1] }))
        return
      }
    }

    // Search commands
    if (command.startsWith('search for') || command.startsWith('find')) {
      const match = command.match(/(?:search for|find) (.+)/)
      if (match) {
        this.commandCallbacks.forEach(cb => cb('SEARCH', { term: match[1] }))
        return
      }
    }

    // Payment commands
    if (command.includes('process payment') || command === 'checkout') {
      this.commandCallbacks.forEach(cb => cb('PROCESS_PAYMENT'))
      return
    }

    if (command.includes('cash payment')) {
      this.commandCallbacks.forEach(cb => cb('SET_CASH_PAYMENT'))
      return
    }

    if (command.includes('card payment')) {
      this.commandCallbacks.forEach(cb => cb('SET_CARD_PAYMENT'))
      return
    }

    // Cart commands
    if (command === 'clear cart') {
      this.commandCallbacks.forEach(cb => cb('CLEAR_CART'))
      return
    }

    // Receipt commands
    if (command.includes('print receipt')) {
      this.commandCallbacks.forEach(cb => cb('PRINT_RECEIPT'))
      return
    }
  }

  speak(text: string) {
    if (!this.synthesis || !text.trim()) return

    this.isSpeaking = true
    this.stopListening()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 0.8

    utterance.onend = () => {
      this.isSpeaking = false
      if (this.isEnabled) {
        setTimeout(() => this.startListening(), 500)
      }
    }

    utterance.onerror = () => {
      this.isSpeaking = false
    }

    this.synthesis.speak(utterance)
  }

  startListening() {
    if (this.recognition && this.isEnabled && !this.isListening && !this.isSpeaking) {
      try {
        this.recognition.start()
      } catch (error) {
        console.log('Recognition already started')
      }
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
    if (!enabled) {
      this.stopListening()
    }
  }

  onTranscript(callback: (transcript: string, isFinal: boolean) => void) {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  onCommand(callback: (command: string, params?: any) => void) {
    this.commandCallbacks.add(callback)
    return () => this.commandCallbacks.delete(callback)
  }

  getState() {
    return {
      isListening: this.isListening,
      isSpeaking: this.isSpeaking,
      isSupported: !!this.recognition,
      isEnabled: this.isEnabled
    }
  }
}

export const voiceManager = new VoiceManager()

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}