import React, { useState, useRef, useEffect, useCallback,useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Save, Upload, Trash, Settings } from 'lucide-react';
import { Styles } from './Styles';
import TypeModal from './TypeModal';
import SettingsModal from './SettingsModal';


const PolygonDrawingApp = () => {

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);


  const [roiTypes, setRoiTypes] = useState({
    FULL_FRAME: [],
    SPECIFIC_ROI: [],
    GENERIC_ROI: [],
    LEFT_ROI: [],
    RIGHT_ROI: [],
    LANR_ROI: [],
    SIGNAL_ROI: [],
    LIGHT_ROI: ['Red', 'Green', 'Yellow']
  });

  const [typeColors, setTypeColors] = useState({
    FULL_FRAME: '#2ecc71',
    SPECIFIC_ROI: '#3498db',
    GENERIC_ROI: '#9b59b6',
    LEFT_ROI: '#f1c40f',
    RIGHT_ROI: '#e67e22',
    LANR_ROI: '#1abc9c',
    SIGNAL_ROI: '#34495e',
    LIGHT_ROI: '#e84393'
  });

  const ROI_TYPES = useMemo(() => {
    return Object.keys(roiTypes).reduce((acc, type, index) => {
      acc[index] = type;
      return acc;
    }, {});
  }, [roiTypes]);

  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [polygons, setPolygons] = useState([]);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const [draggingPoint, setDraggingPoint] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [clickTimeout, setClickTimeout] = useState(null);
  const [customImageUrl, setCustomImageUrl] = useState(null);
  const [expandedPolygons, setExpandedPolygons] = useState({});

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageData, setImageData] = useState({ width: 0, height: 0, displayWidth: 0, displayHeight: 0 });
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  // Add this state to manage the 4 sections for each polygon
const [polygonSections, setPolygonSections] = useState({});



const [pendingPolygon, setPendingPolygon] = useState(null);
const [showTypeModal, setShowTypeModal] = useState(false);
const [selectedTypeForModal, setSelectedTypeForModal] = useState(0);

const [associateCounts, setAssociateCounts] = useState({});

const addAssociatePolygon = (polygonIndex) => {
  setAssociateCounts(prev => {
    const current = prev[polygonIndex] || 0;
    if (current < 4) {
      return { ...prev, [polygonIndex]: current + 1 };
    }
    return prev;
  });
};



// Add this function to initialize sections for a polygon
const initializePolygonSections = (polygonIndex, defaultType, defaultId) => {
  if (!polygonSections[polygonIndex]) {
    setPolygonSections(prev => ({
      ...prev,
      [polygonIndex]: {
        section1: { type: defaultType, id: defaultId },
        section2: { type: defaultType, id: defaultId },
        section3: { type: defaultType, id: defaultId },
        section4: { type: defaultType, id: defaultId }
      }
    }));
  }
};

// Add this function to update section data
const updatePolygonSection = (polygonIndex, sectionKey, field, value) => {
  setPolygonSections(prev => ({
    ...prev,
    [polygonIndex]: {
      ...prev[polygonIndex],
      [sectionKey]: {
        ...prev[polygonIndex][sectionKey],
        [field]: value
      }
    }
  }));
};



  const toggleExpand = (index) => {
    setExpandedPolygons(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const imageUrl = customImageUrl;

  // Calculate image display dimensions to fit container while maintaining aspect ratio
  const calculateImageDisplay = useCallback(() => {
    const image = imageRef.current;
    if (!image || !containerSize.width || !containerSize.height) return;

    const containerAspect = containerSize.width / containerSize.height;
    const imageAspect = image.naturalWidth / image.naturalHeight;
    
    let displayWidth, displayHeight;
    
    if (imageAspect > containerAspect) {
      // Image is wider - fit to width
      displayWidth = containerSize.width;
      displayHeight = displayWidth / imageAspect;
    } else {
      // Image is taller - fit to height
      displayHeight = containerSize.height;
      displayWidth = displayHeight * imageAspect;
    }
    setImageData({
      width: image.naturalWidth,
      height: image.naturalHeight,
      displayWidth,
      displayHeight
    });
  }, [containerSize]);

  // Constrain offset to keep image within bounds
  const constrainOffset = useCallback((newOffset, zoomLevel) => {
    if (!imageData.displayWidth || !imageData.displayHeight) return newOffset;

    const scaledWidth = imageData.displayWidth * zoomLevel;
    const scaledHeight = imageData.displayHeight * zoomLevel;
    
    // Calculate maximum offset to keep image within container bounds
    const maxOffsetX = Math.max(0, (scaledWidth - containerSize.width) / 2);
    const maxOffsetY = Math.max(0, (scaledHeight - containerSize.height) / 2);
    
    return {
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, newOffset.x)),
      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, newOffset.y))
    };
  }, [imageData, containerSize]);


  const getCurrentTypeColor = (polygonType) => {
    const typeName = ROI_TYPES[polygonType];
    return typeColors[typeName] || '#007bff'; // fallback color
  };

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const image = imageRef.current;
    
    if (!canvas || !ctx || !image || !imageLoaded || !imageData.displayWidth) return;

    // Set canvas size to match container
    canvas.width = containerSize.width;
    canvas.height = containerSize.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context
    ctx.save();
    
    // Calculate image position (centered in container)
    const imageX = (containerSize.width - imageData.displayWidth) / 2;
    const imageY = (containerSize.height - imageData.displayHeight) / 2;
    
    // Apply zoom and offset transformations
    ctx.translate(containerSize.width / 2, containerSize.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(offset.x / zoom, offset.y / zoom);
    ctx.translate(-containerSize.width / 2, -containerSize.height / 2);
    
    // Draw image
    ctx.drawImage(image, imageX, imageY, imageData.displayWidth, imageData.displayHeight);
    
    // Draw all polygons (scale coordinates to display size)
    polygons.forEach((polygon, index) => {
      const scaledCoords = polygon.coordinates.map(coord => ({
        x: imageX + (coord.x / imageData.width) * imageData.displayWidth,
        y: imageY + (coord.y / imageData.height) * imageData.displayHeight
      }));
      
      drawPolygon(ctx, scaledCoords, 
        selectedPolygon === index
          ? '#ff0000'
          : getCurrentTypeColor(polygon.type),
        selectedPolygon === index ? 3 : 2,
        false,
        index
      );
    });
    
    // Draw current polygon being drawn
    if (currentPolygon.length > 0) {
      const scaledCoords = currentPolygon.map(coord => ({
        x: imageX + (coord.x / imageData.width) * imageData.displayWidth,
        y: imageY + (coord.y / imageData.height) * imageData.displayHeight
      }));
      drawPolygon(ctx, scaledCoords, '#ffff00', 2, true);
    }
    
    // Restore context
    ctx.restore();
  }, [polygons, currentPolygon, selectedPolygon, zoom, offset, imageLoaded, imageData, containerSize]);

  const drawPolygon = (ctx, points, color, lineWidth, isIncomplete = false, polygonIndex = null) => {
    if (points.length < 1) return;
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color + '33'; 
    ctx.lineWidth = lineWidth / zoom; 
    
    // Draw lines if we have at least 2 points
    if (points.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      
      if (!isIncomplete && points.length >= 3) {
        ctx.closePath();
        ctx.fill();
      }
      
      ctx.stroke();
    }
    
    // Draw points - always draw them even for single point
    points.forEach((point, index) => {
      const isDragging = draggingPoint && draggingPoint.polygonIndex === polygonIndex && draggingPoint.pointIndex === index;
      const isSelected = selectedPolygon === polygonIndex;
      
      // Draw larger circles for selected polygon points to make them easier to grab
      const pointRadius = isSelected ? 8 / zoom : 6 / zoom;
      
      ctx.fillStyle = isDragging ? '#ff8800' : color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add border for selected polygon points
      if (isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 / zoom;
        ctx.stroke();
      }
      
      // Draw point numbers
      ctx.fillStyle = '#000';
      ctx.font = `${14 / zoom}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(index + 1, point.x, point.y - (pointRadius + 4) / zoom);
    });
  };

  const getImageCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get mouse position relative to canvas
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Calculate image position in canvas
    const imageX = (containerSize.width - imageData.displayWidth) / 2;
    const imageY = (containerSize.height - imageData.displayHeight) / 2;
    
    // Transform mouse coordinates considering zoom and offset
    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;
    
    // Reverse the transformations
    const relativeX = mouseX - centerX;
    const relativeY = mouseY - centerY;
    
    const scaledX = relativeX / zoom;
    const scaledY = relativeY / zoom;
    
    const offsetX = scaledX - offset.x / zoom;
    const offsetY = scaledY - offset.y / zoom;
    
    const finalX = offsetX + centerX;
    const finalY = offsetY + centerY;
    
    // Convert to image coordinates
    const imageRelativeX = finalX - imageX;
    const imageRelativeY = finalY - imageY;
    
    // Convert to actual image pixel coordinates
    const actualX = (imageRelativeX / imageData.displayWidth) * imageData.width;
    const actualY = (imageRelativeY / imageData.displayHeight) * imageData.height;
    
    // Check if click is within image bounds
    const isWithinImage = imageRelativeX >= 0 && imageRelativeX <= imageData.displayWidth &&
                         imageRelativeY >= 0 && imageRelativeY <= imageData.displayHeight;
    
    return { 
      x: actualX, 
      y: actualY,
      isWithinImage,
      displayX: finalX,
      displayY: finalY
    };
  };

  const getPointAtPosition = (event) => {
    const coords = getImageCoordinates(event);
    if (!coords.isWithinImage) return null;

    const imageX = (containerSize.width - imageData.displayWidth) / 2;
    const imageY = (containerSize.height - imageData.displayHeight) / 2;
    
    // Check for points in all polygons
    for (let polygonIndex = 0; polygonIndex < polygons.length; polygonIndex++) {
      const polygon = polygons[polygonIndex];
      
      for (let pointIndex = 0; pointIndex < polygon.coordinates.length; pointIndex++) {
        const point = polygon.coordinates[pointIndex];
        
        // Convert to display coordinates
        const displayX = imageX + (point.x / imageData.width) * imageData.displayWidth;
        const displayY = imageY + (point.y / imageData.height) * imageData.displayHeight;
        
        // Check if mouse is within point radius
        const distance = Math.sqrt(
          Math.pow(coords.displayX - displayX, 2) + 
          Math.pow(coords.displayY - displayY, 2)
        );
        
        const pointRadius = selectedPolygon === polygonIndex ? 8 / zoom : 6 / zoom;
        if (distance <= pointRadius) {
          return { polygonIndex, pointIndex };
        }
      }
    }
    
    return null;
  };

  const handleCanvasClick = (event) => {
    if (isPanning || draggingPoint) return;
    
    // Clear any existing timeout
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }
    
    // Set a timeout to handle single click
    const timeout = setTimeout(() => {
      processSingleClick(event);
      setClickTimeout(null);
    }, 200); // 250ms delay to detect double-click
    
    setClickTimeout(timeout);
  };
  
  const processSingleClick = (event) => {
    const coords = getImageCoordinates(event);
    
    // Check if clicking on an existing point
    const pointHit = getPointAtPosition(event);
    if (pointHit) {
      // Select the polygon that contains the clicked point
      setSelectedPolygon(pointHit.polygonIndex);
      return;
    }
    
    // Only allow drawing within image bounds
    if (!coords.isWithinImage) return;
    
    const point = { x: Math.round(coords.x), y: Math.round(coords.y) };
    
    if (!isDrawing) {
      // Start new polygon
      setCurrentPolygon([point]);
      setIsDrawing(true);
      setSelectedPolygon(null);
    } else {
      // Add point to current polygon
      const newPolygon = [...currentPolygon, point];
      setCurrentPolygon(newPolygon);
      
      // Check if we should close the polygon (max 8 points)
      if (newPolygon.length >= 100) {
        finishPolygon(newPolygon);
      }
    }
  };

  const handleCanvasDoubleClick = (event) => {
    // Clear the single click timeout
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }
    
    if (isDrawing && currentPolygon.length >= 3) {
      finishPolygon(currentPolygon);
    }
  };

  const finishPolygon = (polygonPoints) => {
    if (polygonPoints.length >= 3) {
      setPendingPolygon(polygonPoints);
      setShowTypeModal(true);
      setSelectedTypeForModal(0); // default type
    }
    setIsDrawing(false);
  };
  

  const handleCanvasMouseDown = (event) => {
    if (event.button === 1 || event.ctrlKey || event.button === 2) { 
      setIsPanning(true);
      setLastPanPoint({ x: event.clientX, y: event.clientY });
      event.preventDefault();
      return;
    }

    // Check if starting to drag a point
    const pointHit = getPointAtPosition(event);
    if (pointHit && !isDrawing) {
      setDraggingPoint(pointHit);
      setSelectedPolygon(pointHit.polygonIndex);
      
      // Calculate offset between mouse and point center
      const coords = getImageCoordinates(event);
      const point = polygons[pointHit.polygonIndex].coordinates[pointHit.pointIndex];
      setDragOffset({
        x: coords.x - point.x,
        y: coords.y - point.y
      });
      
      event.preventDefault();
      return;
    }
  };

  const handleCanvasMouseMove = (event) => {
    if (isPanning) {
      const deltaX = event.clientX - lastPanPoint.x;
      const deltaY = event.clientY - lastPanPoint.y;
      
      const newOffset = {
        x: offset.x + deltaX,
        y: offset.y + deltaY
      };
      
      const constrainedOffset = constrainOffset(newOffset, zoom);
      setOffset(constrainedOffset);
      
      setLastPanPoint({ x: event.clientX, y: event.clientY });
    } else if (draggingPoint) {
      const coords = getImageCoordinates(event);
      if (coords.isWithinImage) {
        const newX = coords.x - dragOffset.x;
        const newY = coords.y - dragOffset.y;
        
        const clampedX = Math.max(0, Math.min(imageData.width, newX));
        const clampedY = Math.max(0, Math.min(imageData.height, newY));
        
        const updatedPolygons = polygons.map((polygon, polygonIndex) => {
          if (polygonIndex === draggingPoint.polygonIndex) {
            const updatedCoordinates = polygon.coordinates.map((coord, pointIndex) => {
              if (pointIndex === draggingPoint.pointIndex) {
                return { x: clampedX, y: clampedY };
              }
              return coord;
            });
            return { ...polygon, coordinates: updatedCoordinates };
          }
          return polygon;
        });
        
        setPolygons(updatedPolygons);
      }
    } else if (!isDrawing) {
      // Handle cursor changes when hovering over points
      const pointHit = getPointAtPosition(event);
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.cursor = pointHit ? 'grab' : 'default';
      }
    }
  };
  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggingPoint(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleWheel = (event) => {
    event.preventDefault();
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get mouse position relative to canvas
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Calculate zoom
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.5, Math.min(50, zoom * zoomFactor));
    
    if (newZoom === zoom) return; 
    
    // Get the point in world coordinates before zoom
    const worldBeforeZoomX = (mouseX - containerSize.width / 2 - offset.x) / zoom;
    const worldBeforeZoomY = (mouseY - containerSize.height / 2 - offset.y) / zoom;
    
    // Calculate the new offset to keep the point under the mouse cursor
    const newOffsetX = mouseX - containerSize.width / 2 - worldBeforeZoomX * newZoom;
    const newOffsetY = mouseY - containerSize.height / 2 - worldBeforeZoomY * newZoom;
    
    const newOffset = { x: newOffsetX, y: newOffsetY };
    
    // Constrain the new offset
    const constrainedOffset = constrainOffset(newOffset, newZoom);
    
    setZoom(newZoom);
    setOffset(constrainedOffset);
  };

  const zoomIn = () => {
    const newZoom = Math.min(50, zoom * 1.2);
    const constrainedOffset = constrainOffset(offset, newZoom);
    setZoom(newZoom);
    setOffset(constrainedOffset);
  };

  const zoomOut = () => {
    const newZoom = Math.max(0.5, zoom / 1.2);
    const constrainedOffset = constrainOffset(offset, newZoom);
    setZoom(newZoom);
    setOffset(constrainedOffset);
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const updatePolygonType = (index, newType) => {
    const updatedPolygons = polygons.map((polygon, i) => 
      i === index ? { ...polygon, type: parseInt(newType) } : polygon
    );
    setPolygons(updatedPolygons);
  };

  const selectPolygon = (index) => {
    setSelectedPolygon(selectedPolygon === index ? null : index);
  };

  const deletePolygon = (index) => {
    const newPolygons = polygons.filter((_, i) => i !== index);
    setPolygons(newPolygons);
    setSelectedPolygon(null);
    setCurrentPolygon([])
  };

  // Generate available polygon IDs for dropdown
  const getAvailablePolygonIds = () => {
    const numberOfPolygons = polygons.length;
    return Array.from({ length: numberOfPolygons }, (_, i) => `P${i + 1}`);
  };

// EXPORT DATA - Key Changes
const exportData = () => {
  const exportPolygons = polygons.map((polygon, index) => {
    const sections = polygonSections[index] || {};
    const exportEntry = {
      id: polygon.mappedId,
      type: ROI_TYPES[polygon.type || 0],
      sub_type: polygon.subtype || "",  // Changed from subtype to sub_type
      points: polygon.coordinates.map(coord => ({
        x: Math.round(coord.x * 100) / 100,
        y: Math.round(coord.y * 100) / 100
      }))
    };

    // Create associate polygons array instead of individual properties
    const associatePolygons = [];
    Object.entries(sections).forEach(([sectionKey, section]) => {
      if (section?.id && section.id !== polygon.mappedId) {
        const associatedPolygon = polygons.find(p => p.mappedId === section.id);
        if (associatedPolygon) {
          associatePolygons.push({
            "polygon Id": section.id, 
            "polygon_type": ROI_TYPES[associatedPolygon.type]
          });
        }
      }
    });

    // Only add associate polygons if there are any
    if (associatePolygons.length > 0) {
      exportEntry["associate polygons"] = associatePolygons;
    }

    return exportEntry;
  });

  const data = {
    "image height": imageData.height || 0,
    "image width": imageData.width || 0,
    "total polygons": polygons.length,
    "polygons": exportPolygons
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'polygons.json';
  a.click();
  URL.revokeObjectURL(url);
};

// IMPORT DATA - Key Changes
const importData = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (data.polygons && Array.isArray(data.polygons)) {
          const importedPolygons = data.polygons.map((polygon, index) => ({
            id: Date.now() + index,
            name: `Polygon ${index + 1}`,
            coordinates: polygon.points || [],
            type: parseInt(Object.keys(ROI_TYPES).find(key => ROI_TYPES[key] === polygon.type)) || 0,
            mappedId: polygon.id || `P${index + 1}`,
            subtype: polygon.sub_type || ""  
          }));

          setPolygons(importedPolygons);

          // Import sections from associate polygons array
          const importedSections = {};
          const associateCounts = {};

          data.polygons.forEach((polygon, index) => {
            const sections = {};
            let count = 0;

            // Process associate polygons array instead of individual properties
            if (polygon["associate polygons"] && Array.isArray(polygon["associate polygons"])) {
              polygon["associate polygons"].forEach((associate, i) => {
                if (associate["polygon Id"] && associate["polygon_type"]) {
                  // Validate that the associated polygon exists and is different
                  const associatedPolygon = importedPolygons.find(p => p.mappedId === associate["polygon Id"]);
                  
                  if (associatedPolygon && associate["polygon Id"] !== polygon.id) {
                    const typeValue = Object.keys(ROI_TYPES).find(
                      key => ROI_TYPES[key] === associate["polygon_type"]
                    );

                    sections[`section${i + 1}`] = {
                      type: parseInt(typeValue) || 0,
                      id: associate["polygon Id"],
                      subtype: ""
                    };

                    count++;
                  }
                }
              });
            }

            if (count > 0) {
              importedSections[index] = sections;
              associateCounts[index] = count;
            }
          });

          setPolygonSections(importedSections);
          setAssociateCounts(associateCounts);
        } else {
          alert("Invalid JSON structure");
        }
      } catch (error) {
        console.error("Import failed:", error);
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  }
};


  const confirmPolygonType = () => {
    if (pendingPolygon) {
      const newPolygon = {
        id: Date.now(),
        name: `Polygon ${polygons.length + 1}`,
        coordinates: pendingPolygon,
        type: parseInt(selectedTypeForModal),
        mappedId: `P${polygons.length + 1}`
      };

      setPolygons(prev => [...prev, newPolygon]);
      setPendingPolygon(null);
      setShowTypeModal(false);
      setCurrentPolygon([])
    }
  };



  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    if (imageLoaded) {
      calculateImageDisplay();
    }
  }, [imageLoaded, containerSize, calculateImageDisplay]);

  // Update container size when canvas ref changes
  useEffect(() => {
    if (containerRef.current) {
      const updateSize = () => {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      };
      
      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImageUrl(event.target.result);
        setImageLoaded(false);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (!imageUrl) return; 
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      imageRef.current = image;
      setImageLoaded(true);
    };
    image.onerror = () => {
      console.error('Failed to load image');
      setImageLoaded(false);
    };
    image.src = imageUrl;
  
    return () => {
      setImageLoaded(false);
    };
  }, [imageUrl]);
  
  

  const getCursorStyle = () => {
    if (draggingPoint) return 'grabbing';
    if (isPanning) return 'grabbing';
    if (isDrawing) return 'crosshair';
    return 'default';
  };

  

  return (
    <div style={Styles.container}>
      {/* Left side - Canvas */}
      <div style={Styles.leftPanel} ref={containerRef}>
   
        <div style={Styles.canvasContainer}>
         
            {!customImageUrl && (
              <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                textAlign: 'center',
              }}
            >
                
                <label style={Styles.uploadButton}>
                  <Upload size={16} />  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={Styles.hiddenInput}
                  />
                </label>
                <p style={{ marginTop: '10px',color:"grey" }}>No image loaded. Upload an image to start drawing.</p>
                </div>
            )}

            {customImageUrl && (
              <canvas
                ref={canvasRef}
                style={{
                  ...Styles.canvas,
                  cursor: getCursorStyle()
                }}
                onClick={handleCanvasClick}
                onDoubleClick={handleCanvasDoubleClick}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onWheel={handleWheel}
                onContextMenu={(e) => e.preventDefault()}
              />
            )}

        </div>
        
        {isDrawing && (
          <div style={Styles.drawingStatus}>
            Drawing polygon... Points: {currentPolygon.length}/100
            <br />
            <small>Double-click to finish (min 3 points) - Draw only on image</small>
          </div>
        )}
      </div>
      
      {/* Right side - Controls and List */}
      <div style={Styles.rightPanel}>

          <div style={Styles.controlsTop}>
                <button 
                  onClick={zoomIn} 
                  style={Styles.controlButton}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <ZoomIn size={20} />
                </button>
                <button 
                  onClick={zoomOut} 
                  style={Styles.controlButton}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <ZoomOut size={20} />
                </button>
                <button 
                  onClick={resetView} 
                  style={Styles.controlButton}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <RotateCcw size={20} />
                </button>

                <div style={Styles.controlButton}>
                    Zoom: {(zoom * 100).toFixed(0)}%
                </div>
                <div style={Styles.controlButton} onClick={()=>setIsSettingsOpen(true)}>
                   <Settings />
                </div>

          </div>
         
              
        {/* Control buttons */}
        <div style={Styles.controlsSection}>
          <div style={Styles.buttonGroup}>
            <button 
              onClick={exportData} 
              style={Styles.primaryButton}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
            >
              <Save size={16} />
              Export
            </button>
            <label 
              style={Styles.secondaryButton}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1e7e34'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#28a745'}
            >
              <Upload size={16} />
              Import
              <input 
                type="file" 
                accept=".json" 
                onChange={importData} 
                style={Styles.hiddenInput} 
              />
            </label>
          </div>
        </div>
        
        {/* Polygon list */}
        <div style={Styles.polygonList}>
          <div style={{ display: 'flex', justifyContent:"space-between", alignItems:"center"}}>
                <h3 style={Styles.polygonListHeader}>Polygons ({polygons.length})</h3>
                {/* <Info size={'18px'}/> */}
          </div>
          {polygons.length === 0 ? (
              <p style={Styles.emptyState}>No polygons drawn yet</p>
              ) : (
                <div style={{ position: 'relative' }}>
                  {polygons.map((polygon, index) => {
                    // Initialize sections if not exists
                    if (!polygonSections[index]) {
                      initializePolygonSections(index, polygon.type || 0, polygon.mappedId);
                    }
                    const currentTypeName = ROI_TYPES[polygon.type];
                    const showSubtype = currentTypeName && roiTypes[currentTypeName] && roiTypes[currentTypeName].length > 0;
                    return (
                    <div key={polygon.id} style={{ position: 'relative' }}>
                      <div
                        style={{
                          ...((selectedPolygon === index) ? Styles.polygonItemSelected : Styles.polygonItem),
                          minHeight: '80px'
                        }}
                        onClick={() => selectPolygon(index)}
                        onMouseEnter={(e) => {
                          if (selectedPolygon !== index) {
                            e.target.style.borderColor = '#007bff';
                            e.target.style.boxShadow = '0 4px 8px rgba(0,123,255,0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedPolygon !== index) {
                            e.target.style.borderColor = '#ddd';
                            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                          }
                        }}
                      >
                        {/* Header section */}
                        <div style={Styles.polygonHeader}>
                          <div style={{ 
                            backgroundColor: getCurrentTypeColor(polygon.type) || '#007bff',
                            color: 'white',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            flexShrink: 0}} >
                            P{index + 1}
                          </div>

                          <select
                              value={polygon.type || 0}
                              onChange={(e) => {
                                e.stopPropagation();
                                updatePolygonType(index, e.target.value);
                              }}
                              style={Styles.typeDropdown}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {Object.entries(ROI_TYPES).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>

                            {showSubtype && (
                              <select
                                value={polygon.subtype || ''}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  // Update polygon with new subtype
                                  const updatedPolygons = polygons.map((p, i) => 
                                    i === index ? { ...p, subtype: e.target.value } : p
                                  );
                                  setPolygons(updatedPolygons);
                                }}
                                style={{ fontSize: '12px', padding: '4px', width: "66px" }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="">Select Subtype</option>
                                {(roiTypes[currentTypeName] || []).map(subtype => (
                                  <option key={subtype} value={subtype}>{subtype}</option>
                                ))}
                              </select>
                            )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(index);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "14px"
                            }}
                            title="Toggle Details"
                          >
                            {expandedPolygons[index] ? '▲' : '▼'}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePolygon(index);
                            }}
                            style={Styles.deleteButton}
                            onMouseEnter={(e) => e.target.style.color = '#a02622'}
                            onMouseLeave={(e) => e.target.style.color = '#dc3545'}
                          >
                            <Trash color="#bd0f0f" />
                          </button>
                        </div>

                        {/* Add Associate Polygon Button */}
                        {polygons.length > 1 &&
                        <button
                          onClick={() => addAssociatePolygon(index)}
                          style={{
                            marginTop: '4px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            color: 'black',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            border:"1px solid black"
                          }}
                        >
                          + Add Polygon
                        </button>
                        }

                        {/* Render Associate Sections */}
                        {polygons.length > 1 &&
                            [...Array(associateCounts[index] || 0)].map((_, i) => {
                              const sectionKey = `section${i + 1}`;
                              const section = polygonSections[index]?.[sectionKey];

                              // FIXED: Filter out the current polygon's own ID
                              const availableIds = getAvailablePolygonIds().filter(id => id !== polygon.mappedId);
                              const associatedPolygon = polygons.find(p => p.mappedId === section?.id);
                              const typeLabel = associatedPolygon ? ROI_TYPES[associatedPolygon.type] : 'Unknown';

                              return (
                                <div
                                  key={i}
                                  style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginTop: '8px',
                                    alignItems: 'center',
                                    flexWrap: 'wrap'
                                  }}
                                >
                                  <select
                                    value={section?.id || ''}
                                    onChange={(e) => updatePolygonSection(index, sectionKey, 'id', e.target.value)}
                                    style={{ fontSize: '12px', padding: '4px',width:"50px" }}
                                  >
                                    <option value="">Select Polygon</option> 
                                    {availableIds.map(id => (
                                      <option key={id} value={id}>{id}</option>
                                    ))}
                                  </select>

                                  {/* Only show type label if valid polygon is selected */}
                                  {associatedPolygon && (
                                    <label style={{
                                      fontSize: '12px',
                                      backgroundColor: getCurrentTypeColor(associatedPolygon.type) || '#e9ecef',
                                      padding: '5px 8px',
                                      borderRadius: '4px',
                                      width:"80px",
                                      color:"white"
                                    }}>
                                      {typeLabel}
                                    </label>
                                  )}

                                  <button
                                    onClick={() => {
                                      setPolygonSections(prev => {
                                        const updated = { ...prev[index] };
                                        delete updated[sectionKey];
                                        return {
                                          ...prev,
                                          [index]: updated
                                        };
                                      });
                                      setAssociateCounts(prev => ({
                                        ...prev,
                                        [index]: (prev[index] || 1) - 1
                                      }));
                                    }}
                                    style={{
                                      fontSize: '10px',
                                      backgroundColor: '#b11c2a',
                                      color: '#fff',
                                      border: 'none',
                                      borderRadius: '4px',
                                      padding: '3px 6px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Remove
                                  </button>
                                </div>
                              );
                            })
                        }


                        {/* Expanded details */}
                        {expandedPolygons[index] && (
                          <div style={{
                            position: 'absolute',
                            top: '42%',
                            left: '0',
                            right: '0',
                            zIndex: 1000,
                            marginTop: '4px',
                            padding: '12px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            fontSize: '12px',
                            maxHeight: '210px',
                            overflowY: 'auto'
                          }}>
                            <div style={{ marginBottom: '6px' }}>
                              <strong>Name:</strong> {polygon.name}
                            </div>
                            <div style={{ marginBottom: '6px' }}>
                              <strong>ID:</strong> {polygon.mappedId}
                            </div>
                            <div style={{ marginBottom: '6px' }}>
                              <strong>Created:</strong> {new Date(polygon.id).toLocaleString()}
                            </div>
                            <div style={{ marginBottom: '6px' }}>
                              <strong>Total points:</strong> {polygon.coordinates.length} points
                            </div>
                            <strong>Coordinates:</strong>
                            <div style={{
                              marginBottom: '6px',
                              maxHeight: '100px',
                              overflowY: 'auto',
                              padding: '4px',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '4px',
                              fontSize: '11px'
                            }}>
                              <pre style={{
                                margin: '4px 0 0 0',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all'
                              }}>
                                {JSON.stringify(polygon.coordinates.map(p => ({
                                  x: Math.round(p.x * 100) / 100,
                                  y: Math.round(p.y * 100) / 100
                                })), null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
        </div>
      </div>

  {/* ------------   MOdal ----------- */}
      {showTypeModal && (
        <TypeModal
          visible={showTypeModal}
          selectedType={selectedTypeForModal}
          onTypeChange={(e) => setSelectedTypeForModal(e.target.value)}
          onCancel={() => { setShowTypeModal(false)
            setCurrentPolygon([])
          }}
          onConfirm={confirmPolygonType}
          ROI_TYPES={ROI_TYPES}
        />
       )}


      <SettingsModal
        visible={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        roiTypes={roiTypes}
        setRoiTypes={setRoiTypes}
        typeColors={typeColors}
        setTypeColors={setTypeColors}
        polygons={polygons}
        setPolygons={setPolygons}
      />



    </div>
  );
};

export default PolygonDrawingApp;