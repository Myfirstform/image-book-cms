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
      fontFamily: "'Poppins', 'Inter', sans-serif",
      backgroundColor: '#f8f9fa',
      padding: 0
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

        .faculties-section {
          padding: 4rem 2rem;
          background: #fff;
        }

        .faculties-header {
          text-align: center;
          margin-bottom: 3.5rem;
        }

        .faculties-subtitle {
          color: #004a70;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 0.75rem;
        }

        .faculties-title {
          font-size: 2.75rem;
          font-weight: 700;
          color: #004a70;
          margin: 0;
          font-family: 'Poppins', sans-serif;
        }

        .faculties-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .faculty-card {
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          padding: 1.5rem;
        }

        .faculty-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
        }

        .faculty-image-wrapper {
          background: #d2f1e1;
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .faculty-image {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 8px;
        }

        .faculty-info {
          padding: 0;
        }

        .faculty-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: #004a70;
          margin: 0 0 0.5rem;
          font-family: 'Poppins', sans-serif;
        }

        .faculty-designation {
          font-size: 0.875rem;
          color: #e2b866;
          font-weight: 500;
          margin: 0;
        }

        .loading-skeleton {
          background: #ffffff;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .skeleton-image {
          background: #d2f1e1;
          border-radius: 12px;
          padding: 1.25rem;
          margin-bottom: 1.25rem;
        }

        .skeleton-img {
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
        }

        .skeleton-text {
          height: 1.25rem;
          background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }

        .skeleton-subtext {
          height: 1rem;
          background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          width: 60%;
          margin: 0 auto;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @media (max-width: 1024px) {
          .faculties-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .faculties-title {
            font-size: 2rem;
          }

          .faculties-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
        }
        
        @media (max-width: 480px) {
          .faculties-section {
            padding: 3rem 1rem;
          }

          .faculties-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .faculties-title {
            font-size: 1.75rem;
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
              <div key={i} className="loading-skeleton">
                <div className="skeleton-image">
                  <div className="skeleton-img" />
                </div>
                <div className="skeleton-text" />
                <div className="skeleton-subtext" />
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
            faculties.map((faculty) => (
              <div
                key={faculty.id}
                className="faculty-card"
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
