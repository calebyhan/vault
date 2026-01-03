import * as React from "react"
import { Calendar } from "./calendar"
import { cn } from "@/lib/utils"

export interface DatePickerProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value || "")
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setInputValue(value || "")
  }, [value])

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(newValue)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const formatted = date.toISOString().split('T')[0]
      setInputValue(formatted)
      onChange?.(formatted)
      setIsOpen(false)
    }
  }

  const selectedDate = inputValue ? new Date(inputValue) : undefined

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={placeholder || "YYYY-MM-DD"}
        className={cn(
          "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
      />
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 rounded-md border bg-popover text-popover-foreground shadow-md">
          <Calendar
            selected={selectedDate}
            onSelect={handleDateSelect}
          />
        </div>
      )}
    </div>
  )
}
