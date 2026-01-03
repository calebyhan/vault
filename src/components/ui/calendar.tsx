import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
}

export function Calendar({
  selected,
  onSelect,
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    selected ? new Date(selected.getFullYear(), selected.getMonth(), 1) : new Date()
  )

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay()

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onSelect?.(date)
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return (
      date.getDate() === selected.getDate() &&
      date.getMonth() === selected.getMonth() &&
      date.getFullYear() === selected.getFullYear()
    )
  }

  const isToday = (day: number) => {
    const today = new Date()
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  return (
    <div className={cn("p-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 p-0"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-medium">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button
          onClick={nextMonth}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 p-0"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-xs font-medium text-muted-foreground text-center p-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={cn(
                "h-9 w-9 p-0 font-normal text-sm rounded-md hover:bg-accent hover:text-accent-foreground",
                isSelected(day) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                isToday(day) && !isSelected(day) && "bg-accent text-accent-foreground"
              )}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
