'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface VoiceCommandHook {
  isListening: boolean
  isSupported: boolean
  transcript: string
  startListening: () => void
  stopListening: () => void
  speak: (text: string) => void
  confidence: number
}

export function useVoiceCommands(
  onCommand: (command: string, params?: any) => void
): VoiceCommandHook {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [isSpeechPaused, setIsSpeechPaused] = useState(false)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const speechSynthesis = window.speechSynthesis
    
    if (SpeechRecognition && speechSynthesis) {
      setIsSupported(true)
      synthRef.current = speechSynthesis
      
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onstart = () => {
        setIsListening(true)
        speak('Voice commands activated')
      }
      
      recognition.onend = () => {
        setIsListening(false)
      }
      
      recognition.onresult = (event) => {
        // Skip processing if AI is speaking
        if (window.speechSynthesis?.speaking || isSpeechPaused) {
          return
        }
        
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
            setConfidence(result[0].confidence)
          } else {
            interimTranscript += result[0].transcript
          }
        }
        
        setTranscript(finalTranscript || interimTranscript)
        
        if (finalTranscript && !window.speechSynthesis?.speaking) {
          processCommand(finalTranscript.toLowerCase().trim())
        }
      }
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please enable microphone permissions.')
        }
      }
      
      recognitionRef.current = recognition
    }

    // Listen for voice feedback events
    const handleVoiceFeedbackStart = () => {
      setIsSpeechPaused(true)
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop()
      }
    }

    const handleVoiceFeedbackEnd = () => {
      setIsSpeechPaused(false)
      if (recognitionRef.current && isListening) {
        setTimeout(() => {
          if (recognitionRef.current) {
            recognitionRef.current.start()
          }
        }, 500)
      }
    }

    window.addEventListener('voiceFeedbackStart', handleVoiceFeedbackStart)
    window.addEventListener('voiceFeedbackEnd', handleVoiceFeedbackEnd)

    return () => {
      window.removeEventListener('voiceFeedbackStart', handleVoiceFeedbackStart)
      window.removeEventListener('voiceFeedbackEnd', handleVoiceFeedbackEnd)
    }
  }, [])

  const processCommand = (command: string) => {
    // Product addition commands
    if (command.includes('add') && command.includes('to cart')) {
      const productMatch = command.match(/add (.+?) to cart/)
      if (productMatch) {
        const productName = productMatch[1]
        onCommand('ADD_TO_CART', { productName })
        speak(`Adding ${productName} to cart`)
        return
      }
    }
    
    // Quantity commands
    if (command.includes('add') && (command.includes('piece') || command.includes('item'))) {
      const quantityMatch = command.match(/add (\d+) (.+?)(?:\s+piece|\s+item|$)/)
      if (quantityMatch) {
        const quantity = parseInt(quantityMatch[1])
        const productName = quantityMatch[2]
        onCommand('ADD_TO_CART', { productName, quantity })
        speak(`Adding ${quantity} ${productName} to cart`)
        return
      }
    }
    
    // Search commands
    if (command.includes('search for') || command.includes('find')) {
      const searchMatch = command.match(/(?:search for|find) (.+)/)
      if (searchMatch) {
        const searchTerm = searchMatch[1]
        onCommand('SEARCH_PRODUCT', { searchTerm })
        speak(`Searching for ${searchTerm}`)
        return
      }
    }
    
    // Payment commands
    if (command.includes('process payment') || command.includes('checkout')) {
      onCommand('PROCESS_PAYMENT')
      speak('Processing payment')
      return
    }
    
    if (command.includes('cash payment')) {
      const amountMatch = command.match(/cash payment (\d+(?:\.\d{2})?)/)
      if (amountMatch) {
        const amount = parseFloat(amountMatch[1])
        onCommand('SET_CASH_PAYMENT', { amount })
        speak(`Setting cash payment to ${amount} cedis`)
      } else {
        onCommand('SET_PAYMENT_METHOD', { method: 'cash' })
        speak('Payment method set to cash')
      }
      return
    }
    
    if (command.includes('card payment')) {
      onCommand('SET_PAYMENT_METHOD', { method: 'card' })
      speak('Payment method set to card')
      return
    }
    
    // Receipt commands
    if (command.includes('print receipt')) {
      onCommand('PRINT_RECEIPT')
      speak('Printing receipt')
      return
    }
    
    // Cart management
    if (command.includes('clear cart') || command.includes('empty cart')) {
      onCommand('CLEAR_CART')
      speak('Cart cleared')
      return
    }
    
    if (command.includes('remove') && command.includes('from cart')) {
      const productMatch = command.match(/remove (.+?) from cart/)
      if (productMatch) {
        const productName = productMatch[1]
        onCommand('REMOVE_FROM_CART', { productName })
        speak(`Removing ${productName} from cart`)
        return
      }
    }
    
    // Discount commands
    if (command.includes('apply discount')) {
      const discountMatch = command.match(/apply (\d+)(?:%| percent) discount/)
      if (discountMatch) {
        const discount = parseInt(discountMatch[1])
        onCommand('APPLY_DISCOUNT', { discount })
        speak(`Applying ${discount} percent discount`)
        return
      }
    }
    
    // Customer commands
    if (command.includes('select customer')) {
      const customerMatch = command.match(/select customer (.+)/)
      if (customerMatch) {
        const customerName = customerMatch[1]
        onCommand('SELECT_CUSTOMER', { customerName })
        speak(`Selecting customer ${customerName}`)
        return
      }
    }
    
    // Help command
    if (command.includes('help') || command.includes('what can you do')) {
      onCommand('SHOW_HELP')
      speak('Available commands: Add product to cart, search for product, process payment, print receipt, clear cart, apply discount, and more')
      return
    }
    
    // Unknown command - don't speak to avoid feedback loop
    console.log('Unknown command:', command)
  }

  const startListening = () => {
    if (recognitionRef.current && isSupported && !isSpeechPaused) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Failed to start recognition:', error)
        toast.error('Failed to start voice recognition')
      }
    } else if (isSpeechPaused) {
      toast.error('Please wait for voice feedback to finish')
    } else {
      toast.error('Voice recognition not supported in this browser')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const speak = (text: string) => {
    if (synthRef.current && 'speechSynthesis' in window) {
      // Stop recognition before speaking
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop()
      }
      
      synthRef.current.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      utterance.onend = () => {
        // Restart recognition after speaking
        setTimeout(() => {
          if (recognitionRef.current && isListening) {
            try {
              recognitionRef.current.start()
            } catch (e) {
              console.log('Recognition restart failed')
            }
          }
        }, 500)
      }
      
      synthRef.current.speak(utterance)
    }
  }

  return {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    speak,
    confidence
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}