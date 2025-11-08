"use client"

import PasswordGenerator from "@/components/password-generator"

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 p-4">
      <PasswordGenerator />
    </main>
  )
}
