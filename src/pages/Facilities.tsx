import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Library, Home, Users, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useIframeResize } from "@/hooks/useIframeResize";

interface Facility {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
}

const iconMap: { [key: string]: any } = {
  campus: Building2,
  library: Library,
  hostel: Home,
  union: Users,
  reading: BookOpen,
};

const Facilities = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useIframeResize();

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const { data, error } = await supabase
        .from("facilities")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setFacilities(data || []);
    } catch (error) {
      console.error("Error fetching facilities:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    for (const key in iconMap) {
      if (lowerTitle.includes(key)) {
        return iconMap[key];
      }
    }
    return Building2;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-teal-bg/30 flex items-center justify-center">
        <p className="text-muted-foreground">Loading facilities...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-bg/20 via-background to-background">
      {/* Header Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-gold-accent font-semibold mb-3">
            CAMPUS INFRASTRUCTURE
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-dark-blue mb-4">
            Learning & Living Spaces
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base">
            Modern facilities designed to provide a comprehensive educational experience
            with comfort, technology, and excellence.
          </p>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="pb-20 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility) => {
              const Icon = getIcon(facility.title);
              return (
                <Card
                  key={facility.id}
                  className="group overflow-hidden border-border/40 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white"
                >
                  {/* Image Section */}
                  <div className="relative h-56 overflow-hidden bg-gradient-to-br from-teal-blue to-teal-blue/80">
                    <img
                      src={facility.image_url}
                      alt={facility.title}
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-blue/60 to-transparent" />
                    
                    {/* Icon Overlay */}
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/40">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* Content Section */}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-dark-blue mb-3 group-hover:text-teal-blue transition-colors duration-300">
                      {facility.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {facility.description || "A modern facility designed for excellence in education."}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {facilities.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                No facilities available at the moment.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Facilities;
