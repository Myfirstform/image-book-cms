import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap } from "lucide-react";

const SecondaryAdmissionButton = () => {
  const [status, setStatus] = useState<"open" | "closed" | null>(null);

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
      .channel("admission-status")
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

  const isOpen = status === "open";
  const target = isOpen ? "/secondary-admission" : "/admission-closed";

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #004a70 0%, #006241 100%)",
        padding: "3rem 1.5rem",
        textAlign: "center",
        color: "white",
      }}
    >
      <h2
        style={{
          fontSize: "1.75rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        Now Accepting Applications
      </h2>
      <p style={{ opacity: 0.9, marginBottom: "1.75rem", fontSize: "1rem" }}>
        Begin your journey with us — apply for secondary admission today.
      </p>

      <Link
        id="secondaryAdmissionBtn"
        to={target}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          background: "#e2b866",
          color: "#004a70",
          padding: "0.95rem 2.25rem",
          borderRadius: 50,
          fontWeight: 700,
          fontSize: "1.05rem",
          textDecoration: "none",
          boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
          opacity: status === null ? 0.6 : isOpen ? 1 : 0.85,
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.25)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
        }}
      >
        <GraduationCap size={22} />
        Secondary Admission (After 7th Standard)
        {status === "closed" && (
          <span
            style={{
              marginLeft: 8,
              background: "#dc3545",
              color: "white",
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 999,
              letterSpacing: 0.5,
            }}
          >
            Currently Closed
          </span>
        )}
      </Link>
    </div>
  );
};

export default SecondaryAdmissionButton;
