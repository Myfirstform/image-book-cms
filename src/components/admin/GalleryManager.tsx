import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Upload, Image as ImageIcon } from "lucide-react";

interface GalleryImage {
  id: string;
  image_url: string;
  created_at: string;
}

const GalleryManager = () => {
  const { toast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("gallery_images")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery-images")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("gallery-images")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from("gallery_images")
        .insert([{ image_url: publicUrl }]);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Image uploaded successfully!",
      });

      setSelectedFile(null);
      setPreviewUrl(null);
      fetchImages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string, imageUrl: string) => {
    try {
      const filePath = imageUrl.split("/").pop();
      if (filePath) {
        await supabase.storage.from("gallery-images").remove([filePath]);
      }

      const { error } = await supabase
        .from("gallery_images")
        .delete()
        .eq("id", imageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Image deleted successfully!",
      });

      fetchImages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="flex-1"
            />
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
          
          {previewUrl && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-xs rounded-lg shadow-md"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Gallery Images ({images.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No images uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
                >
                  <img
                    src={image.image_url}
                    alt="Gallery"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(image.id, image.image_url)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryManager;
