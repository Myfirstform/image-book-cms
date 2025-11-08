import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface GalleryImage {
  id: string;
  image_url: string;
  created_at: string;
}

const Home = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Poppins', 'Open Sans', sans-serif;
          line-height: 1.6;
          color: #333;
        }

        .header {
          background: #fff;
          border-bottom: 1px solid #e0e0e0;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          height: 50px;
          width: auto;
        }

        .nav-menu {
          display: flex;
          list-style: none;
          align-items: center;
          gap: 2rem;
        }

        .nav-link {
          text-decoration: none;
          color: #333;
          font-weight: 500;
          transition: color 0.3s;
        }

        .nav-link:hover {
          color: #2563eb;
        }

        .header-social {
          display: flex;
          gap: 1rem;
          margin-left: 2rem;
        }

        .social-icon {
          color: #666;
          font-size: 1.2rem;
          transition: color 0.3s;
        }

        .social-icon:hover {
          color: #2563eb;
        }

        .menu-toggle {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
        }

        .menu-toggle span {
          width: 25px;
          height: 3px;
          background: #333;
          transition: 0.3s;
        }

        .page-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 4rem 0;
          text-align: center;
        }

        .page-header h1 {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }

        .page-header p {
          font-size: 1.2rem;
          opacity: 0.9;
        }

        .breadcrumbs {
          background: #f8f9fa;
          padding: 1rem 0;
        }

        .breadcrumbs-list {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          list-style: none;
          gap: 0.5rem;
          align-items: center;
        }

        .breadcrumb-item a {
          color: #2563eb;
          text-decoration: none;
        }

        .breadcrumb-separator {
          color: #999;
        }

        .section {
          padding: 3rem 0;
        }

        .bg-light {
          background: #f8f9fa;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
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

        .footer {
          background: #1f2937;
          color: #fff;
          padding: 3rem 0 1rem;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .footer-section h3 {
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }

        .footer-section p {
          color: #d1d5db;
          line-height: 1.8;
        }

        .footer-social {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .footer-social-icon {
          color: #d1d5db;
          font-size: 1.5rem;
          transition: color 0.3s;
        }

        .footer-social-icon:hover {
          color: #2563eb;
        }

        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .footer-link {
          color: #d1d5db;
          text-decoration: none;
          transition: color 0.3s;
        }

        .footer-link:hover {
          color: #2563eb;
        }

        .footer-bottom {
          border-top: 1px solid #374151;
          padding-top: 1.5rem;
          text-align: center;
          color: #9ca3af;
        }

        .scroll-to-top {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          cursor: pointer;
          display: none;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: background 0.3s;
        }

        .scroll-to-top:hover {
          background: #1d4ed8;
        }

        @media (max-width: 768px) {
          .nav-menu {
            display: ${menuOpen ? 'flex' : 'none'};
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            flex-direction: column;
            padding: 1rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .menu-toggle {
            display: flex;
          }

          .gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
          }

          .page-header h1 {
            font-size: 2rem;
          }
        }
      `}</style>

      {/* HEADER */}
      <header className="header">
        <div className="header-container">
          <a href="../index.html">
            <img src="../pics/logo 66666.png" alt="Kundoor Markaz Logo" className="logo" />
          </a>
          
          <nav>
            <ul className="nav-menu">
              <li><a href="../index.html" className="nav-link">Home</a></li>
              <li><a href="./admission.html" className="nav-link">Admission</a></li>
              <li><a href="./gallery.html" className="nav-link">Gallery</a></li>
              <li><Link to="/publications" className="nav-link">Publication</Link></li>
              <li><a href="./contact.html" className="nav-link">Contact</a></li>
              
              <div className="header-social">
                <a href="https://www.instagram.com/thasqeef_media/" className="social-icon"><i className="fab fa-instagram"></i></a>
                <a href="https://www.youtube.com/@Kundoor_Markaz" className="social-icon"><i className="fab fa-youtube"></i></a>
                <a href="https://www.facebook.com/thasqeefmedia" className="social-icon"><i className="fab fa-facebook"></i></a>
                <a href="https://wa.me/919746675758" className="social-icon"><i className="fab fa-whatsapp"></i></a>
              </div>
            </ul>
          </nav>
          
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>
      
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="container">
          <h1 data-aos="fade-up">Gallery</h1>
          <p data-aos="fade-up" data-aos-delay="100">Moments from our campus</p>
        </div>
      </div>
      
      {/* BREADCRUMBS */}
      <div className="breadcrumbs">
        <div className="container">
          <ul className="breadcrumbs-list">
            <li className="breadcrumb-item"><a href="../index.html">Home</a></li>
            <li className="breadcrumb-separator">/</li>
            <li className="breadcrumb-item">Gallery</li>
          </ul>
        </div>
      </div>
      
      {/* GALLERY INTRO */}
      <section className="section">
        <div className="container">
          <div data-aos="fade-up" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <p style={{ lineHeight: '1.8', fontSize: '1.1rem' }}>
              Stay connected with Kundoor Markazu Ssaqafathil Islamiyya through our latest news, events, and announcements. This page keeps you informed about program highlights, student activities, and special occasions. Check back regularly to stay updated with all that's happening on our campus!
            </p>
          </div>
        </div>
      </section>
      
      {/* GALLERY SECTION */}
      <section className="section bg-light">
        <div className="container">
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
      </section>
      
      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Kundoor Markaz</h3>
              <p>A premier Islamic educational institution dedicated to excellence in both religious and modern education.</p>
              <div className="footer-social">
                <a href="https://www.instagram.com/thasqeef_media/" className="footer-social-icon"><i className="fab fa-instagram"></i></a>
                <a href="https://www.youtube.com/@Kundoor_Markaz" className="footer-social-icon"><i className="fab fa-youtube"></i></a>
                <a href="https://www.facebook.com/thasqeefmedia" className="footer-social-icon"><i className="fab fa-facebook"></i></a>
                <a href="https://wa.me/919746675758" className="footer-social-icon"><i className="fab fa-whatsapp"></i></a>
              </div>
            </div>
            
            <div className="footer-section">
              <h3>Quick Links</h3>
              <div className="footer-links">
                <a href="./about.html" className="footer-link">About Us</a>
                <a href="./admission.html" className="footer-link">Admissions</a>
                <a href="./gallery.html" className="footer-link">Gallery</a>
                <Link to="/publications" className="footer-link">Publications</Link>
              </div>
            </div>
            
            <div className="footer-section">
              <h3>Contact</h3>
              <p>2W6C+2WV, Kundoor, Nannambra<br />Malappuram, Kerala 676508</p>
              <p>Email: thasqeefmedia@gmail.com<br />Phone: +91 97466 75758</p>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 Markazu Ssaqafathil Islamiyya Kundoor. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* SCROLL TO TOP */}
      <button className="scroll-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <i className="fas fa-arrow-up"></i>
      </button>
    </>
  );
};

export default Home;
