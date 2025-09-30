import React, { useState, useEffect } from 'react';
import './ImageGallery.css';

const ImageGallery = ({ images, productName = 'Producto' }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (images && images.length > 0) {
      setIsLoading(false);
    }
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="image-gallery">
        <div className="main-image placeholder">
          <div className="placeholder-content">
            <span>Sin imagen disponible</span>
          </div>
        </div>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  const handlePrevious = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="image-gallery">
      {/* Main Image Display */}
      <div className="main-image-container">
        <div className="main-image">
          {isLoading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          )}

          <img
            src={currentImage.sizes?.large || currentImage.url}
            alt={currentImage.alt || `${productName} - Imagen ${currentImageIndex + 1}`}
            title={currentImage.title || productName}
            loading="lazy"
            onLoad={() => setIsLoading(false)}
            onError={(e) => {
              // Fallback to smaller size if large fails
              e.target.src = currentImage.sizes?.medium || currentImage.url;
            }}
          />

          {/* Navigation arrows for multiple images */}
          {images.length > 1 && (
            <>
              <button
                className="nav-arrow nav-arrow-left"
                onClick={handlePrevious}
                aria-label="Imagen anterior"
              >
                &#8249;
              </button>
              <button
                className="nav-arrow nav-arrow-right"
                onClick={handleNext}
                aria-label="Siguiente imagen"
              >
                &#8250;
              </button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="image-counter">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="thumbnail-strip">
          {images.map((image, index) => (
            <button
              key={index}
              className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => handleImageChange(index)}
              aria-label={`Ver imagen ${index + 1}`}
            >
              <img
                src={image.sizes?.thumbnail || image.sizes?.small || image.url}
                alt={`${productName} - Miniatura ${index + 1}`}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image zoom on hover (optional) */}
      <div className="image-info">
        <small>
          {images.length > 1
            ? `${images.length} imágenes disponibles`
            : 'Imagen del producto'
          }
        </small>
      </div>
    </div>
  );
};

export default ImageGallery;