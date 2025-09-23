"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Context for MultiSelect
interface MultiSelectContextType {
  value: string[]
  onValueChange: (value: string[]) => void
}

const MultiSelectContext = React.createContext<MultiSelectContextType>({
  value: [],
  onValueChange: () => {},
})

// Define the MultiSelect component
interface MultiSelectProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof multiSelectTriggerVariants> {
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  children: React.ReactNode
}

const multiSelectTriggerVariants = cva(
  "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ className, variant, value, onValueChange, placeholder, children, ...props }, ref) => {
    const [open, setOpen] = React.useState(false)
    const triggerRef = React.useRef<HTMLButtonElement>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Close when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setOpen(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Handle key events
    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    return (
      <div ref={containerRef} className="relative w-full">
        <button
          ref={ref}
          className={cn(multiSelectTriggerVariants({ variant, className }))}
          onClick={() => setOpen(!open)}
          onKeyDown={handleKeyDown}
          {...props}
        >
          <div className="flex flex-wrap gap-1">
            {value.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {value.length > 0 && (
              <>
                {value.slice(0, 3).map((val) => (
                  <Badge key={val} variant="secondary" className="flex items-center gap-1 pr-1">
                    <span className="truncate max-w-[100px]">
                      {React.Children.toArray(children).find(
                        (child) => React.isValidElement(child) && child.props.value === val
                      )?.props?.children || val}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onValueChange(value.filter((v) => v !== val))
                      }}
                      className="rounded-full hover:bg-background p-0.5"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {value.length > 3 && (
                  <Badge variant="secondary">+{value.length - 3}</Badge>
                )}
              </>
            )}
          </div>
          <ChevronDownIcon className={cn("h-4 w-4 shrink-0 opacity-50 transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <div className="absolute top-full z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
            <div className="max-h-60 overflow-auto p-1">
              {children}
            </div>
          </div>
        )}
      </div>
    )
  }
)
MultiSelect.displayName = "MultiSelect"

// MultiSelect Item Component
interface MultiSelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  children: React.ReactNode
  disabled?: boolean
}

const MultiSelectItem = React.forwardRef<HTMLButtonElement, MultiSelectItemProps>(
  ({ className, value, children, disabled, ...props }, ref) => {
    const context = React.useContext(MultiSelectContext)
    const isSelected = context.value.includes(value)

    const handleClick = () => {
      if (disabled) return
      if (isSelected) {
        context.onValueChange(context.value.filter((v) => v !== value))
      } else {
        context.onValueChange([...context.value, value])
      }
    }

    return (
      <button
        ref={ref}
        className={cn(
          "focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-hidden data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          isSelected && "bg-accent text-accent-foreground",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        onClick={handleClick}
        disabled={disabled}
        {...props}
      >
        {isSelected && (
          <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <CheckIcon className="h-4 w-4" />
          </span>
        )}
        {children}
      </button>
    )
  }
)
MultiSelectItem.displayName = "MultiSelectItem"

// Export the components with context
export {
  MultiSelect,
  MultiSelectItem,
  MultiSelectContext,
  type MultiSelectProps,
  type MultiSelectItemProps,
}