"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle } from "lucide-react"

interface YouTubeVideo {
  id: string
  title: string
  channelTitle: string
  thumbnail: string
  duration?: string
}

interface YouTubePlayerProps {
  video: YouTubeVideo
  favorites: YouTubeVideo[]
  onVideoChange: (video: YouTubeVideo) => void
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export function YouTubePlayer({ video, favorites, onVideoChange }: YouTubePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([50])
  const [isMuted, setIsMuted] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize YouTube Player
    const initializePlayer = () => {
      if (window.YT && window.YT.Player) {
        playerRef.current = new window.YT.Player("youtube-player", {
          height: "315",
          width: "560",
          videoId: video.id,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: (event: any) => {
              setDuration(event.target.getDuration())
              setIsPlaying(true)
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true)
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false)
              } else if (event.data === window.YT.PlayerState.ENDED) {
                handleNext()
              }
            },
          },
        })
      }
    }

    if (window.YT) {
      initializePlayer()
    } else {
      window.onYouTubeIframeAPIReady = initializePlayer
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [video.id])

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && isPlaying) {
        setCurrentTime(playerRef.current.getCurrentTime())
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying])

  const handlePlayPause = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo()
      } else {
        playerRef.current.playVideo()
      }
    }
  }

  const handlePrevious = () => {
    const currentIndex = favorites.findIndex((fav) => fav.id === video.id)
    if (currentIndex > 0) {
      onVideoChange(favorites[currentIndex - 1])
    } else if (favorites.length > 0) {
      onVideoChange(favorites[favorites.length - 1])
    }
  }

  const handleNext = () => {
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * favorites.length)
      onVideoChange(favorites[randomIndex])
    } else {
      const currentIndex = favorites.findIndex((fav) => fav.id === video.id)
      if (currentIndex < favorites.length - 1) {
        onVideoChange(favorites[currentIndex + 1])
      } else if (isRepeat && favorites.length > 0) {
        onVideoChange(favorites[0])
      }
    }
  }

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume)
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume[0])
    }
  }

  const handleMuteToggle = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute()
      } else {
        playerRef.current.mute()
      }
      setIsMuted(!isMuted)
    }
  }

  const handleSeek = (newTime: number[]) => {
    if (playerRef.current) {
      playerRef.current.seekTo(newTime[0])
      setCurrentTime(newTime[0])
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 rounded-none border-t shadow-lg">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:gap-4">
          {/* Video Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-none sm:w-48 lg:w-64">
            <img
              src={video.thumbnail || "/placeholder.svg"}
              alt={video.title}
              className="w-12 h-12 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm sm:text-sm truncate" title={video.title}>
                {video.title}
              </h4>
              <p className="text-xs text-muted-foreground truncate" title={video.channelTitle}>
                {video.channelTitle}
              </p>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col items-center gap-2 sm:gap-2 flex-1">
            {/* Control Buttons */}
            <div className="flex items-center gap-2 sm:gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-2 sm:p-2 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] ${isShuffle ? "text-primary" : ""}`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handlePrevious}
                className="p-2 sm:p-2 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
                title="Previous"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={handlePlayPause}
                className="p-3 sm:p-3 min-h-[48px] min-w-[48px] sm:min-h-[40px] sm:min-w-[40px]"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleNext}
                className="p-2 sm:p-2 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]"
                title="Next"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-2 sm:p-2 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] ${isRepeat ? "text-primary" : ""}`}
                title="Repeat"
              >
                <Repeat className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 w-full max-w-sm sm:max-w-md">
              <span className="text-xs text-muted-foreground w-10 text-center">{formatTime(currentTime)}</span>
              <Slider value={[currentTime]} max={duration} step={1} onValueChange={handleSeek} className="flex-1" />
              <span className="text-xs text-muted-foreground w-10 text-center">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-2 w-24 lg:w-32">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMuteToggle}
              className="p-2 min-h-[36px] min-w-[36px]"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Slider value={volume} max={100} step={1} onValueChange={handleVolumeChange} className="flex-1" />
          </div>

          {/* Mobile Volume Control */}
          <div className="flex sm:hidden items-center justify-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleMuteToggle}
              className="p-2 min-h-[44px] min-w-[44px]"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Slider value={volume} max={100} step={1} onValueChange={handleVolumeChange} className="w-24" />
          </div>
        </div>

        {/* Hidden YouTube Player */}
        <div className="hidden">
          <div id="youtube-player" ref={containerRef}></div>
        </div>
      </CardContent>
    </Card>
  )
}
