'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  RotateCw, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  Move,
  Settings
} from 'lucide-react'

export default function Toolbar({ 
  selectedFurniture, 
  furnitureItems,
  onScaleChange, 
  onRotationChange, 
  onRemove 
}) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)

  // Sync with selected furniture values
  useEffect(() => {
    if (selectedFurniture) {
      const item = furnitureItems.find(f => f.id === selectedFurniture)
      if (item) {
        setScale(item.scale)
        setRotation(item.rotation)
      }
    } else {
      setScale(1)
      setRotation(0)
    }
  }, [selectedFurniture, furnitureItems])

  const handleScaleChange = (newScale) => {
    setScale(newScale)
    onScaleChange(newScale)
  }

  const handleRotationChange = (newRotation) => {
    setRotation(newRotation)
    onRotationChange(newRotation)
  }

  if (!selectedFurniture) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">
          Tools
        </h2>
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto bg-neutral-100 rounded-lg flex items-center justify-center mb-3">
            <Settings className="w-6 h-6 text-neutral-400" />
          </div>
          <p className="text-neutral-500 text-sm">
            Select a furniture item to edit
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">
        Edit Tools
      </h2>
      
      <div className="space-y-4">
        {/* Scale Controls */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Scale
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleScaleChange(Math.max(0.1, scale - 0.1))}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Scale down"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            
            <div className="flex-1">
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            <button
              onClick={() => handleScaleChange(Math.min(3, scale + 0.1))}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Scale up"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-neutral-500 mt-1 text-center">
            {scale.toFixed(1)}x
          </div>
        </div>

        {/* Rotation Controls */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Rotation
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleRotationChange(rotation - 15)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Rotate left"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="360"
                step="15"
                value={rotation}
                onChange={(e) => handleRotationChange(parseInt(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            <button
              onClick={() => handleRotationChange(rotation + 15)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              title="Rotate right"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-neutral-500 mt-1 text-center">
            {rotation}°
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Quick Actions
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                handleScaleChange(1)
                handleRotationChange(0)
              }}
              className="btn-secondary text-xs py-2 flex items-center justify-center space-x-1"
            >
              <Move className="w-3 h-3" />
              <span>Reset</span>
            </button>
            
            <button
              onClick={onRemove}
              className="bg-red-50 hover:bg-red-100 text-red-700 font-medium text-xs py-2 px-3 rounded-lg border border-red-200 transition-colors duration-200 flex items-center justify-center space-x-1"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 