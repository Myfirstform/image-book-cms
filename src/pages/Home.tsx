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
      backgroundColor: '#f8f9fa',
      padding: '2rem 1rem'
    }}>
      <style>{`
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

        @media (max-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
          }
        }
      `}</style>

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
  );
};

export default Home;
