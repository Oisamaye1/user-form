import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    // Disable caching for this endpoint
    const submissions = await prisma.submission.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    const response = NextResponse.json(submissions)
    // Set headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
