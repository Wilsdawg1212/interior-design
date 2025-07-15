'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Eye, EyeOff } from 'lucide-react'

export default function FurniturePanel({ 
  furnitureItems, 
  selectedFurniture, 
  onSelect, 
  onRemove 
}) {
  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">
        Furniture Items
      </h2>
      
      {furnitureItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 mx-auto bg-neutral-100 rounded-lg flex items-center justify-center mb-3">
            <EyeOff className="w-6 h-6 text-neutral-400" />
          </div>
          <p className="text-neutral-500 text-sm">
            No furniture uploaded yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {furnitureItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={`
                  relative p-3 rounded-lg border transition-all duration-200 cursor-pointer group
                  ${selectedFurniture === item.id 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                  }
                `}
                onClick={() => onSelect(item.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover border border-neutral-200"
                    />
                    {selectedFurniture === item.id && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Scale: {item.scale.toFixed(1)}x • Rot: {item.rotation}°
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemove(item.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 hover:text-red-600 rounded transition-all duration-200"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Position indicator */}
                <div className="mt-2 text-xs text-neutral-400">
                  Position: ({Math.round(item.position.x)}, {Math.round(item.position.y)})
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {furnitureItems.length > 0 && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <div className="flex items-center justify-between text-sm text-neutral-600">
            <span>Total: {furnitureItems.length}</span>
            <span className="text-xs">
              Click to select
            </span>
          </div>
        </div>
      )}
    </div>
  )
} 