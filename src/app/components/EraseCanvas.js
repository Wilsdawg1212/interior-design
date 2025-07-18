'use client'

import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Eraser, Square, X } from 'lucide-react'

export default function EraseCanvas({ 
  roomImage, 
  furnitureItems, 
  onEraseSelection, 
  width, 
  height 
}) {
  const canvasRef = useRef(null)
  const [selection, setSelection] = useState(null)
  const [isSelecting, setIsSelecting] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState(null)
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  // Start selection
  const startSelection = useCallback((e) => {
    if (selection) return // Don't start new selection if one exists
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setStartPos({ x, y })
    setSelection({ x, y, width: 0, height: 0 })
    setIsSelecting(true)
  }, [selection])

  // Update selection while dragging
  const updateSelection = useCallback((e) => {
    if (!isSelecting) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setSelection({
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      width: Math.abs(x - startPos.x),
      height: Math.abs(y - startPos.y)
    })
  }, [isSelecting, startPos])

  // End selection
  const endSelection = useCallback(() => {
    setIsSelecting(false)
    // Keep selection if it has minimum size
    if (selection && selection.width < 10 && selection.height < 10) {
      setSelection(null)
    }
  }, [selection])

  // Start resizing
  const startResize = useCallback((e, handle) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeHandle(handle)
    setStartPos({ x: e.clientX, y: e.clientY })
  }, [])

  // Update resize
  const updateResize = useCallback((e) => {
    if (!isResizing || !selection) return
    
    const deltaX = e.clientX - startPos.x
    const deltaY = e.clientY - startPos.y
    
    let newSelection = { ...selection }
    
    switch (resizeHandle) {
      case 'nw':
        newSelection.x += deltaX
        newSelection.y += deltaY
        newSelection.width -= deltaX
        newSelection.height -= deltaY
        break
      case 'ne':
        newSelection.y += deltaY
        newSelection.width += deltaX
        newSelection.height -= deltaY
        break
      case 'sw':
        newSelection.x += deltaX
        newSelection.width -= deltaX
        newSelection.height += deltaY
        break
      case 'se':
        newSelection.width += deltaX
        newSelection.height += deltaY
        break
      case 'n':
        newSelection.y += deltaY
        newSelection.height -= deltaY
        break
      case 's':
        newSelection.height += deltaY
        break
      case 'w':
        newSelection.x += deltaX
        newSelection.width -= deltaX
        break
      case 'e':
        newSelection.width += deltaX
        break
    }
    
    // Ensure minimum size
    if (newSelection.width >= 10 && newSelection.height >= 10) {
      setSelection(newSelection)
      setStartPos({ x: e.clientX, y: e.clientY })
    }
  }, [isResizing, selection, resizeHandle, startPos])

  // End resize
  const endResize = useCallback(() => {
    setIsResizing(false)
    setResizeHandle(null)
  }, [])

  // Handle mouse events
  const handleMouseDown = useCallback((e) => {
    if (isResizing) return
    startSelection(e)
  }, [isResizing, startSelection])

  const handleMouseMove = useCallback((e) => {
    if (isResizing) {
      updateResize(e)
    } else if (isSelecting) {
      updateSelection(e)
    }
  }, [isResizing, isSelecting, updateResize, updateSelection])

  const handleMouseUp = useCallback(() => {
    if (isResizing) {
      endResize()
    } else if (isSelecting) {
      endSelection()
    }
  }, [isResizing, isSelecting, endResize, endSelection])

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelection(null)
  }, [])

  // Handle erase
  const handleErase = useCallback(() => {
    if (!selection) return
    
    // Call the parent's erase function with the selection coordinates
    onEraseSelection(selection)
    setSelection(null)
  }, [selection, onEraseSelection])

  // Resize handles component
  const ResizeHandle = ({ position, cursor }) => (
    <div
      className={`absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-${cursor} z-20`}
      style={{
        [position.includes('n') ? 'top' : 'bottom']: '-6px',
        [position.includes('w') ? 'left' : 'right']: '-6px',
        transform: 'translate(50%, 50%)'
      }}
      onMouseDown={(e) => startResize(e, position)}
    />
  )

  return (
    <div className="card p-0 overflow-hidden">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Erase Mode
            </h2>
            <p className="text-sm text-neutral-600">
              Drag to select area, then click erase
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {selection && (
              <>
                <button
                  onClick={clearSelection}
                  className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
                  title="Clear selection"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={handleErase}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Eraser className="w-4 h-4" />
                  <span>Erase Selection</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div
          ref={canvasRef}
          className="relative bg-neutral-100 overflow-hidden cursor-crosshair"
          style={{ 
            width: width + 'px', 
            height: height + 'px',
            backgroundImage: roomImage ? `url(${roomImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {!roomImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-neutral-200 rounded-lg flex items-center justify-center">
                  <Eraser className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-500 font-medium">Upload a room image to start erasing</p>
              </div>
            </div>
          )}
          
          {/* Furniture overlay (for reference) */}
          {furnitureItems.map((item) => (
            <div
              key={item.id}
              className="absolute border-2 border-red-500 bg-red-500/20 pointer-events-none"
              style={{
                left: item.position.x,
                top: item.position.y,
                width: 100 * item.scale,
                height: 100 * item.scale,
                transform: `rotate(${item.rotation}deg)`
              }}
            />
          ))}
          
          {/* Selection rectangle */}
          {selection && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute border-2 border-blue-500 bg-blue-500/20"
              style={{
                left: selection.x,
                top: selection.y,
                width: selection.width,
                height: selection.height,
                zIndex: 10
              }}
            >
              {/* Resize handles */}
              <ResizeHandle position="nw" cursor="nw-resize" />
              <ResizeHandle position="ne" cursor="ne-resize" />
              <ResizeHandle position="sw" cursor="sw-resize" />
              <ResizeHandle position="se" cursor="se-resize" />
              <ResizeHandle position="n" cursor="n-resize" />
              <ResizeHandle position="s" cursor="s-resize" />
              <ResizeHandle position="w" cursor="w-resize" />
              <ResizeHandle position="e" cursor="e-resize" />
              
              {/* Selection info */}
              <div className="absolute -top-8 left-0 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                {Math.round(selection.width)} × {Math.round(selection.height)}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {!selection && (
        <div className="p-4 bg-neutral-50 border-t border-neutral-200">
          <div className="text-center text-sm text-neutral-600">
            <Square className="w-4 h-4 inline mr-2" />
            Drag to create a selection rectangle
          </div>
        </div>
      )}
    </div>
  )
} 