'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Download, Share2, RefreshCw, Sparkles } from 'lucide-react'

export default function GeneratedImage({ 
  generatedImage, 
  isGenerating, 
  onRegenerate, 
  onDownload 
}) {
  if (!generatedImage && !isGenerating) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900">
                AI Generated Design
              </h2>
              <p className="text-sm text-neutral-600">
                Realistic visualization of your interior design
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onRegenerate}
              disabled={isGenerating}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>
            
            {generatedImage && (
              <button
                onClick={onDownload}
                className="btn-primary flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative h-96 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-xl flex items-center justify-center"
            >
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
                  <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-accent-500 rounded-full animate-spin mx-auto" style={{ animationDelay: '-0.5s' }} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-neutral-700">
                    Generating Your Design
                  </h3>
                  <p className="text-sm text-neutral-500">
                    AI is creating a realistic visualization...
                  </p>
                </div>
              </div>
            </motion.div>
          ) : generatedImage ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="relative group">
                <img
                  src={generatedImage}
                  alt="AI Generated Interior Design"
                  className="w-full h-auto rounded-xl shadow-lg border border-neutral-200"
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={onDownload}
                      className="bg-white/90 hover:bg-white text-neutral-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    <button className="bg-white/90 hover:bg-white text-neutral-900 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Image details */}
              <div className="bg-neutral-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-500">Resolution</p>
                    <p className="font-medium">2048 x 1536</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Style</p>
                    <p className="font-medium">Photorealistic</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Generated</p>
                    <p className="font-medium">{new Date().toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Quality</p>
                    <p className="font-medium">High</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  )
} 