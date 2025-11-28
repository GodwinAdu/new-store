'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Mic, MicOff, Search, Volume2 } from 'lucide-react'
import { useVoice } from '@/hooks/use-voice'

interface VoiceSearchProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  onProductSelect?: (productName: string) => void
  placeholder?: string
}

export function VoiceSearch({ 
  searchTerm, 
  onSearchChange, 
  onProductSelect,
  placeholder = "Search products or say 'Search for...' "
}: VoiceSearchProps) {
  const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false)
  const [searchResults, setSearchResults] = useState<string[]>([])
  
  const {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    speak
  } = useVoice()

  useEffect(() => {
    if (transcript && isVoiceSearchActive && transcript.length > 2) {
      onSearchChange(transcript)
    }
  }, [transcript, isVoiceSearchActive, onSearchChange])

  const handleVoiceSearch = () => {
    if (isListening) {
      stopListening()
      setIsVoiceSearchActive(false)
    } else {
      setIsVoiceSearchActive(true)
      startListening()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm) {
      // Trigger search on Enter
      if (onProductSelect) {
        onProductSelect(searchTerm)
      }
    }
  }

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`pl-10 pr-12 h-10 ${isVoiceSearchActive ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : ''}`}
          />
          
          {/* Voice indicator */}
          {isVoiceSearchActive && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
        </div>
        
        {isSupported && (
          <Button
            variant={isListening ? "destructive" : "outline"}
            size="sm"
            onClick={handleVoiceSearch}
            className="ml-2 h-10"
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Live transcript display */}
      {isVoiceSearchActive && transcript && (
        <Card className="absolute top-12 left-0 right-0 z-50 p-3 bg-white dark:bg-gray-800 border shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Voice Input:</span>
            <Badge variant="outline" className="text-xs">
              Listening...
            </Badge>
          </div>
          <p className="text-sm">{transcript}</p>
          
          <div className="flex justify-end mt-2 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                stopListening()
                setIsVoiceSearchActive(false)
                onSearchChange('')
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (transcript) {
                  onSearchChange(transcript)
                  if (onProductSelect) {
                    onProductSelect(transcript)
                  }
                }
                stopListening()
                setIsVoiceSearchActive(false)
              }}
            >
              Search
            </Button>
          </div>
        </Card>
      )}

      {/* Voice search tips */}
      {!isSupported && (
        <div className="absolute top-12 left-0 right-0 z-50">
          <Card className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center text-yellow-800 dark:text-yellow-200">
              <Volume2 className="h-3 w-3 mr-2" />
              <span className="text-xs">Voice search not supported in this browser</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}