import { Link } from "react-router-dom";
import { useEffect } from "react";

const SecondaryAdmission = () => {
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
        padding: "3rem 1rem",
        background: "#f8f9fa",
        fontFamily: "'Poppins', 'Inter', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          background: "white",
          borderRadius: 16,
          padding: "2.5rem 2rem",
          boxShadow: "0 10px 30px rgba(0,74,112,0.08)",
        }}
      >
        <h1 style={{ color: "#004a70", fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
          Secondary Admission (After 7th Standard)
        </h1>
        <p style={{ color: "#5a6c7d", lineHeight: 1.7, marginBottom: "1.5rem" }}>
          Welcome! Admissions for secondary classes are currently open. Please
          fill out the application form to proceed.
        </p>
        <Link
          to="/"
          style={{
            color: "#006241",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default SecondaryAdmission;
