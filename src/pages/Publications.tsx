import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  return (
    <div style={{ 
      minHeight: '100vh',
      fontFamily: "'Poppins', 'Open Sans', sans-serif",
      backgroundColor: '#f8f9fa',
      padding: '2rem 1rem'
    }}>
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
          cursor: pointer;
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
        }

        .publication-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1f2937;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .publication-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .publication-price {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 1rem;
        }

        .buy-button {
          width: 100%;
          padding: 0.75rem 1rem;
          background-color: #25D366;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s ease;
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
            <p>No books published yet.</p>
          </div>
        ) : (
          books.map((book) => (
            <div key={book.id} className="publication-card">
              <img
                src={book.image_url}
                alt={book.title}
                className="publication-image"
                loading="lazy"
              />
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
  );
};

export default Publications;
