import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const userId = formData.get('userId') as string | null
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG and WebP are allowed.' },
        { status: 400 }
      )
    }
    
    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds the 2MB limit' },
        { status: 400 }
      )
    }
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create unique filename using uuid and original extension
    const originalName = file.name
    const extension = path.extname(originalName)
    const filename = `${uuidv4()}${extension}`
    
    // Make sure the public/avatars directory exists
    const avatarsDir = path.join(process.cwd(), 'public', 'avatars')
    
    // Save file to public/avatars directory
    const filePath = path.join(avatarsDir, filename)
    await writeFile(filePath, buffer)
    
    // Return the relative path to be stored in the user object
    const avatarPath = `/avatars/${filename}`
    
    return NextResponse.json({ 
      success: true, 
      avatarPath
    })
    
  } catch (error) {
    console.error('Error handling file upload:', error)
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
} 