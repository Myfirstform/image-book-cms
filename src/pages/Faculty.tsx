import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useIframeResize } from "@/hooks/useIframeResize";

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

  useIframeResize();

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
    <div className="min-h-screen bg-background font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        
        .faculties-section {
          padding: 5rem 2rem;
          background: linear-gradient(135deg, hsl(var(--teal-dark)) 0%, hsl(188 55% 42%) 100%);
          position: relative;
          overflow: hidden;
        }
        
        .faculties-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%);
          pointer-events: none;
        }

        .faculties-header {
          text-align: center;
          margin-bottom: 4rem;
          position: relative;
          z-index: 1;
        }

        .faculties-subtitle {
          color: hsl(var(--gold));
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 0.75rem;
          animation: fadeInDown 0.6s ease-out;
        }

        .faculties-title {
          font-size: 3rem;
          font-weight: 700;
          color: white;
          margin: 0;
          font-family: 'Poppins', sans-serif;
          animation: fadeInUp 0.6s ease-out;
        }

        .faculties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 2.5rem;
          max-width: 1400px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .faculty-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
          position: relative;
        }

        .faculty-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, hsl(var(--teal-dark)), hsl(var(--gold)));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .faculty-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
        }

        .faculty-card:hover::before {
          transform: scaleX(1);
        }

        .faculty-image-wrapper {
          padding: 2rem 2rem 0;
          background: linear-gradient(135deg, hsl(var(--teal-bg)), #e8f5f3);
        }

        .faculty-image {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 16px;
          border: 4px solid white;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          transition: transform 0.4s ease;
        }

        .faculty-card:hover .faculty-image {
          transform: scale(1.05);
        }

        .faculty-info {
          padding: 1.75rem 1.5rem 2rem;
          background: white;
        }

        .faculty-name {
          font-size: 1.15rem;
          font-weight: 600;
          color: hsl(var(--teal-dark));
          margin: 0 0 0.5rem;
          font-family: 'Poppins', sans-serif;
          line-height: 1.4;
        }

        .faculty-designation {
          font-size: 0.9rem;
          color: hsl(var(--gold));
          font-weight: 500;
          margin: 0;
          text-transform: capitalize;
        }

        .loading-skeleton {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .loading-skeleton .skeleton-image-wrapper {
          padding: 2rem 2rem 0;
          background: hsl(var(--teal-bg));
        }

        .loading-skeleton .skeleton-image {
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 16px;
        }

        .loading-skeleton .skeleton-info {
          padding: 1.75rem 1.5rem 2rem;
        }

        .loading-skeleton .skeleton-name {
          height: 1.5rem;
          background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 0.75rem;
        }

        .loading-skeleton .skeleton-designation {
          height: 1rem;
          background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          width: 70%;
          margin: 0 auto;
        }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
          color: white;
        }

        .empty-state p {
          font-size: 1.25rem;
          margin: 0;
          opacity: 0.9;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @media (max-width: 768px) {
          .faculties-section {
            padding: 4rem 1.5rem;
          }

          .faculties-title {
            font-size: 2.25rem;
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

          .faculties-title {
            font-size: 1.875rem;
          }

          .faculties-grid {
            gap: 1rem;
          }

          .faculty-image-wrapper {
            padding: 1.25rem 1.25rem 0;
          }

          .faculty-info {
            padding: 1.25rem 1rem 1.5rem;
          }
        }
      `}</style>

      <div className="faculties-section">
        <div className="faculties-header">
          <p className="faculties-subtitle">Our Esteemed</p>
          <h1 className="faculties-title">Faculty Members</h1>
        </div>

        <div className="faculties-grid">
          {loadingFaculties ? (
            [...Array(8)].map((_, i) => (
              <div key={i} className="loading-skeleton">
                <div className="skeleton-image-wrapper">
                  <div className="skeleton-image" />
                </div>
                <div className="skeleton-info">
                  <div className="skeleton-name" />
                  <div className="skeleton-designation" />
                </div>
              </div>
            ))
          ) : faculties.length === 0 ? (
            <div className="empty-state">
              <p>No faculty members yet.</p>
            </div>
          ) : (
            faculties.map((faculty, index) => (
              <div
                key={faculty.id}
                className="faculty-card"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="faculty-image-wrapper">
                  <img
                    src={faculty.image_url}
                    alt={`${faculty.name} - ${faculty.designation}`}
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
