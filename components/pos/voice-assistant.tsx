'use client'

import { useState,useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  HelpCircle,
  Zap,
  ShoppingCart,
  Search,
  CreditCard,
  Printer,
  Percent,
  User,
  Trash2
} from 'lucide-react'
import { useVoice } from '@/hooks/use-voice'
import { voiceManager } from '@/lib/voice-manager'

interface VoiceAssistantProps {
  onVoiceCommand: (command: string, params?: any) => void
}

export function VoiceAssistant({ onVoiceCommand }: VoiceAssistantProps) {
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [showHelp, setShowHelp] = useState(false)
  
  const {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    speak,
    setEnabled
  } = useVoice()

  useEffect(() => {
    const handleCommand = (command: string, params?: any) => {
      if (command === 'SHOW_HELP') {
        setShowHelp(true)
      } else {
        onVoiceCommand(command, params)
      }
    }
    
    const unsubscribe = voiceManager.onCommand(handleCommand)
    return unsubscribe
  }, [onVoiceCommand])

  const handleToggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handleToggleAudio = () => {
    const newEnabled = !audioEnabled
    setAudioEnabled(newEnabled)
    setEnabled(newEnabled)
    if (newEnabled) {
      speak('Voice assistant enabled')
    }
  }

  const testVoice = () => {
    speak('Voice assistant is working correctly. You can now use voice commands.')
  }

  if (!isSupported) {
    return (
      <Card className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center text-yellow-800 dark:text-yellow-200">
          <MicOff className="h-4 w-4 mr-2" />
          <span className="text-sm">Voice commands not supported in this browser</span>
        </div>
      </Card>
    )
  }

  const voiceCommands = [
    {
      category: 'Product Management',
      icon: ShoppingCart,
      commands: [
        'Add [product name] to cart',
        'Add 5 Coca-Cola to cart',
        'Remove [product name] from cart',
        'Clear cart'
      ]
    },
    {
      category: 'Search & Navigation',
      icon: Search,
      commands: [
        'Search for [product name]',
        'Find Coca-Cola',
        'Show beverages'
      ]
    },
    {
      category: 'Payment Processing',
      icon: CreditCard,
      commands: [
        'Process payment',
        'Cash payment 50',
        'Card payment',
        'Apply 10% discount'
      ]
    },
    {
      category: 'Receipt & Printing',
      icon: Printer,
      commands: [
        'Print receipt',
        'Reprint last receipt'
      ]
    },
    {
      category: 'Customer Management',
      icon: User,
      commands: [
        'Select customer John Doe',
        'Add new customer'
      ]
    }
  ]

  return (
    <div className="space-y-3">
      {/* Voice Control Panel */}
      <Card className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-full ${isListening ? 'bg-red-100 dark:bg-red-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <Mic className={`h-4 w-4 ${isListening ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`} />
            </div>
            <div>
              <h3 className="font-medium text-sm">Voice Assistant</h3>
              <p className="text-xs text-muted-foreground">
                {isListening ? 'Listening...' : 'Click to activate'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleAudio}
              className="h-8 w-8 p-0"
            >
              {audioEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            
            <Dialog open={showHelp} onOpenChange={setShowHelp}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Voice Commands Help</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-96">
                  <div className="space-y-4">
                    {voiceCommands.map((category, index) => (
                      <div key={index}>
                        <div className="flex items-center mb-2">
                          <category.icon className="h-4 w-4 mr-2 text-primary" />
                          <h4 className="font-medium">{category.category}</h4>
                        </div>
                        <div className="space-y-1 ml-6">
                          {category.commands.map((command, cmdIndex) => (
                            <div key={cmdIndex} className="text-sm text-muted-foreground">
                              "{command}"
                            </div>
                          ))}
                        </div>
                        {index < voiceCommands.length - 1 && <Separator className="mt-3" />}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleToggleListening}
            className={`w-full ${isListening ? 'bg-red-600 hover:bg-red-700' : ''}`}
            size="sm"
          >
            {isListening ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Voice Commands
              </>
            )}
          </Button>

          {/* Live Transcript */}
          {isListening && (
            <div className="bg-accent/50 p-2 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">Live Transcript:</span>
                <Badge variant="outline" className="text-xs">
                  Active
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground min-h-[20px]">
                {transcript || 'Listening for commands...'}
              </p>
            </div>
          )}

          {/* Quick Test */}
          <Button
            variant="outline"
            size="sm"
            onClick={testVoice}
            className="w-full"
          >
            <Volume2 className="h-4 w-4 mr-2" />
            Test Voice Feedback
          </Button>
        </div>
      </Card>

      {/* Quick Voice Commands */}
      <Card className="p-3">
        <h4 className="font-medium text-sm mb-2">Quick Commands</h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => speak('Say: Add product name to cart')}
            className="justify-start text-xs"
          >
            <ShoppingCart className="h-3 w-3 mr-1" />
            Add Item
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => speak('Say: Process payment')}
            className="justify-start text-xs"
          >
            <Zap className="h-3 w-3 mr-1" />
            Payment
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => speak('Say: Search for product name')}
            className="justify-start text-xs"
          >
            <Search className="h-3 w-3 mr-1" />
            Search
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => speak('Say: Print receipt')}
            className="justify-start text-xs"
          >
            <Printer className="h-3 w-3 mr-1" />
            Receipt
          </Button>
        </div>
      </Card>

      {/* Status Indicator */}
      {isListening && (
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full border border-red-200 dark:border-red-800">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-red-700 dark:text-red-300 font-medium">
              Voice Active
            </span>
          </div>
        </div>
      )}
    </div>
  )
}