"use client"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"

function ToastButton({ label, message }: { label: string; message: string }) {
  return (
    <Button variant="outline" onClick={() => toast(message)}>
      {label}
    </Button>
  )
}

export { ToastButton }
