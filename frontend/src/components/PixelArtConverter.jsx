import React, { useState, useRef, useEffect } from 'react';
import '../styles/PixelArtConverter.css';

const PixelArtConverter = ({ onImageConverted }) => {
    const [preview, setPreview] = useState(null);
    const [gridSizeIndex, setGridSizeIndex] = useState(0);
    const gridSizes = [4, 8, 16, 32, 64]; // Define the grid sizes available
    const [selectedImage, setSelectedImage] = useState(null);
    const canvasRef = useRef(null);

    const convertToPixelArt = (image, size) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        // Set canvas size to match image
        canvas.width = image.width;
        canvas.height = image.height;

        // Draw original image
        ctx.drawImage(image, 0, 0);

        // Background color to remove
        const backgroundColor = { r: 255, g: 255, b: 255 };
        const tolerance = 50; // Adjust color threshold as needed

        // Calculate cell sizes
        const cellWidth = Math.floor(image.width / size);
        const cellHeight = Math.floor(image.height / size);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Create new image data for pixelized version
        const newImageData = ctx.createImageData(canvas.width, canvas.height);

        // Process each cell of the grid
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                // Calculate cell boundaries
                const cellX = x * cellWidth;
                const cellY = y * cellHeight;

                // Get center pixel of cell
                const centerX = Math.floor(cellX + cellWidth / 2);
                const centerY = Math.floor(cellY + cellHeight / 2);
                const centerIndex = (centerY * canvas.width + centerX) * 4;

                let r = data[centerIndex];
                let g = data[centerIndex + 1];
                let b = data[centerIndex + 2];
                let a = data[centerIndex + 3];

                // Check if color is within background tolerance
                const isBackgroundColor =
                    Math.abs(r - backgroundColor.r) < tolerance &&
                    Math.abs(g - backgroundColor.g) < tolerance &&
                    Math.abs(b - backgroundColor.b) < tolerance;

                if (isBackgroundColor) {
                    a = 0; // Set alpha to 0 for transparency
                }

                // Fill entire cell with center color
                for (let pixelY = cellY; pixelY < cellY + cellHeight; pixelY++) {
                    for (let pixelX = cellX; pixelX < cellX + cellWidth; pixelX++) {
                        if (pixelX < canvas.width && pixelY < canvas.height) {
                            const index = (pixelY * canvas.width + pixelX) * 4;
                            newImageData.data[index] = r;
                            newImageData.data[index + 1] = g;
                            newImageData.data[index + 2] = b;
                            newImageData.data[index + 3] = a;
                        }
                    }
                }
            }
        }

        // Draw pixelated image with transparency
        ctx.putImageData(newImageData, 0, 0);

        // Return the pixelated image as data URL
        return canvas.toDataURL('image/png');
    };

    // Effect to reconvert image when grid size changes
    useEffect(() => {
        if (selectedImage) {
            const img = new Image();
            img.onload = () => {
                const pixelatedDataUrl = convertToPixelArt(img, gridSizes[gridSizeIndex]); // Use grid size from index
                setPreview(pixelatedDataUrl);
                if (onImageConverted) {
                    onImageConverted(pixelatedDataUrl);
                }
            };
            img.src = selectedImage;
        }
        // The effect depends on gridSizeIndex, selectedImage, and onImageConverted
    }, [gridSizeIndex, selectedImage, onImageConverted]);

    // Function to handle image file selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (event) => {
            // Update the selectedImage state with the data URL of the loaded image
            setSelectedImage(event.target.result);
        };

        // Start reading the file as a data URL
        reader.readAsDataURL(file);
    };

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
                            Grid Size: {gridSizes[gridSizeIndex]}x{gridSizes[gridSizeIndex]}
                        </label>
                        <div className="slider-container">
                            <span className="slider-label">{gridSizes[0]}</span>
                            <input
                                type="range"
                                id="gridSize"
                                min="0"
                                max={gridSizes.length - 1}
                                value={gridSizeIndex}
                                onChange={(event) => setGridSizeIndex(parseInt(event.target.value))}
                                className="grid-size-slider"
                            />
                            <span className="slider-label">{gridSizes[gridSizes.length - 1]}</span>
                        </div>
                    </div>
                )}
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            {preview && (
                <div className="preview-container">
                    <img src={preview} alt="Pixel Art Preview" className="preview-image" />
                </div>
            )}
        </div>
    );
};

export default PixelArtConverter;
