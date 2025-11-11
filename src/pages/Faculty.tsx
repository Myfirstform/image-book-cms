import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Faculty {
  id: string;
  name: string;
  designation: string;
  image_url: string;
  created_at: string;
}

const Faculty = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(true);

  useEffect(() => {
    fetchFaculties();
  }, []);

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

        @media (max-width: 768px) {
          .faculties-title {
            font-size: 2rem;
          }

          .faculties-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .faculties-section {
            padding: 3rem 1rem;
          }

          .faculties-grid {
            gap: 0.75rem;
          }
        }
      `}</style>

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
    </div>
  );
};

export default Faculty;
