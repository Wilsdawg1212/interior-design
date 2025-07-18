'use client'

import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Image, Move, RotateCcw, Download, Sparkles, Settings, Camera, Eraser, Square, X } from 'lucide-react'
import RoomCanvas from './components/RoomCanvas'
import UploadZone from './components/UploadZone'
import FurniturePanel from './components/FurniturePanel'
import Toolbar from './components/Toolbar'
import GeneratedImage from './components/GeneratedImage'
import { compositeRoomWithFurniture } from './components/canvasUtils'
import EraseCanvas from './components/EraseCanvas'

export default function Home() {
  const [roomImage, setRoomImage] = useState(null)
  const [furnitureItems, setFurnitureItems] = useState([])
  const [selectedFurniture, setSelectedFurniture] = useState(null)
  const [isAIPlacement, setIsAIPlacement] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const generatedImageRef = useRef(null)
  const [prompt, setPrompt] = useState('');
  const [roomImageWidth, setRoomImageWidth] = useState(null);
  const [roomImageHeight, setRoomImageHeight] = useState(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 384 });
  const [canvasMode, setCanvasMode] = useState('design') // 'design' or 'erase'

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 384;

  // Calculate display dimensions for the canvas that fit nicely in the UI
  const getDisplayDimensions = useCallback((originalWidth, originalHeight) => {
    if (!originalWidth || !originalHeight) return { width: 800, height: 384 };
    
    const MAX_DISPLAY_WIDTH = 700; // Reduced to match the 2-column canvas container
    const MAX_DISPLAY_HEIGHT = 600; // Keep reasonable height
    
    const aspectRatio = originalWidth / originalHeight;
    
    let displayWidth, displayHeight;
    
    if (aspectRatio > 1) {
      // Landscape - fit to width
      displayWidth = Math.min(originalWidth, MAX_DISPLAY_WIDTH);
      displayHeight = Math.round(displayWidth / aspectRatio);
    } else {
      // Portrait - fit to height
      displayHeight = Math.min(originalHeight, MAX_DISPLAY_HEIGHT);
      displayWidth = Math.round(displayHeight * aspectRatio);
    }
    
    // Ensure minimum display size
    displayWidth = Math.max(displayWidth, 400);
    displayHeight = Math.max(displayHeight, 300);
    
    return { width: displayWidth, height: displayHeight };
  }, []);

  const handleRoomUpload = useCallback((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setRoomImage(e.target.result)
      // Get natural size
      const img = new window.Image();
      img.onload = () => {
        setRoomImageWidth(img.naturalWidth);
        setRoomImageHeight(img.naturalHeight);
      };
      img.src = e.target.result;
    }
    reader.readAsDataURL(file)
  }, [])

  const handleFurnitureUpload = useCallback((files) => {
    const newFurniture = Array.from(files).map((file, index) => {
      const reader = new FileReader();
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
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newFurniture).then((items) => {
      setFurnitureItems(prev => [...prev, ...items]);
    });
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

  const removeBackground = useCallback(async (furnitureItemsToProcess = furnitureItems) => {
    if (furnitureItemsToProcess.length === 0) {
      alert('No furniture items to process');
      return;
    }

    setIsRemovingBg(true);
    try {
      const updatedItems = await Promise.all(
        furnitureItemsToProcess.map(async (item) => {
          // Convert data URL back to file for API
          const response = await fetch(item.image);
          const blob = await response.blob();
          const file = new File([blob], item.name, { type: 'image/png' });

          // Send to /remove_bg/ endpoint
          const formData = new FormData();
          formData.append('image', file);
          const bgResponse = await fetch('http://localhost:8000/remove_bg/', {
            method: 'POST',
            body: formData
          });

          if (!bgResponse.ok) {
            console.warn(`Failed to remove background for ${item.name}, keeping original`);
            return item; // Keep original if background removal fails
          }

          const bgBlob = await bgResponse.blob();
          // Convert blob to data URL
          const dataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(bgBlob);
          });

          return {
            ...item,
            image: dataUrl
          };
        })
      );

      setFurnitureItems(prev => 
        prev.map(item => {
          const updatedItem = updatedItems.find(updated => updated.id === item.id);
          return updatedItem || item;
        })
      );
    } catch (error) {
      console.error('Error removing backgrounds:', error);
      alert('Error removing backgrounds: ' + error.message);
    } finally {
      setIsRemovingBg(false);
    }
  }, [furnitureItems]);

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
    if (!roomImage || furnitureItems.length === 0 || !roomImageWidth || !roomImageHeight) {
      alert('Please upload a room image and add some furniture first!')
      return
    }

    setIsGenerating(true)

    try {
      // Prepare form data
      const formData = new FormData();
      
      // Calculate canvas dimensions that preserve the photo's aspect ratio
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 600;
      
      let canvasWidth, canvasHeight;
      const aspectRatio = roomImageWidth / roomImageHeight;
      
      if (aspectRatio > 1) {
        // Landscape image - fit to width
        canvasWidth = Math.min(roomImageWidth, MAX_WIDTH);
        canvasHeight = Math.round(canvasWidth / aspectRatio);
      } else {
        // Portrait image - fit to height
        canvasHeight = Math.min(roomImageHeight, MAX_HEIGHT);
        canvasWidth = Math.round(canvasHeight * aspectRatio);
      }
      
      // Ensure minimum dimensions
      canvasWidth = Math.max(canvasWidth, 256);
      canvasHeight = Math.max(canvasHeight, 256);
      
      // Store canvas dimensions for the GeneratedImage component
      setCanvasDimensions({ width: canvasWidth, height: canvasHeight });
      
      // Get display dimensions
      const displayDims = getDisplayDimensions(roomImageWidth, roomImageHeight);

      // Calculate scaling factors from display coordinates to generation canvas coordinates
      const scaleX = canvasWidth / displayDims.width;
      const scaleY = canvasHeight / displayDims.height;

      // Scale furniture coordinates from display coordinates to generation canvas coordinates
      const scaledFurniture = furnitureItems.map(item => {
        // Convert display coordinates to generation canvas coordinates
        const canvasX = Math.round(item.position.x * scaleX);
        const canvasY = Math.round(item.position.y * scaleY);
        
        return {
          ...item,
          position: {
            x: canvasX,
            y: canvasY
          }
        };
      });
      
      // Composite room and furniture into one image using calculated dimensions
      const compositeBlob = await compositeRoomWithFurniture(roomImage, scaledFurniture, canvasWidth, canvasHeight);
      formData.append('image', compositeBlob, 'room.png');
      // Only append prompt if it has content, otherwise let backend use default
      if (prompt && prompt.trim() !== '') {
        formData.append('prompt', prompt);
      }
      formData.append('furniture', JSON.stringify(
        scaledFurniture.map(item => ({
          x: item.position.x,
          y: item.position.y,
          width: Math.round(100 * item.scale * scaleX), // assuming 100px base width
          height: Math.round(100 * item.scale * scaleY) // assuming 100px base height
        }))
      ));
      formData.append('width', canvasWidth);
      formData.append('height', canvasHeight);

      // Call backend
      const response = await fetch('http://localhost:8000/inpaint/', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to generate image');
      const blobResult = await response.blob();
      const url = URL.createObjectURL(blobResult);
      setGeneratedImage(url);
      setTimeout(() => {
        generatedImageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } catch (err) {
      alert('Error generating image: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  }, [roomImage, furnitureItems, prompt, roomImageWidth, roomImageHeight]);

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

  const handleEraseSelection = useCallback(async (selection) => {
    if (!roomImage) return
    
    try {
      // Get the display dimensions for the canvas
      const displayDims = getDisplayDimensions(roomImageWidth, roomImageHeight)
      
      // Convert room image to blob for FormData
      const imageResponse = await fetch(roomImage);
      const roomBlob = await imageResponse.blob();
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', roomBlob, 'room.png');
      formData.append('erasure_spots', JSON.stringify([{
        x: Math.round(selection.x),
        y: Math.round(selection.y),
        width: Math.round(selection.width),
        height: Math.round(selection.height)
      }]));
      formData.append('width', displayDims.width);
      formData.append('height', displayDims.height);
      
      // Call your backend erase endpoint
      const response = await fetch('http://localhost:8000/inpaint_erasure/', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to erase selection')
      }
      
      const result = await response.blob()
      const newRoomImageUrl = URL.createObjectURL(result)
      
      // Update the room image with the erased version
      setRoomImage(newRoomImageUrl)
      
      // Clear any furniture that might be in the erased area
      const erasedFurniture = furnitureItems.filter(item => {
        const itemRight = item.position.x + (100 * item.scale)
        const itemBottom = item.position.y + (100 * item.scale)
        const selectionRight = selection.x + selection.width
        const selectionBottom = selection.y + selection.height
        
        // Check if furniture overlaps with erased area
        return !(item.position.x < selectionRight && 
                itemRight > selection.x && 
                item.position.y < selectionBottom && 
                itemBottom > selection.y)
      })
      
      setFurnitureItems(erasedFurniture)
      
    } catch (error) {
      console.error('Error erasing selection:', error)
      alert('Error erasing selection: ' + error.message)
    }
  }, [roomImage, furnitureItems, roomImageWidth, roomImageHeight, getDisplayDimensions])

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

          {/* Main Canvas Area - Now Wider */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Mode toggle */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setCanvasMode('design')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    canvasMode === 'design' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  Design Mode
                </button>
                <button
                  onClick={() => setCanvasMode('erase')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    canvasMode === 'erase' 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  Erase Mode
                </button>
              </div>

              {canvasMode === 'erase' ? (
                <EraseCanvas
                  roomImage={roomImage}
                  furnitureItems={furnitureItems}
                  onEraseSelection={handleEraseSelection}
                  width={getDisplayDimensions(roomImageWidth, roomImageHeight).width}
                  height={getDisplayDimensions(roomImageWidth, roomImageHeight).height}
                />
              ) : (
                <RoomCanvas
                  roomImage={roomImage}
                  furnitureItems={furnitureItems}
                  onFurnitureUpdate={updateFurniturePosition}
                  onFurnitureSelect={selectFurniture}
                  selectedFurniture={selectedFurniture}
                  width={getDisplayDimensions(roomImageWidth, roomImageHeight).width}
                  height={getDisplayDimensions(roomImageWidth, roomImageHeight).height}
                />
              )}

              {/* Only show prompt and generate button in design mode */}
              {canvasMode === 'design' && (
                <>
                  {/* Prompt input */}
                  <input
                    type="text"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Describe your desired room..."
                    className="input-field mb-4 w-full mt-6"
                  />

                  {/* Generate Realistic Picture Button */}
                  <div className="mt-2 flex flex-col items-center space-y-2">
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
                    {/* Test Composite Canvas Button */}
                    <button
                      type="button"
                      className="btn-secondary mt-2 px-4 py-2 rounded-lg text-sm font-medium border border-neutral-300 bg-white hover:bg-neutral-100 transition"
                      disabled={!roomImage || furnitureItems.length === 0}
                      onClick={async () => {
                        try {
                          // Get display dimensions (same as what's shown in the canvas)
                          const displayDims = getDisplayDimensions(roomImageWidth, roomImageHeight);
                          
                          // Use display dimensions directly for the composite
                          const blob = await compositeRoomWithFurniture(roomImage, furnitureItems, displayDims.width, displayDims.height);
                          const url = URL.createObjectURL(blob);
                          window.open(url, '_blank');
                        } catch (err) {
                          alert('Failed to create composite image: ' + err.message);
                        }
                      }}
                    >
                      Test Composite Canvas
                    </button>
                  </div>
                </>
              )}
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
                onRemoveBackground={() => selectedFurniture && removeBackground([furnitureItems.find(item => item.id === selectedFurniture)])}
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
            width={canvasDimensions.width}
            height={canvasDimensions.height}
          />
        </div>
      </div>
    </div>
  )
}
