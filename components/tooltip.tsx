"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Info } from "lucide-react"

interface TooltipProps {
  content: string
  children?: React.ReactNode
}

export function Tooltip({ content, children }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()

      const top = triggerRect.top + window.scrollY
      let left = triggerRect.right + 12

      // Adjust if goes off right edge
      if (left + tooltipRect.width > window.innerWidth - 10) {
        left = triggerRect.left - tooltipRect.width - 12
      }

      // Clamp left position to viewport
      if (left < 10) {
        left = 10
      }

      setPosition({ top, left })
    }
  }, [visible])

  return (
    <div className="relative inline-flex items-center">
      <button
        ref={triggerRef}
        onClick={() => setVisible(!visible)}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onTouchStart={() => setVisible(true)}
        className="inline-flex items-center justify-center h-4 w-4 ml-1 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
        aria-label="Más información"
        type="button"
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      {visible && (
        <div
          ref={tooltipRef}
          className="fixed bg-foreground/90 text-background text-xs rounded-lg px-3 py-2 max-w-xs shadow-lg z-50 pointer-events-none whitespace-normal"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          role="tooltip"
        >
          {children || content}
        </div>
      )}
    </div>
  )
}
