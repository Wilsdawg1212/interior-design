'use client'

import { useCallback, useRef } from 'react'
import { DndContext, useDraggable } from '@dnd-kit/core'
import { motion } from 'framer-motion'
import { Move } from 'lucide-react'

function DraggableFurniture({ item, onFurnitureUpdate, onFurnitureSelect }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
  })

  const style = {
    position: 'absolute',
    left: transform ? item.position.x + transform.x : item.position.x,
    top: transform ? item.position.y + transform.y : item.position.y,
    zIndex: isDragging ? 10 : 1,
    transform: `scale(${item.scale}) rotate(${item.rotation}deg)`
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`cursor-move ${item.isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
      onClick={() => onFurnitureSelect(item.id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...listeners}
      {...attributes}
    >
      <img
        src={item.image}
        alt={item.name}
        className="max-w-none pointer-events-none"
        style={{
          width: '100px',
          height: '100px',
          objectFit: 'contain'
        }}
      />
    </motion.div>
  )
}

export default function RoomCanvas({ 
  roomImage, 
  furnitureItems, 
  onFurnitureUpdate, 
  onFurnitureSelect, 
  selectedFurniture 
}) {
  const canvasRef = useRef(null)

  // Handle drag end to update position
  const handleDragEnd = useCallback((event) => {
    const { active, delta } = event
    const item = furnitureItems.find(f => f.id === active.id)
    if (!item) return
    const newPosition = {
      x: item.position.x + delta.x,
      y: item.position.y + delta.y
    }
    onFurnitureUpdate(item.id, newPosition)
  }, [furnitureItems, onFurnitureUpdate])

  return (
    <div className="card p-0 overflow-hidden">
      <div className="p-4 border-b border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900">
          Design Canvas
        </h2>
        <p className="text-sm text-neutral-600">
          Drag furniture to position, use controls to adjust
        </p>
      </div>
      <DndContext onDragEnd={handleDragEnd}>
        <div 
          ref={canvasRef}
          className="relative w-full h-96 bg-neutral-100 overflow-hidden"
          style={{
            backgroundImage: roomImage ? `url(${roomImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {!roomImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-neutral-200 rounded-lg flex items-center justify-center">
                  <Move className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-500 font-medium">Upload a room image to get started</p>
              </div>
            </div>
          )}
          {furnitureItems.map((item) => (
            <DraggableFurniture
              key={item.id}
              item={item}
              onFurnitureUpdate={onFurnitureUpdate}
              onFurnitureSelect={onFurnitureSelect}
            />
          ))}
        </div>
      </DndContext>
      {furnitureItems.length > 0 && (
        <div className="p-4 bg-neutral-50 border-t border-neutral-200">
          <div className="flex items-center justify-between text-sm text-neutral-600">
            <span>{furnitureItems.length} furniture item{furnitureItems.length !== 1 ? 's' : ''}</span>
            <span>Click to select, drag to move</span>
          </div>
        </div>
      )}
    </div>
  )
} 