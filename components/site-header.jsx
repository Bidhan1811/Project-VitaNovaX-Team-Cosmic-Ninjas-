"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors",
        scrolled
          ? "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-extrabold tracking-tight text-lg">
          <span className="text-primary">Vita</span>NovaX
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm hover:text-primary transition-colors animated-underline">
            Home
          </Link>
          <Link href="/dashboard" className="text-sm hover:text-primary transition-colors animated-underline">
            Dashboard
          </Link>
          <a href="#features" className="text-sm hover:text-primary transition-colors animated-underline">
            Features
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 cta-glow">Open Dashboard</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
