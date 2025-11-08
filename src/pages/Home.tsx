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

  useEffect(() => {
    fetchImages();
  }, []);

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
      backgroundColor: '#f8f9fa'
    }}>
      {/* GALLERY SECTION */}
      <section style={{ padding: '2rem 0' }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem' 
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginTop: '2rem'
          }}>
            {loading ? (
              // Loading skeleton
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
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <img
                    src={image.image_url}
                    alt={`Gallery image ${index + 1}`}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '250px',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Responsive styles for mobile */}
      <style>{`
        @media (max-width: 768px) {
          section > div > div {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
