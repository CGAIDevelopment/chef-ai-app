"use client"

import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        className: "font-medium text-base rounded-lg shadow-lg",
        style: {
          background: "white",
          color: "#374151",
        }
      }}
    />
  )
}

