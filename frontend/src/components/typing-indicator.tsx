export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-lg px-3 py-2 flex items-center space-x-1">
        <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
        <div
          className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  )
}

