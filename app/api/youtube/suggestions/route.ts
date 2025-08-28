import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  try {
    const response = await fetch(
      `https://clients1.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json, text/plain, */*",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const text = await response.text()
    console.log("[v0] Raw response:", text.substring(0, 100))

    let data
    if (text.startsWith("window.google.ac.h(")) {
      // JSONP format - extract JSON from callback
      const jsonStart = text.indexOf("[")
      const jsonEnd = text.lastIndexOf("]") + 1
      const jsonStr = text.substring(jsonStart, jsonEnd)
      data = JSON.parse(jsonStr)
    } else {
      // Regular JSON format
      data = JSON.parse(text)
    }

    const suggestions = Array.isArray(data) && data.length > 1 ? data[1] : []
    console.log("[v0] Parsed suggestions:", suggestions)

    return NextResponse.json({
      suggestions: suggestions.slice(0, 8), // Limit to 8 suggestions
    })
  } catch (error) {
    console.error("[v0] Suggestions API error:", error)

    const fallbackSuggestions = generateFallbackSuggestions(query)

    return NextResponse.json({
      suggestions: fallbackSuggestions,
      fallback: true,
    })
  }
}

function generateFallbackSuggestions(query: string): string[] {
  const musicKeywords = ["music", "song", "cover", "live", "official", "remix", "acoustic", "lyrics"]
  const suggestions: string[] = []

  // Add query with music-related suffixes
  musicKeywords.forEach((keyword) => {
    if (!query.toLowerCase().includes(keyword)) {
      suggestions.push(`${query} ${keyword}`)
    }
  })
  // Add some popular music-related completions
  if (query.length > 2) {
    suggestions.push(`${query} official music video`, `${query} lyrics`, `${query} cover`, `${query} live performance`)
  }

  return suggestions.slice(0, 6)
}
