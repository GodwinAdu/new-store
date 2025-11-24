"use client"

import { Button } from "@/components/ui/button"
import { seedBaseUnits } from "@/lib/actions/unit.actions"
import { Database } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export function SeedBaseUnitsButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSeedBaseUnits = async () => {
    try {
      setIsLoading(true)
      const result = await seedBaseUnits()
      toast.success("Base units created successfully", {
        description: `Created ${result.count || 0} base units`
      })
      router.refresh()
    } catch (error: any) {
      toast.error("Failed to create base units", {
        description: error.message || "Please try again"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleSeedBaseUnits}
      disabled={isLoading}
      className="h-7 gap-1"
    >
      <Database className="h-3.5 w-3.5" />
      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
        {isLoading ? "Creating..." : "Seed Base Units"}
      </span>
    </Button>
  )
}