'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, X } from 'lucide-react'

export default function UploadZone({ 
  onUpload, 
  accept = "image/*", 
  multiple = false, 
  maxFiles = 10,
  placeholder = "Drop files here or click to upload",
  icon = <Upload className="w-6 h-6" />
}) {
  const onDrop = useCallback((acceptedFiles) => {
    if (multiple) {
      onUpload(acceptedFiles)
    } else {
      onUpload(acceptedFiles[0])
    }
  }, [onUpload, multiple])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    multiple,
    maxFiles
  })

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-primary-500 bg-primary-50' 
            : isDragReject 
              ? 'border-red-500 bg-red-50' 
              : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-3">
          <div className={`
            p-3 rounded-full
            ${isDragActive 
              ? 'bg-primary-100 text-primary-600' 
              : isDragReject 
                ? 'bg-red-100 text-red-600' 
                : 'bg-neutral-100 text-neutral-600'
            }
          `}>
            {icon}
          </div>
          
          <div className="space-y-1">
            <p className={`
              text-sm font-medium
              ${isDragActive 
                ? 'text-primary-700' 
                : isDragReject 
                  ? 'text-red-700' 
                  : 'text-neutral-700'
              }
            `}>
              {isDragActive 
                ? 'Drop files here' 
                : isDragReject 
                  ? 'Invalid file type' 
                  : placeholder
              }
            </p>
            
            {!isDragActive && !isDragReject && (
              <p className="text-xs text-neutral-500">
                {multiple ? 'Multiple files allowed' : 'Single file only'}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
} 