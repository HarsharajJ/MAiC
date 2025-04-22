"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ChatWidget } from "@/components/chat-widget/chat-widget"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  Code,
  Layers,
  Cpu,
  Sparkles,
  Brain,
  Bot,
  Lightbulb,
} from "lucide-react"

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const chatWidgetRef = useRef<any>(null)

  useEffect(() => {
    // Set loaded state after a small delay for animations
    setTimeout(() => setIsLoaded(true), 100)

    // Cycle through features every 3 seconds
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Function to handle opening the chat widget
  const handleOpenChat = () => {
    // Direct DOM manipulation as a fallback
    const chatButton = document.querySelector('[aria-label="Open chat"]') as HTMLButtonElement
    if (chatButton) {
      chatButton.click()
    }
    setIsChatOpen(true)
  }

  // Function to scroll to a section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const features = [
    {
      icon: <MessageSquare className="h-10 w-10 text-primary" />,
      title: "Natural Conversations",
      description:
        "Our AI assistant understands context and provides accurate information with natural language processing.",
    },
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: "Real-time Responses",
      description: "Get instant answers to your questions with our lightning-fast AI-powered chat system.",
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Secure Communication",
      description: "All conversations are secure and private, ensuring your information remains confidential.",
    },
    {
      icon: <Globe className="h-10 w-10 text-primary" />,
      title: "24/7 Availability",
      description: "Our assistant is available around the clock to help with your inquiries anytime.",
    },
  ]

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-background/80">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32" id="hero">
        <div
          className="absolute inset-0 bg-grid-small-white/[0.2] bg-grid-small-white/[0.2]"
          style={{
            backgroundSize: "30px 30px",
            maskImage: "radial-gradient(circle, white, transparent 80%)",
            WebkitMaskImage: "radial-gradient(circle, white, transparent 80%)",
          }}
        />

        <div className="container px-4 md:px-6 relative z-10">
          <div
            className={`mx-auto max-w-3xl text-center transition-all duration-1000 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <Badge className="mb-4 animate-shimmer bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 transition-colors">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              AI-Powered Assistant
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Chatbot AI
            </h1>
            <p className="mb-8 text-xl text-muted-foreground">
              Experience the future of conversation with our intelligent AI assistant
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="group bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
                onClick={() => scrollToSection("features")}
              >
                Explore Features
                <ChevronRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group transition-all duration-300 transform hover:scale-105"
                onClick={() => scrollToSection("demo")}
              >
                Try Demo
                <ArrowRight className="ml-2 h-4 w-4 opacity-70 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute -z-10 -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute -z-10 -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]" />
      </section>

      {/* Features Section */}
      <section className="py-20 relative" id="features">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Powerful AI Features
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                Our AI-powered chat widget provides seamless communication and instant information.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className={`transition-all duration-500 hover:shadow-lg cursor-pointer border-border/50 hover:border-primary/50 ${
                    activeFeature === index ? "border-primary scale-105 shadow-lg shadow-primary/20" : "scale-100"
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <CardHeader>
                    <div
                      className={`mb-2 transition-transform duration-500 ${activeFeature === index ? "scale-110" : ""}`}
                    >
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 bg-muted/30" id="solutions">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                AI Solutions
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                Discover how our AI chatbot can transform your digital experience
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="group hover:shadow-lg transition-all duration-500 hover:shadow-primary/10 border-border/50 hover:border-primary/50">
                <CardHeader>
                  <div className="mb-2 text-primary group-hover:scale-110 transition-transform duration-500">
                    <Bot className="h-10 w-10" />
                  </div>
                  <CardTitle>Customer Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    24/7 automated customer support that handles inquiries, troubleshooting, and service requests.
                  </CardDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
                    onClick={() => handleOpenChat()}
                  >
                    Try It Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-500 hover:shadow-primary/10 border-border/50 hover:border-primary/50">
                <CardHeader>
                  <div className="mb-2 text-primary group-hover:scale-110 transition-transform duration-500">
                    <Brain className="h-10 w-10" />
                  </div>
                  <CardTitle>Knowledge Assistant</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Intelligent knowledge base that provides accurate information and answers complex questions.
                  </CardDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
                    onClick={() => handleOpenChat()}
                  >
                    Try It Now
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-500 hover:shadow-primary/10 border-border/50 hover:border-primary/50">
                <CardHeader>
                  <div className="mb-2 text-primary group-hover:scale-110 transition-transform duration-500">
                    <Lightbulb className="h-10 w-10" />
                  </div>
                  <CardTitle>Creative Assistant</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    Generate ideas, content, and creative solutions with our AI-powered creative assistant.
                  </CardDescription>
                  <Button
                    variant="outline"
                    size="sm"
                    className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300"
                    onClick={() => handleOpenChat()}
                  >
                    Try It Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20" id="demo">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div
                className={`transition-all duration-1000 delay-300 ${isLoaded ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"}`}
              >
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                  Experience Our Interactive AI Assistant
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Our chat widget provides instant answers to your questions with advanced AI technology.
                </p>
                <ul className="space-y-4">
                  {[
                    "Ask questions and get instant answers",
                    "Get personalized recommendations",
                    "Request information and assistance",
                    "Explore features and capabilities",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start group">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-primary flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="group-hover:text-primary transition-colors duration-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button
                    className="group bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
                    onClick={() => handleOpenChat()}
                  >
                    Try it now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>

              <div
                className={`relative transition-all duration-1000 delay-500 ${isLoaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
              >
                <div className="bg-card rounded-lg border shadow-xl p-4 md:p-6 relative z-10 hover:shadow-primary/10 hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                      <h3 className="font-medium">Chat Preview</h3>
                    </div>
                  </div>
                  <div className="space-y-4 mb-4">
                    <div className="flex justify-start">
                      <div
                        className="bg-muted rounded-lg px-3 py-2 text-sm max-w-[80%] animate-fade-in"
                        style={{ animationDelay: "0.2s" }}
                      >
                        Hello! How can I help you today?
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div
                        className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-sm max-w-[80%] animate-fade-in"
                        style={{ animationDelay: "0.5s" }}
                      >
                        What can this chatbot do?
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div
                        className="bg-muted rounded-lg px-3 py-2 text-sm max-w-[80%] animate-fade-in"
                        style={{ animationDelay: "0.8s" }}
                      >
                        I can answer questions, provide information, assist with tasks, and engage in natural
                        conversations. Just ask me anything!
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted h-10 rounded-md animate-pulse" />
                    <div
                      className="w-10 h-10 bg-primary rounded-md flex items-center justify-center hover:bg-primary/90 transition-colors duration-300 cursor-pointer"
                      onClick={() => handleOpenChat()}
                    >
                      <Send className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-xl" />
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Overview */}
      <section className="py-20 bg-muted/30" id="technology">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                Technical Overview
              </h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                Our chat widget is built with modern technologies for optimal performance and user experience.
              </p>
            </div>

            <Tabs defaultValue="frontend" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger
                  value="frontend"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  Frontend
                </TabsTrigger>
                <TabsTrigger
                  value="backend"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  Backend
                </TabsTrigger>
                <TabsTrigger
                  value="ai"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  AI Integration
                </TabsTrigger>
              </TabsList>
              <TabsContent value="frontend" className="space-y-4 animate-fade-in">
                <Card className="border-border/50 hover:border-primary/50 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-primary" />
                      <CardTitle>Next.js & React</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      Our chat widget is built with Next.js and React, providing a fast and responsive user interface.
                      The widget uses React hooks for state management and effect handling.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-muted p-4 rounded-lg hover:bg-muted/70 transition-colors duration-300 hover:shadow-sm">
                        <h4 className="font-medium mb-2">Component Structure</h4>
                        <p className="text-sm text-muted-foreground">
                          Modular components for easy maintenance and updates
                        </p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg hover:bg-muted/70 transition-colors duration-300 hover:shadow-sm">
                        <h4 className="font-medium mb-2">Responsive Design</h4>
                        <p className="text-sm text-muted-foreground">
                          Adapts to all screen sizes for optimal user experience
                        </p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg hover:bg-muted/70 transition-colors duration-300 hover:shadow-sm">
                        <h4 className="font-medium mb-2">Tailwind CSS</h4>
                        <p className="text-sm text-muted-foreground">
                          Utility-first CSS framework for consistent styling
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="backend" className="space-y-4 animate-fade-in">
                <Card className="border-border/50 hover:border-primary/50 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-primary" />
                      <CardTitle>FastAPI & Next.js API Routes</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      The backend uses FastAPI for Python processing and Next.js API routes as a proxy, creating a
                      seamless connection between the frontend and AI processing.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-muted p-4 rounded-lg hover:bg-muted/70 transition-colors duration-300 hover:shadow-sm">
                        <h4 className="font-medium mb-2">API Architecture</h4>
                        <p className="text-sm text-muted-foreground">RESTful API design for reliable communication</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg hover:bg-muted/70 transition-colors duration-300 hover:shadow-sm">
                        <h4 className="font-medium mb-2">Error Handling</h4>
                        <p className="text-sm text-muted-foreground">Robust error handling for uninterrupted service</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg hover:bg-muted/70 transition-colors duration-300 hover:shadow-sm">
                        <h4 className="font-medium mb-2">Data Processing</h4>
                        <p className="text-sm text-muted-foreground">Efficient data processing for quick responses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="ai" className="space-y-4 animate-fade-in">
                <Card className="border-border/50 hover:border-primary/50 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-primary" />
                      <CardTitle>LangChain & LangGraph</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">
                      The AI processing is powered by LangChain and LangGraph, providing intelligent responses based on
                      the conversation context and relevant information.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-muted p-4 rounded-lg hover:bg-muted/70 transition-colors duration-300 hover:shadow-sm">
                        <h4 className="font-medium mb-2">Context Awareness</h4>
                        <p className="text-sm text-muted-foreground">
                          Maintains conversation context for natural interactions
                        </p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg hover:bg-muted/70 transition-colors duration-300 hover:shadow-sm">
                        <h4 className="font-medium mb-2">Knowledge Base</h4>
                        <p className="text-sm text-muted-foreground">Comprehensive information for accurate answers</p>
                      </div>
                      <div className="bg-muted p-4 rounded-lg hover:bg-muted/70 transition-colors duration-300 hover:shadow-sm">
                        <h4 className="font-medium mb-2">Response Generation</h4>
                        <p className="text-sm text-muted-foreground">Advanced AI models for human-like responses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/90 to-primary/70 text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Ready to Experience Our AI Assistant?
            </h2>
            <p className="text-primary-foreground/90 text-lg mb-8">
              Try our interactive chat widget now and discover how it can enhance your digital experience.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="group transition-all duration-300 transform hover:scale-105"
              onClick={() => handleOpenChat()}
            >
              Open Chat Widget
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Chat Widget */}
      <ChatWidget />
    </main>
  )
}

// Send icon component
function Send(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}

