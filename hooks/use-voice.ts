'use client'

import { useState, useEffect, useCallback } from 'react'
import { voiceManager } from '@/lib/voice-manager'

export function useVoice() {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    const updateState = () => {
      const state = voiceManager.getState()
      setIsListening(state.isListening)
      setIsSpeaking(state.isSpeaking)
      setIsSupported(state.isSupported)
    }

    updateState()
    const interval = setInterval(updateState, 100)

    const unsubscribeTranscript = voiceManager.onTranscript((text, isFinal) => {
      setTranscript(text)
      if (isFinal) {
        setTimeout(() => setTranscript(''), 2000)
      }
    })

    return () => {
      clearInterval(interval)
      unsubscribeTranscript()
    }
  }, [])

  const speak = useCallback((text: string) => {
    voiceManager.speak(text)
  }, [])

  const startListening = useCallback(() => {
    voiceManager.startListening()
  }, [])

  const stopListening = useCallback(() => {
    voiceManager.stopListening()
  }, [])

  const setEnabled = useCallback((enabled: boolean) => {
    voiceManager.setEnabled(enabled)
  }, [])

  return {
    transcript,
    isListening,
    isSpeaking,
    isSupported,
    speak,
    startListening,
    stopListening,
    setEnabled
  }
}

export function useVoiceCommands(onCommand: (command: string, params?: any) => void) {
  useEffect(() => {
    return voiceManager.onCommand(onCommand)
  }, [onCommand])

  return useVoice()
}