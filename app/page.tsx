'use client'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type FormData = {
  name: string
  email: string
  phone: string
  documents: FileList | null
  images: FileList | null
}

export default function Home() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [docPreview, setDocPreview] = useState<File[]>([])
  const [imgPreview, setImgPreview] = useState<File[]>([])

  const documents = watch('documents')
  const images = watch('images')

  // Update previews whenever files change
  useEffect(() => {
    if (documents && documents.length > 0) {
      setDocPreview(Array.from(documents))
    } else {
      setDocPreview([])
    }
  }, [documents])

  useEffect(() => {
    if (images && images.length > 0) {
      setImgPreview(Array.from(images))
    } else {
      setImgPreview([])
    }
  }, [images])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('email', data.email)
    formData.append('phone', data.phone)
    
    if (data.documents) {
      Array.from(data.documents).forEach(file => {
        formData.append('documents', file)
      })
    }
    
    if (data.images) {
      Array.from(data.images).forEach(file => {
        formData.append('images', file)
      })
    }

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        setSubmitSuccess(true)
        setDocPreview([])
        setImgPreview([])
      }
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden md:max-w-2xl"
      >
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">User Details Form</h1>
            <Link 
              href="/admin" 
              className="text-sm font-medium text-indigo-100 hover:text-white transition-colors flex items-center gap-1"
            >
              Admin Dashboard <span className="text-lg">→</span>
            </Link>
          </div>
        </div>

        <div className="p-8">
          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg mb-6"
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">Form submitted successfully!</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-gray-400"
                  placeholder="John Doe"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name.message}
                </p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-gray-400"
                  placeholder="john@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email.message}
                </p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  {...register('phone', { required: 'Phone is required' })}
                  className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-gray-400"
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.phone.message}
                </p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Documents (PDF, DOCX)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                        <span>Upload files</span>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx"
                          {...register('documents')}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                    {docPreview.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500">
                          Selected: {docPreview.length} document{docPreview.length !== 1 ? 's' : ''}
                        </p>
                        <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
                          {docPreview.map((file, index) => (
                            <div key={index} className="flex items-center text-xs text-gray-600">
                              <svg className="h-3 w-3 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                              <span className="truncate">{file.name}</span>
                              <span className="ml-1 text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Images (JPG, PNG)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                        <span>Upload images</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          {...register('images')}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
                    {imgPreview.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500">
                          Selected: {imgPreview.length} image{imgPreview.length !== 1 ? 's' : ''}
                        </p>
                        <div className="mt-1 space-y-1 max-h-20 overflow-y-auto">
                          {imgPreview.map((file, index) => (
                            <div key={index} className="flex items-center text-xs text-gray-600">
                              <svg className="h-3 w-3 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                              <span className="truncate">{file.name}</span>
                              <span className="ml-1 text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 grid grid-cols-3 gap-1">
                          {imgPreview.slice(0, 3).map((file, index) => (
                            <div key={index} className="aspect-square bg-gray-100 rounded overflow-hidden">
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Submit'}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
