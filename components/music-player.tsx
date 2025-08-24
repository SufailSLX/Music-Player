"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from "lucide-react"

interface Song {
  id: string
  title: string
  artist: string
  file: string
  duration: number
}

interface MusicPlayerProps {
  song: Song
  songs: Song[]
  onSongChange: (song: Song) => void
}

export function MusicPlayer({ song, songs, onSongChange }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0
        audio.play()
      } else {
        handleNext()
      }
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [isRepeat])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.src = song.file
    audio.load()
    setCurrentTime(0)

    if (isPlaying) {
      audio.play()
    }
  }, [song])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = value[0]
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
    setIsMuted(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const handlePrevious = () => {
    const currentIndex = songs.findIndex((s) => s.id === song.id)
    if (currentIndex > 0) {
      onSongChange(songs[currentIndex - 1])
    } else if (songs.length > 0) {
      onSongChange(songs[songs.length - 1])
    }
  }

  const handleNext = () => {
    const currentIndex = songs.findIndex((s) => s.id === song.id)

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * songs.length)
      onSongChange(songs[randomIndex])
    } else if (currentIndex < songs.length - 1) {
      onSongChange(songs[currentIndex + 1])
    } else if (songs.length > 0) {
      onSongChange(songs[0])
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-white/10 rounded-none z-50">
      <CardContent className="p-3 sm:p-4">
        <audio ref={audioRef} />

        {/* Mobile Layout */}
        <div className="block sm:hidden space-y-3">
          {/* Song Info */}
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white truncate text-sm">{song.title}</h4>
              <p className="text-xs text-white/70 truncate">{song.artist}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-white/20">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70 w-8 text-right">{formatTime(currentTime)}</span>
            <Slider value={[currentTime]} max={song.duration} step={1} onValueChange={handleSeek} className="flex-1" />
            <span className="text-xs text-white/70 w-8">{formatTime(song.duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsShuffle(!isShuffle)}
              className={`text-white hover:bg-white/20 ${isShuffle ? "text-purple-400" : ""}`}
            >
              <Shuffle className="w-4 h-4" />
            </Button>

            <Button variant="ghost" size="sm" onClick={handlePrevious} className="text-white hover:bg-white/20">
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button variant="ghost" size="lg" onClick={togglePlay} className="text-white hover:bg-white/20 bg-white/10">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>

            <Button variant="ghost" size="sm" onClick={handleNext} className="text-white hover:bg-white/20">
              <SkipForward className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRepeat(!isRepeat)}
              className={`text-white hover:bg-white/20 ${isRepeat ? "text-purple-400" : ""}`}
            >
              <Repeat className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Song Info */}
          <div className="flex-1 min-w-0 max-w-xs">
            <h4 className="font-medium text-white truncate">{song.title}</h4>
            <p className="text-sm text-white/70 truncate">{song.artist}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsShuffle(!isShuffle)}
              className={`text-white hover:bg-white/20 ${isShuffle ? "text-purple-400" : ""}`}
            >
              <Shuffle className="w-4 h-4" />
            </Button>

            <Button variant="ghost" size="sm" onClick={handlePrevious} className="text-white hover:bg-white/20">
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button variant="ghost" size="lg" onClick={togglePlay} className="text-white hover:bg-white/20 bg-white/10">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </Button>

            <Button variant="ghost" size="sm" onClick={handleNext} className="text-white hover:bg-white/20">
              <SkipForward className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRepeat(!isRepeat)}
              className={`text-white hover:bg-white/20 ${isRepeat ? "text-purple-400" : ""}`}
            >
              <Repeat className="w-4 h-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="flex-1 flex items-center gap-2 max-w-md">
            <span className="text-xs text-white/70 w-10 text-right">{formatTime(currentTime)}</span>
            <Slider value={[currentTime]} max={song.duration} step={1} onValueChange={handleSeek} className="flex-1" />
            <span className="text-xs text-white/70 w-10">{formatTime(song.duration)}</span>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-white/20">
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
