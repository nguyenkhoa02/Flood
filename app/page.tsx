import { ForecastForm } from "@/components/forecast-form"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <ForecastForm />
      </div>
    </main>
  )
}
