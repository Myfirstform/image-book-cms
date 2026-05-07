import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const SecondaryAdmissionForm = () => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: "Application Submitted",
        description: "We have received your application. We will contact you soon.",
      });
      (e.target as HTMLFormElement).reset();
    }, 800);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.7rem 0.9rem",
    borderRadius: 8,
    border: "1px solid #cfd8e0",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    outline: "none",
    background: "white",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 6,
    color: "#004a70",
    fontWeight: 600,
    fontSize: "0.9rem",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "3rem 1rem",
        background: "linear-gradient(135deg, #f0f4f8 0%, #e6eef3 100%)",
        fontFamily: "'Poppins', 'Inter', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          background: "white",
          borderRadius: 20,
          padding: "2.5rem 2rem",
          boxShadow: "0 20px 50px rgba(0, 74, 112, 0.12)",
          borderTop: "6px solid #006241",
        }}
      >
        <h1
          style={{
            color: "#004a70",
            fontSize: "1.8rem",
            fontWeight: 700,
            marginBottom: "0.25rem",
            textAlign: "center",
          }}
        >
          Secondary Admission Form
        </h1>
        <p
          style={{
            color: "#5a6c7d",
            textAlign: "center",
            marginBottom: "2rem",
            fontSize: "0.95rem",
          }}
        >
          Application for admission after 7th Standard
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input required type="text" style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Date of Birth *</label>
              <input required type="date" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Gender *</label>
              <select required style={inputStyle} defaultValue="">
                <option value="" disabled>
                  Select
                </option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Father's / Guardian's Name *</label>
            <input required type="text" style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Phone *</label>
              <input required type="tel" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Previous School</label>
            <input type="text" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Address *</label>
            <textarea required rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: "0.5rem",
              padding: "0.95rem 1.5rem",
              background: "linear-gradient(135deg, #004a70 0%, #006241 100%)",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: "1rem",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
              boxShadow: "0 8px 20px rgba(0,74,112,0.18)",
            }}
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link
            to="/secondary-admission"
            style={{ color: "#006241", fontWeight: 600, textDecoration: "none" }}
          >
            ← Back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SecondaryAdmissionForm;
