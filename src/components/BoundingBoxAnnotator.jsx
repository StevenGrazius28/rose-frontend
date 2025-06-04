import { useState, useRef, useEffect, useCallback } from 'react';

const BoundingBoxAnnotator = ({ 
  mediaRef, 
  isVisible = true, 
  onSaveAnnotations, 
  isSaving = false,
  mediaType = 'image', // 'image' or 'video'
  originalFileName = '',
  disabled = false 
}) => {
  // Bounding box states
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [boundingBoxes, setBoundingBoxes] = useState([]);
  const [currentBox, setCurrentBox] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState('');
  
  const canvasRef = useRef(null);

  const enableDrawingMode = () => {
    if (disabled) return;
    
    setIsDrawingMode(true);
    setBoundingBoxes([]);
    setCurrentBox(null);
    setError('');
    
    // Setup canvas overlay
    const canvas = canvasRef.current;
    const media = mediaRef.current;
    if (canvas && media) {
      const rect = media.getBoundingClientRect();
      canvas.width = media.offsetWidth;
      canvas.height = media.offsetHeight;
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.pointerEvents = 'auto';
      canvas.style.cursor = 'crosshair';
      canvas.style.zIndex = '10';
    }
  };

  const disableDrawingMode = () => {
    setIsDrawingMode(false);
    setCurrentBox(null);
    setIsDrawing(false);
    setError('');
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.pointerEvents = 'none';
      canvas.style.cursor = 'default';
      canvas.style.zIndex = '1';
    }
  };

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = useCallback((e) => {
    if (!isDrawingMode) return;
    
    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);
    setCurrentBox({
      startX: coords.x,
      startY: coords.y,
      endX: coords.x,
      endY: coords.y
    });
  }, [isDrawingMode]);

  const handleMouseMove = useCallback((e) => {
    if (!isDrawingMode || !isDrawing) return;
    
    const coords = getCanvasCoordinates(e);
    setCurrentBox(prev => ({
      ...prev,
      endX: coords.x,
      endY: coords.y
    }));
  }, [isDrawingMode, isDrawing]);

  const handleMouseUp = useCallback((e) => {
    if (!isDrawingMode || !isDrawing) return;
    
    const coords = getCanvasCoordinates(e);
    const finalBox = {
      ...currentBox,
      endX: coords.x,
      endY: coords.y,
      id: Date.now()
    };
    
    // Only add if the box has some area
    const width = Math.abs(finalBox.endX - finalBox.startX);
    const height = Math.abs(finalBox.endY - finalBox.startY);
    
    if (width > 10 && height > 10) {
      setBoundingBoxes(prev => [...prev, finalBox]);
    }
    
    setIsDrawing(false);
    setCurrentBox(null);
  }, [isDrawingMode, isDrawing, currentBox]);

  const clearBoundingBoxes = () => {
    setBoundingBoxes([]);
    setCurrentBox(null);
    redrawCanvas();
  };

  const drawBoundingBox = (ctx, box, label, isTemporary = false) => {
    const x = Math.min(box.startX, box.endX);
    const y = Math.min(box.startY, box.endY);
    const width = Math.abs(box.endX - box.startX);
    const height = Math.abs(box.endY - box.startY);
    
    // Set styles
    ctx.strokeStyle = isTemporary ? '#ff6b6b' : '#22c55e';
    ctx.lineWidth = 2;
    ctx.fillStyle = isTemporary ? 'rgba(255, 107, 107, 0.1)' : 'rgba(34, 197, 94, 0.1)';
    
    // Draw rectangle
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
    
    // Draw label
    ctx.fillStyle = isTemporary ? '#ff6b6b' : '#22c55e';
    ctx.font = '12px Arial';
    ctx.fillText(label, x, y - 5);
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw existing bounding boxes
    boundingBoxes.forEach((box, index) => {
      drawBoundingBox(ctx, box, `Rose ${index + 1}`);
    });
    
    // Draw current box being drawn
    if (currentBox && isDrawing) {
      drawBoundingBox(ctx, currentBox, 'Drawing...', true);
    }
  };

  // Redraw canvas when boxes change
  useEffect(() => {
    if (isDrawingMode) {
      redrawCanvas();
    }
  }, [boundingBoxes, currentBox, isDrawingMode]);

  const handleSaveAnnotations = async () => {
    if (boundingBoxes.length === 0) {
      setError('Please draw at least one bounding box before saving');
      return;
    }

    const canvas = canvasRef.current;
    const media = mediaRef.current;
    
    if (!canvas || !media) {
      setError('Canvas or media element not found');
      return;
    }

    try {
      // Convert bounding boxes to YOLO format (normalized coordinates)
      const annotations = boundingBoxes.map(box => {
        const x1 = Math.min(box.startX, box.endX);
        const y1 = Math.min(box.startY, box.endY);
        const x2 = Math.max(box.startX, box.endX);
        const y2 = Math.max(box.startY, box.endY);
        
        // Calculate center and dimensions
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;
        const width = x2 - x1;
        const height = y2 - y1;
        
        // Normalize to media dimensions
        return {
          class: 0, // Assuming class 0 for roses
          x: centerX / media.offsetWidth,
          y: centerY / media.offsetHeight,
          width: width / media.offsetWidth,
          height: height / media.offsetHeight
        };
      });

      // Prepare the data for the backend
      const annotationData = {
        original_image_path: originalFileName,
        annotation: {
          boxes: annotations,
          media_width: media.offsetWidth,
          media_height: media.offsetHeight,
          media_type: mediaType,
          created_at: new Date().toISOString()
        }
      };

      await onSaveAnnotations(annotationData);
      
      // Clear the bounding boxes after successful save
      setBoundingBoxes([]);
      disableDrawingMode();
      setError('');

    } catch (err) {
      setError(`Failed to save annotations: ${err.message}`);
    }
  };

  // Reset when visibility changes
  useEffect(() => {
    if (!isVisible) {
      disableDrawingMode();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Controls */}
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-green-800">
          Processed {mediaType === 'video' ? 'Video' : 'Image'}:
        </h4>
        <div className="flex space-x-2">
          {!isDrawingMode ? (
            <button
              onClick={enableDrawingMode}
              disabled={disabled}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium disabled:bg-gray-400"
            >
              Add Annotations
            </button>
          ) : (
            <>
              <span className="text-sm text-purple-700 font-medium">
                Draw boxes around roses ({boundingBoxes.length} drawn)
              </span>
              <button
                onClick={clearBoundingBoxes}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
              >
                Clear
              </button>
              <button
                onClick={disableDrawingMode}
                className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAnnotations}
                disabled={isSaving || boundingBoxes.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs disabled:bg-gray-400"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ 
          pointerEvents: isDrawingMode ? 'auto' : 'none',
          zIndex: isDrawingMode ? 10 : 1
        }}
      />

      {/* Instructions */}
      {isDrawingMode && (
        <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded">
          <p className="text-sm text-purple-700">
            <strong>Instructions:</strong> Click and drag to draw bounding boxes around roses that weren't detected correctly. 
            This will help improve the model for future predictions.
            {mediaType === 'video' && (
              <span className="block mt-1">
                <strong>Note:</strong> For videos, annotations will be applied to the current frame.
              </span>
            )}
          </p>
        </div>
      )}
    </>
  );
};

export default BoundingBoxAnnotator;