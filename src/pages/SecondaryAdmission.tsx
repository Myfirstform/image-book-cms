import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, BookOpen, FileText } from "lucide-react";

const SecondaryAdmission = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"open" | "closed" | null>(null);

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

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "secondary_admission")
        .maybeSingle();
      if (!mounted) return;
      const s = (data?.value as { status?: string })?.status;
      setStatus(s === "open" ? "open" : "closed");
    };
    fetchStatus();

    const channel = supabase
      .channel("admission-status-page")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_settings" },
        () => fetchStatus()
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSecondaryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (status === "open") {
      navigate("/secondary-admission-form");
    } else {
      navigate("/admission-closed");
    }
  };

  const isOpen = status === "open";

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
          borderTop: "6px solid #004a70",
        }}
      >
        <h1
          style={{
            color: "#004a70",
            fontSize: "1.9rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
            textAlign: "center",
          }}
        >
          Admissions
        </h1>
        <p
          style={{
            color: "#5a6c7d",
            textAlign: "center",
            marginBottom: "2rem",
          }}
        >
          Choose your level to begin the application process.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <a
            id="secondaryAdmissionBtn"
            href="#"
            onClick={handleSecondaryClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "linear-gradient(135deg, #004a70 0%, #006241 100%)",
              color: "white",
              padding: "1.1rem 1.5rem",
              borderRadius: 12,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "1.05rem",
              boxShadow: "0 8px 20px rgba(0, 74, 112, 0.18)",
              opacity: status === null ? 0.7 : 1,
              transition: "transform 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <GraduationCap size={24} />
            <span style={{ flex: 1 }}>Secondary Admission (After 7th Standard)</span>
            {status && (
              <span
                style={{
                  background: isOpen ? "#22c55e" : "#dc3545",
                  color: "white",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 999,
                  letterSpacing: 0.5,
                }}
              >
                {isOpen ? "OPEN" : "CLOSED"}
              </span>
            )}
          </a>

          <a
            href="https://forms.gle/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "white",
              color: "#004a70",
              padding: "1.1rem 1.5rem",
              borderRadius: 12,
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "1.05rem",
              border: "2px solid #004a70",
              transition: "background 0.2s, color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#004a70";
              e.currentTarget.style.color = "white";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.color = "#004a70";
            }}
          >
            <BookOpen size={24} />
            <span style={{ flex: 1 }}>Higher Secondary Admission</span>
          </a>

          <a
            href="#how-to-apply"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "#fff8ec",
              color: "#8a6a1f",
              padding: "1rem 1.5rem",
              borderRadius: 12,
              textDecoration: "none",
              fontWeight: 600,
              border: "1px dashed #e2b866",
            }}
          >
            <FileText size={22} />
            <span>How to Apply →</span>
          </a>
        </div>

        <div
          id="how-to-apply"
          style={{
            marginTop: "2.5rem",
            padding: "1.5rem",
            background: "#f8fafb",
            borderRadius: 12,
          }}
        >
          <h2
            style={{
              color: "#004a70",
              fontSize: "1.15rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            How to Apply
          </h2>
          <ol style={{ color: "#5a6c7d", lineHeight: 1.8, paddingLeft: "1.25rem" }}>
            <li>Click on the admission button for your level.</li>
            <li>Fill in the application form completely.</li>
            <li>Upload required documents (mark sheet, ID, photo).</li>
            <li>Submit and wait for confirmation from the office.</li>
          </ol>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.75rem" }}>
          <Link to="/" style={{ color: "#006241", fontWeight: 600, textDecoration: "none" }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SecondaryAdmission;
