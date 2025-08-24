import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")
  const maxResults = searchParams.get("maxResults") || "12"

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    console.error("YouTube API key not found in environment variables")
    return NextResponse.json(
      {
        error: "YouTube API key not configured",
        message: "Please add YOUTUBE_API_KEY to your .env.local file",
      },
      { status: 500 },
    )
  }

  try {
    console.log("[v0] Making YouTube API search request for query:", query)

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
        new URLSearchParams({
          part: "snippet",
          q: query,
          type: "video",
          videoCategoryId: "10", // Music category
          maxResults: maxResults,
          key: apiKey,
        }),
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] YouTube API error response:", response.status, errorText)
      throw new Error(`YouTube API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] YouTube search successful, found", data.items?.length || 0, "videos")

    // Get video durations and additional details
    const videoIds = data.items.map((item: any) => item.id.videoId).join(",")
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
        new URLSearchParams({
          part: "contentDetails,statistics",
          id: videoIds,
          key: apiKey,
        }),
    )

    const detailsData = await detailsResponse.json()

    // Format the results
    const videos = data.items.map((item: any, index: number) => {
      const details = detailsData.items[index]
      const duration = details?.contentDetails?.duration
      const viewCount = details?.statistics?.viewCount

      return {
        id: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
        duration: formatDuration(duration),
        publishedAt: item.snippet.publishedAt,
        viewCount: viewCount ? Number.parseInt(viewCount) : undefined,
      }
    })

    return NextResponse.json({ videos })
  } catch (error) {
    console.error("[v0] YouTube API error:", error)
    return NextResponse.json(
      {
        error: "Failed to search YouTube",
        message: error instanceof Error ? error.message : "Unknown error",
        details: "Check your API key and ensure YouTube Data API v3 is enabled",
      },
      { status: 500 },
    )
  }
}

function formatDuration(duration: string): string {
  if (!duration) return ""

  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  if (!match) return ""

  const hours = Number.parseInt(match[1]?.replace("H", "") || "0")
  const minutes = Number.parseInt(match[2]?.replace("M", "") || "0")
  const seconds = Number.parseInt(match[3]?.replace("S", "") || "0")

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
