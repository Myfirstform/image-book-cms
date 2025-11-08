import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, BookOpen } from "lucide-react";

interface GalleryImage {
  id: string;
  image_url: string;
  created_at: string;
}

const Home = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Gallery</h1>
            <div className="flex items-center gap-3">
              <Link to="/publications">
                <Button variant="ghost" size="sm">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Publications
                </Button>
              </Link>
              <Link to="/login">
                <Button size="sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Gallery Grid */}
      <main className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-muted rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No images yet. Admin can upload images from the dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted shadow-md hover:shadow-xl transition-all duration-300"
              >
                <img
                  src={image.image_url}
                  alt="Gallery image"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
