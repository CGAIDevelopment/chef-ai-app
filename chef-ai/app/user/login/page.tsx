"use client"

import React from "react"
import { Metadata } from "next"
import Link from "next/link"
import { UserAuthForms } from "@/components/UserAuthForms"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* Left side - Branding and testimonial */}
      <div className="relative w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between bg-gradient-to-br from-amber-100 via-orange-200 to-red-300 dark:from-amber-950 dark:via-orange-900 dark:to-red-950">
        <div className="relative z-10">
          <div className="mb-8 flex items-center space-x-2">
            <div className="rounded-full bg-amber-500 p-1.5 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12.378 1.602a.75.75 0 00-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03zM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 00.372-.648V7.93zM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 00.372.648l8.628 5.033z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-amber-900 dark:text-amber-200">Chef AI</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 dark:text-amber-200 mb-4">Your personal<br />cooking assistant</h1>
          <p className="text-lg md:text-xl text-amber-800 dark:text-amber-300 max-w-md">
            Discover recipes, plan meals, and cook with confidence
          </p>
        </div>
        
        <div className="mt-auto relative z-10">
          <div className="bg-white/20 dark:bg-black/20 backdrop-blur-md rounded-xl p-6 max-w-md">
            <div className="flex items-start mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-amber-500">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
              ))}
            </div>
            <p className="text-amber-900 dark:text-amber-200 italic mb-2">
              "Chef AI transformed how I cook. The personalized recipes based on my preferences and what's in my pantry have saved me so much time and reduced food waste."
            </p>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-amber-300 flex items-center justify-center text-amber-800 font-semibold">JD</div>
              <div className="ml-3">
                <p className="font-medium text-amber-900 dark:text-amber-200">Jamie Doe</p>
                <p className="text-sm text-amber-800 dark:text-amber-300">Home Cook</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-yellow-400"></div>
          <div className="absolute right-1/3 bottom-1/4 w-64 h-64 rounded-full bg-orange-400"></div>
          <div className="absolute left-1/4 top-1/3 w-72 h-72 rounded-full bg-red-400"></div>
        </div>
      </div>
      
      {/* Right side - Auth forms */}
      <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center justify-center bg-white dark:bg-gray-950">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to Chef AI</h2>
            <p className="text-gray-600 dark:text-gray-400">Sign in to continue your cooking journey</p>
          </div>
          
          <UserAuthForms />
          
          <div className="mt-8 text-center text-sm text-gray-500 space-y-1">
            <p>
              <Link href="/terms" className="text-amber-600 hover:text-amber-500">
                Terms of Service
              </Link>{" "}
              •{" "}
              <Link href="/privacy" className="text-amber-600 hover:text-amber-500">
                Privacy Policy
              </Link>
            </p>
            <p>© {new Date().getFullYear()} Chef AI. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
} 