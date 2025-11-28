'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Settings, Volume2, Mic, TestTube } from 'lucide-react'
import { useVoice } from '@/hooks/use-voice'

export function VoiceSettings() {
  const [isEnabled, setIsEnabled] = useState(true)
  const [rate, setRate] = useState(0.9)
  const [pitch, setPitch] = useState(1)
  const [volume, setVolume] = useState(0.8)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<number>(0)

  const { isSupported, speak } = useVoice()

  useEffect(() => {
    if (isSupported) {
      // Load available voices
      if (window.speechSynthesis) {
        setVoices(window.speechSynthesis.getVoices())
      }
    }
  }, [isSupported])

  const handleEnabledChange = (enabled: boolean) => {
    setIsEnabled(enabled)
    if (enabled) {
      speak('Voice feedback enabled')
    }
  }

  const handleRateChange = (value: number[]) => {
    setRate(value[0])
  }

  const handlePitchChange = (value: number[]) => {
    setPitch(value[0])
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  const handleVoiceChange = (voiceIndex: string) => {
    setSelectedVoice(parseInt(voiceIndex))
  }

  const testVoice = () => {
    speak('Voice system is working correctly')
  }

  if (!isSupported) {
    return null
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Voice Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Voice & Accessibility Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Enable/Disable Voice */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Voice Feedback</Label>
              <div className="text-sm text-muted-foreground">
                Enable audio confirmations for actions
              </div>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={handleEnabledChange}
            />
          </div>

          <Separator />

          {/* Voice Settings */}
          {isEnabled && (
            <>
              {/* Speech Rate */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Speech Rate</Label>
                <div className="px-3">
                  <Slider
                    value={[rate]}
                    onValueChange={handleRateChange}
                    max={2}
                    min={0.1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Slow</span>
                    <span>{rate.toFixed(1)}x</span>
                    <span>Fast</span>
                  </div>
                </div>
              </div>

              {/* Pitch */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Pitch</Label>
                <div className="px-3">
                  <Slider
                    value={[pitch]}
                    onValueChange={handlePitchChange}
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Low</span>
                    <span>{pitch.toFixed(1)}</span>
                    <span>High</span>
                  </div>
                </div>
              </div>

              {/* Volume */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Volume</Label>
                <div className="px-3">
                  <Slider
                    value={[volume]}
                    onValueChange={handleVolumeChange}
                    max={1}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Quiet</span>
                    <span>{Math.round(volume * 100)}%</span>
                    <span>Loud</span>
                  </div>
                </div>
              </div>

              {/* Voice Selection */}
              {voices.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Voice</Label>
                  <Select value={selectedVoice.toString()} onValueChange={handleVoiceChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {voices.map((voice, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {voice.name} ({voice.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Test Button */}
              <Button
                onClick={testVoice}
                className="w-full"
                variant="outline"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Test Voice Settings
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}