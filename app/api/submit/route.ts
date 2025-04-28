import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { Readable } from 'stream'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

const auth = new google.auth.JWT(
  GOOGLE_CLIENT_EMAIL,
  undefined,
  GOOGLE_PRIVATE_KEY,
  ['https://www.googleapis.com/auth/drive']
)

const drive = google.drive({ version: 'v3', auth })

async function createFolder(parentId: string, folderName: string) {
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentId]
  }

  const response = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id,name,webViewLink'
  })

  return response.data
}

async function uploadFile(folderId: string, fileName: string, content: string | Buffer, mimeType: string) {
  const fileMetadata = {
    name: fileName,
    parents: [folderId]
  }

  const media = {
    mimeType: mimeType,
    body: Readable.from(content)
  }

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id,name,webViewLink'
  })

  return response.data
}

export async function POST(request: Request) {
  if (!DRIVE_FOLDER_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    return NextResponse.json(
      { error: 'Google Drive configuration missing' },
      { status: 500 }
    )
  }

  const formData = await request.formData()
  
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string
  const documents = formData.getAll('documents') as File[]
  const images = formData.getAll('images') as File[]

  try {
    // Create user folder in Google Drive
    const userFolder = await createFolder(DRIVE_FOLDER_ID, `${name} - ${new Date().toISOString().split('T')[0]}`)
    
    // Create form data text file
    const formDataContent = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nSubmitted at: ${new Date().toISOString()}`
    await uploadFile(
      userFolder.id!,
      'form-data.txt',
      formDataContent,
      'text/plain'
    )

    // Upload documents and collect links
    const docLinks = await Promise.all(
      documents.map(async (doc) => {
        if (doc.size > 0) {
          const result = await uploadFile(
            userFolder.id!,
            doc.name,
            Buffer.from(await doc.arrayBuffer()),
            doc.type
          )
          return result.webViewLink || ''
        }
        return ''
      })
    )

    // Upload images and collect links
    const imgLinks = await Promise.all(
      images.map(async (img) => {
        if (img.size > 0) {
          const result = await uploadFile(
            userFolder.id!,
            img.name,
            Buffer.from(await img.arrayBuffer()),
            img.type
          )
          return result.webViewLink || ''
        }
        return ''
      })
    )

    // Store submission in database
    const submission = await prisma.submission.create({
      data: {
        name,
        email,
        phone,
        documents: docLinks.filter(link => link),
        images: imgLinks.filter(link => link)
      }
    })

    return NextResponse.json({
      success: true,
      data: submission
    })
  } catch (error) {
    console.error('Submission processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
