import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Edit, Upload, X } from "lucide-react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

interface Facility {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
}

const FacilitiesManager = () => {
  const { toast } = useToast();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const { data, error } = await supabase
        .from("facilities")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFacilities(data || []);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a facility title.",
        variant: "destructive",
      });
      return;
    }

    if (!imageFile && !editingId) {
      toast({
        title: "Error",
        description: "Please select an image.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      let imageUrl = "";

      // Upload image if a new file is selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from("gallery-images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("gallery-images")
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      if (editingId) {
        // Update existing facility
        const updateData: any = {
          title: title.trim(),
          description: description.trim() || null,
        };

        if (imageUrl) {
          updateData.image_url = imageUrl;
        }

        const { error } = await supabase
          .from("facilities")
          .update(updateData)
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Facility updated successfully.",
        });
      } else {
        // Insert new facility
        const { error } = await supabase.from("facilities").insert([
          {
            title: title.trim(),
            description: description.trim() || null,
            image_url: imageUrl,
          },
        ]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Facility added successfully.",
        });
      }

      // Reset form
      setTitle("");
      setDescription("");
      setImageFile(null);
      setImagePreview("");
      setEditingId(null);
      fetchFacilities();
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

  const handleEdit = (facility: Facility) => {
    setTitle(facility.title);
    setDescription(facility.description || "");
    setImagePreview(facility.image_url);
    setEditingId(facility.id);
  };

  const handleDeleteClick = (id: string) => {
    setFacilityToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!facilityToDelete) return;

    try {
      const { error } = await supabase.from("facilities").delete().eq("id", facilityToDelete);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Facility deleted successfully.",
      });

      fetchFacilities();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setFacilityToDelete(null);
    }
  };

  const handleCancelEdit = () => {
    setTitle("");
    setDescription("");
    setImageFile(null);
    setImagePreview("");
    setEditingId(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading facilities...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Add/Edit Form */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="border-b border-border/20 bg-gradient-to-r from-teal-bg/10 to-transparent">
          <CardTitle className="text-dark-blue flex items-center justify-between">
            <span>{editingId ? "Edit Facility" : "Add New Facility"}</span>
            {editingId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Facility Title *
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Campus Library"
                  className="border-border/60 focus:border-teal-blue"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Facility Image *
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="border-border/60 focus:border-teal-blue"
                  />
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the facility..."
                className="border-border/60 focus:border-teal-blue min-h-24"
                rows={3}
              />
            </div>

            {imagePreview && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Image Preview
                </label>
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border/40">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={uploading}
              className="bg-teal-blue hover:bg-teal-blue/90 text-white shadow-md hover:shadow-lg transition-all duration-300"
            >
              {uploading
                ? "Processing..."
                : editingId
                ? "Update Facility"
                : "Add Facility"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Facilities List */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="border-b border-border/20 bg-gradient-to-r from-teal-bg/10 to-transparent">
          <CardTitle className="text-dark-blue">Existing Facilities</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {facilities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No facilities added yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.map((facility) => (
                <Card
                  key={facility.id}
                  className="overflow-hidden border-border/40 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-teal-blue/20 to-teal-blue/5">
                    <img
                      src={facility.image_url}
                      alt={facility.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-dark-blue mb-2 line-clamp-1">
                      {facility.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {facility.description || "No description provided."}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(facility)}
                        className="flex-1 border-teal-blue/40 text-teal-blue hover:bg-teal-blue/10"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(facility.id)}
                        className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Facility"
        description="Are you sure you want to delete this facility? This action cannot be undone."
      />
    </div>
  );
};

export default FacilitiesManager;
