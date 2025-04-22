"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, X, Minimize2, Maximize2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChatMessage } from "./chat-message"
import { TypingIndicator } from "./typing-indicator"

export type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ChatWidgetProps {
  initialOpen?: boolean
}

export function ChatWidget({ initialOpen = false }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Update isOpen when initialOpen changes
  useEffect(() => {
    setIsOpen(initialOpen)
  }, [initialOpen])

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading])

  // Focus textarea when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen, isMinimized])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Simulate API call with a timeout
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: getAIResponse(input),
          role: "assistant",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, botMessage])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error:", error)

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I'm having trouble processing your request. Please try again later.`,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
      setIsLoading(false)
    }
  }

  // Simple response generator for demo purposes
  const getAIResponse = (input: string) => {
    const inputLower = input.toLowerCase()

    if (inputLower.includes("hello") || inputLower.includes("hi")) {
      return "Hello! How can I help you today?"
    }

    if (inputLower.includes("help") || inputLower.includes("can you")) {
      return "I'm here to help! I can answer questions, provide information, and assist with various tasks. What would you like to know?"
    }

    if (inputLower.includes("feature") || inputLower.includes("do")) {
      return "I offer several features including answering questions, providing information, assisting with tasks, and engaging in natural conversations. Is there something specific you'd like to know about?"
    }

    if (inputLower.includes("who") || inputLower.includes("what are you")) {
      return "I'm an AI assistant designed to provide helpful, accurate, and friendly responses to your questions and requests."
    }

    return "That's an interesting question. As an AI assistant, I'm designed to provide helpful information and assistance. Can you provide more details about what you'd like to know?"
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-primary hover:bg-primary/90 p-0 flex items-center justify-center z-50 transition-transform duration-300 hover:scale-110"
        aria-label="Open chat"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary-foreground"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </Button>
    )
  }

  return (
    <div
      className={`fixed bottom-6 right-6 bg-background rounded-lg shadow-xl transition-all duration-300 ease-in-out flex flex-col z-50 ${
        isMinimized ? "w-72 h-16" : "w-80 sm:w-96 h-[500px] max-h-[80vh]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h3 className="font-medium text-sm">AI Assistant</h3>
        </div>
        <div className="flex items-center space-x-1">
          {isMinimized ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-muted/80 transition-colors duration-200"
              onClick={() => setIsMinimized(false)}
              aria-label="Maximize"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-muted/80 transition-colors duration-200"
                onClick={clearChat}
                aria-label="Clear chat"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-muted/80 transition-colors duration-200"
                onClick={() => setIsMinimized(true)}
                aria-label="Minimize"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-muted/80 transition-colors duration-200"
            onClick={() => setIsOpen(false)}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-2 opacity-50"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <p className="text-sm">Ask me anything! I'm here to help.</p>
              </div>
            ) : (
              messages.map((message) => <ChatMessage key={message.id} message={message} />)
            )}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex space-x-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-[40px] max-h-[120px] resize-none focus:border-primary transition-colors duration-200"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-10 w-10 bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

