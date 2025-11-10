import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GalleryImage {
  id: string;
  image_url: string;
  created_at: string;
}

interface Faculty {
  id: string;
  name: string;
  designation: string;
  image_url: string;
  created_at: string;
}

const Home = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFaculties, setLoadingFaculties] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
    fetchFaculties();
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

  const fetchFaculties = async () => {
    try {
      const { data, error } = await supabase
        .from("faculties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFaculties(data || []);
    } catch (error) {
      console.error("Error fetching faculties:", error);
    } finally {
      setLoadingFaculties(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      fontFamily: "'Poppins', 'Open Sans', sans-serif",
      backgroundColor: '#f8f9fa',
      padding: 0
    }}>
      <style>{`
        .faculties-section {
          padding: 4rem 2rem;
          background: #fff;
        }

        .faculties-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .faculties-subtitle {
          color: #2563eb;
          font-size: 0.9rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 0.5rem;
        }

        .faculties-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .faculties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .faculty-card {
          background: #f8f9fa;
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-align: center;
        }

        .faculty-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        .faculty-image-wrapper {
          padding: 1.5rem 1.5rem 0;
        }

        .faculty-image {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 12px;
        }

        .faculty-info {
          padding: 1.5rem;
        }

        .faculty-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.25rem;
        }

        .faculty-designation {
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0;
        }

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

        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 2rem;
          cursor: pointer;
        }

        .lightbox-image {
          max-width: 90vw;
          max-height: 90vh;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          cursor: default;
        }

        .lightbox-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          color: white;
          font-size: 2.5rem;
          font-weight: 300;
          cursor: pointer;
          background: rgba(0, 0, 0, 0.5);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s ease;
          line-height: 1;
        }

        .lightbox-close:hover {
          background: rgba(0, 0, 0, 0.8);
        }

        @media (max-width: 768px) {
          .faculties-title {
            font-size: 2rem;
          }

          .faculties-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

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
          
          .lightbox-close {
            top: 1rem;
            right: 1rem;
            width: 40px;
            height: 40px;
            font-size: 2rem;
          }
          
          .lightbox-overlay {
            padding: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .faculties-section {
            padding: 3rem 1rem;
          }

          .faculties-grid {
            gap: 0.75rem;
          }

          .gallery-section {
            padding: 3rem 1rem;
          }

          .gallery-grid {
            gap: 0.5rem;
          }
        }
      `}</style>

      {/* Faculties Section */}
      <div className="faculties-section">
        <div className="faculties-header">
          <p className="faculties-subtitle">OUR TEAM</p>
          <h1 className="faculties-title">Faculties</h1>
        </div>

        <div className="faculties-grid">
          {loadingFaculties ? (
            [...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  background: '#f8f9fa',
                  borderRadius: '16px',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  padding: '1.5rem 1.5rem 0',
                }}>
                  <div style={{
                    width: '100%',
                    aspectRatio: '1',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '12px',
                  }} />
                </div>
                <div style={{ padding: '1.5rem' }}>
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
                    width: '60%',
                    margin: '0 auto'
                  }} />
                </div>
              </div>
            ))
          ) : faculties.length === 0 ? (
            <div style={{ 
              gridColumn: '1 / -1',
              textAlign: 'center', 
              padding: '3rem 0',
              color: '#6c757d',
              fontSize: '1.1rem'
            }}>
              <p>No faculty members yet.</p>
            </div>
          ) : (
            faculties.map((faculty, index) => (
              <div
                key={faculty.id}
                className="faculty-card"
                data-aos="fade-up"
                data-aos-delay={index < 4 ? index * 50 : 0}
              >
                <div className="faculty-image-wrapper">
                  <img
                    src={faculty.image_url}
                    alt={faculty.name}
                    className="faculty-image"
                    loading="lazy"
                  />
                </div>
                <div className="faculty-info">
                  <h3 className="faculty-name">{faculty.name}</h3>
                  <p className="faculty-designation">{faculty.designation}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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
          className="lightbox-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <span className="lightbox-close" onClick={() => setSelectedImage(null)}>
            ×
          </span>
          <img
            src={selectedImage}
            alt="Full size"
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
