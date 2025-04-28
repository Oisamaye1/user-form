import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  // Set SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
  })

  const stream = new ReadableStream({
    async start(controller) {
      // Send existing submissions first
      const submissions = await prisma.submission.findMany({
        orderBy: { createdAt: 'desc' }
      })
      
      // Watch for new submissions
      prisma.$use(async (params, next) => {
        const result = await next(params)
        if (params.model === 'Submission' && params.action === 'create') {
          const encoder = new TextEncoder()
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify(result)}\n\n`
          ))
        }
        return result
      })
    },
    cancel() {
      prisma.$disconnect()
    }
  })

  return new NextResponse(stream, { headers })
}
