import React, { useState, useRef, useEffect } from "react";

const GRID_SIZES = [4, 8, 16, 32, 64];

const PixelArtConverter = ({ onImageConverted }) => {
  const [preview, setPreview] = useState(null);
  const [gridSizeIndex, setGridSizeIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const canvasRef = useRef(null);

  const processPixelCell = (
    ctx,
    imageData,
    newImageData,
    cellX,
    cellY,
    cellWidth,
    cellHeight,
    canvasWidth,
  ) => {
    // Get center pixel of cell
    const centerX = Math.floor(cellX + cellWidth / 2);
    const centerY = Math.floor(cellY + cellHeight / 2);
    const centerIndex = (centerY * canvasWidth + centerX) * 4;

    const [r, g, b, a] = [
      imageData.data[centerIndex],
      imageData.data[centerIndex + 1],
      imageData.data[centerIndex + 2],
      imageData.data[centerIndex + 3],
    ];

    // Fill entire cell with center color
    for (let pixelY = cellY; pixelY < cellY + cellHeight; pixelY++) {
      for (let pixelX = cellX; pixelX < cellX + cellWidth; pixelX++) {
        if (pixelX < canvasWidth && pixelY < imageData.height) {
          const index = (pixelY * canvasWidth + pixelX) * 4;
          newImageData.data[index] = r;
          newImageData.data[index + 1] = g;
          newImageData.data[index + 2] = b;
          newImageData.data[index + 3] = a;
        }
      }
    }
  };

  const convertToPixelArt = (image, size) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const cellWidth = Math.floor(image.width / size);
    const cellHeight = Math.floor(image.height / size);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newImageData = ctx.createImageData(canvas.width, canvas.height);

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        processPixelCell(
          ctx,
          imageData,
          newImageData,
          x * cellWidth,
          y * cellHeight,
          cellWidth,
          cellHeight,
          canvas.width,
        );
      }
    }

    ctx.putImageData(newImageData, 0, 0);
    return canvas.toDataURL("image/png");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => setSelectedImage(event.target.result);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!selectedImage) return;

    const img = new Image();
    img.onload = () => {
      const pixelatedDataUrl = convertToPixelArt(
        img,
        GRID_SIZES[gridSizeIndex],
      );
      setPreview(pixelatedDataUrl);
      onImageConverted?.(pixelatedDataUrl);
    };
    img.src = selectedImage;
  }, [gridSizeIndex, selectedImage, onImageConverted]);

  const currentGridSize = GRID_SIZES[gridSizeIndex];

  return (
    <div className="pixel-art-converter">
      <div className="converter-controls">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="file-input"
        />
        {selectedImage && (
          <div className="grid-size-control">
            <label htmlFor="gridSize" className="grid-size-label">
              Grid Size: {currentGridSize}x{currentGridSize}
            </label>
            <div className="slider-container">
              <span className="slider-label">{GRID_SIZES[0]}</span>
              <input
                type="range"
                id="gridSize"
                min={0}
                max={GRID_SIZES.length - 1}
                value={gridSizeIndex}
                onChange={(e) => setGridSizeIndex(parseInt(e.target.value))}
                className="grid-size-slider"
              />
              <span className="slider-label">
                {GRID_SIZES[GRID_SIZES.length - 1]}
              </span>
            </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {preview && (
        <div className="preview-container">
          <img
            src={preview}
            alt="Pixel Art Preview"
            className="preview-image"
          />
        </div>
      )}
    </div>
  );
};

export default PixelArtConverter;
