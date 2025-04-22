import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    // Connect to the Python backend
    const response = await fetch("http://localhost:8000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        history: history
          ? history.map((msg: any) => ({
              content: msg.content,
              role: msg.role,
            }))
          : [],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Backend error: ${errorData.detail || response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json({ response: data.response })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      { error: "Failed to process your request", details: (error as Error).message },
      { status: 500 },
    )
  }
}

