import { Link } from "react-router-dom";
import { useEffect } from "react";
import { XCircle, Phone, Home as HomeIcon } from "lucide-react";

const AdmissionClosed = () => {
  useEffect(() => {
    const sendHeight = () => {
      window.parent.postMessage({ iframeHeight: document.body.scrollHeight }, "*");
    };
    sendHeight();
    window.addEventListener("resize", sendHeight);
    const id = setInterval(sendHeight, 500);
    return () => {
      window.removeEventListener("resize", sendHeight);
      clearInterval(id);
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1rem",
        background: "linear-gradient(135deg, #f0f4f8 0%, #e6eef3 100%)",
        fontFamily: "'Poppins', 'Inter', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 540,
          width: "100%",
          background: "white",
          borderRadius: 20,
          boxShadow: "0 20px 50px rgba(0, 74, 112, 0.12)",
          padding: "3rem 2rem",
          textAlign: "center",
          borderTop: "6px solid #004a70",
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            margin: "0 auto 1.5rem",
            background: "#fff5f5",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <XCircle size={56} color="#dc3545" strokeWidth={1.8} />
        </div>

        <h1
          style={{
            color: "#004a70",
            fontSize: "1.9rem",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          Admissions Closed
        </h1>

        <p
          style={{
            color: "#5a6c7d",
            fontSize: "1.05rem",
            lineHeight: 1.6,
            marginBottom: "2rem",
          }}
        >
          Admissions are currently closed. Please check back later or contact
          the office for more details.
        </p>

        <div
          style={{
            background: "#f8fafb",
            borderRadius: 12,
            padding: "1rem 1.25rem",
            marginBottom: "2rem",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            color: "#004a70",
            fontWeight: 600,
          }}
        >
          <Phone size={20} />
          <span>+91 98765 43210</span>
        </div>

        <div>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#004a70",
              color: "white",
              padding: "0.75rem 1.75rem",
              borderRadius: 10,
              textDecoration: "none",
              fontWeight: 600,
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#006241")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#004a70")}
          >
            <HomeIcon size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdmissionClosed;
