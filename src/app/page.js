'use client'

import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Image, Move, RotateCcw, Download, Sparkles, Settings, Camera } from 'lucide-react'
import RoomCanvas from './components/RoomCanvas'
import UploadZone from './components/UploadZone'
import FurniturePanel from './components/FurniturePanel'
import Toolbar from './components/Toolbar'
import GeneratedImage from './components/GeneratedImage'

export default function Home() {
  const [roomImage, setRoomImage] = useState(null)
  const [furnitureItems, setFurnitureItems] = useState([])
  const [selectedFurniture, setSelectedFurniture] = useState(null)
  const [isAIPlacement, setIsAIPlacement] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const generatedImageRef = useRef(null)

  const handleRoomUpload = useCallback((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setRoomImage(e.target.result)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleFurnitureUpload = useCallback((files) => {
    const newFurniture = Array.from(files).map((file, index) => {
      const reader = new FileReader()
      return new Promise((resolve) => {
        reader.onload = (e) => {
          resolve({
            id: `furniture-${Date.now()}-${index}`,
            image: e.target.result,
            name: file.name,
            position: { x: 100 + index * 50, y: 100 + index * 50 },
            scale: 1,
            rotation: 0,
            isSelected: false
          })
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(newFurniture).then((items) => {
      setFurnitureItems(prev => [...prev, ...items])
    })
  }, [])

  const updateFurniturePosition = useCallback((id, position) => {
    setFurnitureItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, position } : item
      )
    )
  }, [])

  const updateFurnitureScale = useCallback((scale) => {
    if (!selectedFurniture) return
    setFurnitureItems(prev => 
      prev.map(item => 
        item.id === selectedFurniture ? { ...item, scale } : item
      )
    )
  }, [selectedFurniture])

  const updateFurnitureRotation = useCallback((rotation) => {
    if (!selectedFurniture) return
    setFurnitureItems(prev => 
      prev.map(item => 
        item.id === selectedFurniture ? { ...item, rotation } : item
      )
    )
  }, [selectedFurniture])

  const selectFurniture = useCallback((id) => {
    setFurnitureItems(prev => 
      prev.map(item => ({
        ...item,
        isSelected: item.id === id
      }))
    )
    setSelectedFurniture(id)
  }, [])

  const removeFurniture = useCallback((id) => {
    setFurnitureItems(prev => prev.filter(item => item.id !== id))
    if (selectedFurniture === id) {
      setSelectedFurniture(null)
    }
  }, [selectedFurniture])

  const handleAIPlacement = useCallback(() => {
    if (furnitureItems.length === 0) return
    
    // Simulate AI placement - in a real app, this would call an AI service
    const newPositions = furnitureItems.map((item, index) => ({
      ...item,
      position: {
        x: 200 + (index * 150) % 400,
        y: 150 + Math.floor(index / 3) * 120
      },
      scale: 0.8 + Math.random() * 0.4,
      rotation: Math.random() * 360
    }))
    
    setFurnitureItems(newPositions)
  }, [furnitureItems])

  const handleGenerateRealisticPicture = useCallback(async () => {
    if (!roomImage || furnitureItems.length === 0) {
      alert('Please upload a room image and add some furniture first!')
      return
    }

    setIsGenerating(true)
    
    // Simulate AI generation process
    setTimeout(() => {
      setIsGenerating(false)
      // For demo purposes, use a placeholder image
      setGeneratedImage('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&crop=center')
      
      // Scroll to the generated image
      setTimeout(() => {
        generatedImageRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        })
      }, 100)
    }, 3000)
  }, [roomImage, furnitureItems])

  const handleRegenerate = useCallback(() => {
    handleGenerateRealisticPicture()
  }, [handleGenerateRealisticPicture])

  const handleDownload = useCallback(() => {
    if (generatedImage) {
      const link = document.createElement('a')
      link.href = generatedImage
      link.download = 'interior-design-generated.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [generatedImage])

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <Image className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-display font-semibold text-neutral-900">
                Interior Design Studio
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="btn-secondary flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button className="btn-primary flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Upload Zones */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">
                Upload Assets
              </h2>
              
              {/* Room Upload */}
              <div className="card">
                <h3 className="font-medium text-neutral-700 mb-3 flex items-center">
                  <Image className="w-4 h-4 mr-2" />
                  Room Background
                </h3>
                <UploadZone
                  onUpload={handleRoomUpload}
                  accept="image/*"
                  maxFiles={1}
                  placeholder="Upload room image"
                  icon={<Image className="w-6 h-6" />}
                />
              </div>

              {/* Furniture Upload */}
              <div className="card">
                <h3 className="font-medium text-neutral-700 mb-3 flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Furniture Items
                </h3>
                <UploadZone
                  onUpload={handleFurnitureUpload}
                  accept="image/*"
                  multiple
                  placeholder="Upload furniture images"
                  icon={<Upload className="w-6 h-6" />}
                />
              </div>

              {/* AI Placement */}
              <div className="card">
                <h3 className="font-medium text-neutral-700 mb-3 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Placement
                </h3>
                <button
                  onClick={handleAIPlacement}
                  disabled={furnitureItems.length === 0}
                  className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Auto-Place Furniture</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Main Canvas Area */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <RoomCanvas
                roomImage={roomImage}
                furnitureItems={furnitureItems}
                onFurnitureUpdate={updateFurniturePosition}
                onFurnitureSelect={selectFurniture}
                selectedFurniture={selectedFurniture}
              />
              
              {/* Generate Realistic Picture Button */}
              <div className="mt-6 flex justify-center">
                <motion.button
                  onClick={handleGenerateRealisticPicture}
                  disabled={!roomImage || furnitureItems.length === 0 || isGenerating}
                  className={`
                    relative group px-6 py-3 rounded-xl font-semibold text-base shadow-lg transition-all duration-300
                    bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white
                    hover:shadow-xl hover:scale-105 active:scale-95
                    ${isGenerating ? 'opacity-75 cursor-not-allowed' : ''}
                    ${!roomImage || furnitureItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  whileHover={!isGenerating && roomImage && furnitureItems.length > 0 ? { scale: 1.05 } : {}}
                  whileTap={!isGenerating && roomImage && furnitureItems.length > 0 ? { scale: 0.95 } : {}}
                >
                  <div className="flex items-center space-x-2">
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4" />
                        <span>Generate Realistic Picture</span>
                      </>
                    )}
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar - Furniture Panel & Tools */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Toolbar */}
              <Toolbar
                selectedFurniture={selectedFurniture}
                furnitureItems={furnitureItems}
                onScaleChange={updateFurnitureScale}
                onRotationChange={updateFurnitureRotation}
                onRemove={() => selectedFurniture && removeFurniture(selectedFurniture)}
              />

              {/* Furniture Panel */}
              <FurniturePanel
                furnitureItems={furnitureItems}
                selectedFurniture={selectedFurniture}
                onSelect={selectFurniture}
                onRemove={removeFurniture}
              />
            </motion.div>
          </div>
        </div>

        {/* Generated Image Section */}
        <div ref={generatedImageRef} className="mt-16">
          <GeneratedImage
            generatedImage={generatedImage}
            isGenerating={isGenerating}
            onRegenerate={handleRegenerate}
            onDownload={handleDownload}
          />
        </div>
      </div>
    </div>
  )
}
