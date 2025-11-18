import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GalleryImage {
  id: string;
  image_url: string;
  created_at: string;
}

const Home = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Iframe height adjustment
  useEffect(() => {
    const sendHeight = () => {
      const height = document.body.scrollHeight || document.documentElement.scrollHeight;
      window.parent.postMessage({ type: "resize", height }, "*");
    };

    // Send on load
    sendHeight();

    // Send on window resize
    window.addEventListener("resize", sendHeight);

    // Send when images load
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      img.addEventListener("load", sendHeight);
    });

    // Observe dynamic content changes
    const observer = new MutationObserver(sendHeight);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener("resize", sendHeight);
      images.forEach((img) => {
        img.removeEventListener("load", sendHeight);
      });
      observer.disconnect();
    };
  }, []);

  // Update height when lightbox opens/closes
  useEffect(() => {
    if (selectedImage) {
      setTimeout(() => {
        const height = document.body.scrollHeight || document.documentElement.scrollHeight;
        window.parent.postMessage({ type: "resize", height }, "*");
      }, 100);
    }
  }, [selectedImage]);

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };
    
    if (selectedImage) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ 
      minHeight: '100vh',
      fontFamily: "'Poppins', 'Open Sans', sans-serif",
      backgroundColor: '#f8f9fa',
      padding: 0,
      overflow: 'hidden'
    }}>
      <style>{`
        .gallery-section {
          padding: 4rem 2rem;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .gallery-item {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          cursor: pointer;
        }

        .gallery-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        }

        .gallery-item img {
          width: 100%;
          height: 250px;
          object-fit: cover;
          display: block;
        }

        /* Lightbox Modal - Rebuilt from scratch */
        .lightbox-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.85);
          z-index: 99999;
          animation: fadeIn 0.2s ease-out;
          cursor: pointer;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .lightbox-modal-image {
          max-width: 90%;
          max-height: 85vh;
          width: auto;
          height: auto;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
          cursor: default;
          animation: scaleIn 0.2s ease-out;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .lightbox-close-btn {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          color: white;
          font-size: 2.5rem;
          font-weight: 300;
          cursor: pointer;
          background: rgba(0, 0, 0, 0.6);
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          line-height: 1;
          z-index: 100000;
        }

        .lightbox-close-btn:hover {
          background: rgba(0, 0, 0, 0.9);
          transform: scale(1.1);
        }

        /* Tablet Responsive */
        @media (max-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          
          .gallery-item {
            border-radius: 8px;
            aspect-ratio: 1;
          }
          
          .gallery-item img {
            height: 100%;
            aspect-ratio: 1;
          }
          
          .lightbox-modal-image {
            max-width: 92%;
            max-height: 80vh;
          }
          
          .lightbox-close-btn {
            top: 1rem;
            right: 1rem;
            width: 44px;
            height: 44px;
            font-size: 2rem;
          }
        }
        
        /* Mobile Responsive */
        @media (max-width: 480px) {
          .gallery-section {
            padding: 3rem 1rem;
          }

          .gallery-grid {
            gap: 0.5rem;
          }

          .lightbox-modal-image {
            max-width: 95%;
            max-height: 75vh;
          }

          .lightbox-close-btn {
            top: 0.75rem;
            right: 0.75rem;
            width: 40px;
            height: 40px;
            font-size: 1.75rem;
          }
        }
      `}</style>

      {/* Gallery Section */}
      <div className="gallery-section">
        <div className="gallery-grid">
          {loading ? (
            [...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#e0e0e0',
                  height: '250px'
                }}
              />
            ))
          ) : images.length === 0 ? (
            <div style={{ 
              gridColumn: '1 / -1',
              textAlign: 'center', 
              padding: '3rem 0',
              color: '#6c757d',
              fontSize: '1.1rem'
            }}>
              <p>No images yet. Admin can upload images from the dashboard.</p>
            </div>
          ) : (
            images.map((image, index) => (
              <div
                key={image.id}
                className="gallery-item"
                data-aos="fade-up"
                data-aos-delay={index < 3 ? index * 50 : 0}
                onClick={() => setSelectedImage(image.image_url)}
              >
                <img
                  src={image.image_url}
                  alt={`Campus Image ${index + 1}`}
                  loading="lazy"
                />
              </div>
            ))
          )}
        </div>
      </div>

      {selectedImage && (
        <div 
          className="lightbox-modal"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="lightbox-close-btn"
            onClick={() => setSelectedImage(null)}
            aria-label="Close lightbox"
          >
            ×
          </button>
          <img
            src={selectedImage}
            alt="Full size image"
            className="lightbox-modal-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
