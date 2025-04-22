import { ChatWidget } from "@/components/chat-widget/chat-widget"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-24">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to Manipal Technologies Limited</h1>
        <p className="text-lg mb-8">
          Explore our services and solutions. Our chatbot assistant is here to help you with any questions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-3">Our Services</h2>
            <p>Discover our comprehensive range of services designed to meet your business needs.</p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-3">Our Solutions</h2>
            <p>Explore our innovative solutions tailored for various industries and requirements.</p>
          </div>
        </div>

        <p className="text-muted-foreground">
          Have questions? Use the chat widget in the bottom right corner to get assistance.
        </p>
      </div>

      {/* Chat Widget */}
      <ChatWidget />
    </main>
  )
}

