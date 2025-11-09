import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FaSearchPlus, FaSearchMinus, FaTimes, FaExpand, FaCompress } from 'react-icons/fa';

interface Book {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string;
  created_at: string;
}

const Publications = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyClick = (bookTitle: string, bookPrice: number) => {
    const phoneNumber = "919746675758";
    const message = `Hi, I would like to buy "${bookTitle}" for ₹${bookPrice.toFixed(2)}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
    setIsFullscreen(false);
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setStartPos({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1 || scale <= 1) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - startPos.x,
      y: touch.clientY - startPos.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => Math.max(0.5, Math.min(prev + delta, 3)));
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      fontFamily: "'Noto Sans Malayalam', 'Manjari', 'Gayathri', 'Noto Sans', sans-serif",
      backgroundColor: '#f8f9fa',
      padding: '2rem 1rem'
    }}>
      <style jsx global>{`
        @media (hover: hover) and (pointer: fine) {
          /* Hide scrollbar for Chrome, Safari and Opera */
          .modal-open::-webkit-scrollbar {
            display: none;
          }
          
          /* Hide scrollbar for IE, Edge and Firefox */
          .modal-open {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        }
      `}</style>
      <style>{`
        .publications-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .publication-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .publication-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        }

        .publication-image {
          width: 100%;
          aspect-ratio: 3/4;
          object-fit: cover;
          display: block;
        }

        .publication-content {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .publication-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: #1f2937;
          line-height: 1.6;
          min-height: 3.2rem;
        }

        .publication-description {
          font-size: 0.9rem;
          color: #4b5563;
          margin-bottom: auto;
          line-height: 1.7;
          min-height: 4.5rem;
          padding-bottom: 1rem;
        }

        .publication-price {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 0.75rem;
          margin-top: auto;
        }

        .buy-button {
          width: 100%;
          padding: 0.75rem 1rem;
          background-color: #25D366;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease;
          margin-top: auto;
        }

        .buy-button:hover {
          background-color: #20BA5A;
        }

        @media (max-width: 1200px) {
          .publications-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .publications-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
        }

        @media (max-width: 480px) {
          .publications-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="publications-grid">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{
                width: '100%',
                aspectRatio: '3/4',
                backgroundColor: '#e0e0e0'
              }} />
              <div style={{ padding: '1.25rem' }}>
                <div style={{
                  height: '1.5rem',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  marginBottom: '0.5rem'
                }} />
                <div style={{
                  height: '1rem',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px',
                  width: '66%'
                }} />
              </div>
            </div>
          ))
        ) : books.length === 0 ? (
          <div style={{ 
            gridColumn: '1 / -1',
            textAlign: 'center', 
            padding: '3rem 0',
            color: '#6c757d',
            fontSize: '1.1rem'
          }}>
              <img
                src={book.image_url}
                alt={book.title}
                className="publication-image"
                style={{ cursor: 'zoom-in' }}
              />
            </div>
            <div className="publication-content">
              <h3 className="publication-title">{book.title}</h3>
              {book.description && (
                <p className="publication-description">{book.description}</p>
              )}
              <p className="publication-price">₹{book.price.toFixed(2)}</p>
              <button 
                className="buy-button"
                onClick={() => handleBuyClick(book.title, book.price)}
              >
                Buy Now
              </button>
            </div>
          </div>
        ))
      )}
    </div>
    </div>

    {selectedImage && (
      <div 
        ref={containerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div 
          style={{
            position: 'relative',
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease',
            maxWidth: '90vw',
            maxHeight: '90vh',
          }}
        >
          <img
            ref={imageRef}
            src={selectedImage}
            alt="Enlarged view"
            style={{
              maxWidth: '100%',
              maxHeight: '90vh',
              display: 'block',
              userSelect: 'none',
            }}
          />
        </div>
        
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          display: 'flex',
          gap: '10px',
          zIndex: 1001,
        }}>
          <button 
            onClick={zoomIn}
            style={buttonStyle}
            title="Zoom In (Ctrl + Scroll Up)"
          >
            <FaSearchPlus />
          </button>
          <button 
            onClick={zoomOut}
            style={buttonStyle}
            title="Zoom Out (Ctrl + Scroll Down)"
          >
            <FaSearchMinus />
          </button>
          <button 
            onClick={resetZoom}
            style={buttonStyle}
            title="Reset Zoom"
          >
            100%
          </button>
          <button 
            onClick={toggleFullscreen}
            style={buttonStyle}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
          <button 
            onClick={closeImageModal}
            style={buttonStyle}
            title="Close (Esc)"
          >
            <FaTimes />
          </button>
        </div>
      </div>
    )}
  </div>
);

const buttonStyle = {
  background: 'rgba(0, 0, 0, 0.6)',
  border: 'none',
  color: 'white',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'background 0.2s',
};

export default Publications;
