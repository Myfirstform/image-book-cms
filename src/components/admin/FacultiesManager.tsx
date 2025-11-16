import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Trash2, Edit } from "lucide-react";
import DeleteConfirmDialog from "./DeleteConfirmDialog";

interface Faculty {
  id: string;
  name: string;
  designation: string;
  image_url: string;
  created_at: string;
}

const FacultiesManager = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    image: null as File | null,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      const { data, error } = await supabase
        .from("faculties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFaculties(data || []);
    } catch (error) {
      console.error("Error fetching faculties:", error);
      toast({
        title: "Error",
        description: "Failed to fetch faculties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.designation) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!editingId && !formData.image) {
      toast({
        title: "Error",
        description: "Please select an image",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      let imageUrl = "";

      if (formData.image) {
        const fileExt = formData.image.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("gallery-images")
          .upload(filePath, formData.image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("gallery-images")
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      if (editingId) {
        const updateData: any = {
          name: formData.name,
          designation: formData.designation,
        };

        if (imageUrl) {
          updateData.image_url = imageUrl;
        }

        const { error } = await supabase
          .from("faculties")
          .update(updateData)
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Faculty updated successfully",
        });
      } else {
        const { error } = await supabase.from("faculties").insert({
          name: formData.name,
          designation: formData.designation,
          image_url: imageUrl,
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Faculty added successfully",
        });
      }

      setFormData({ name: "", designation: "", image: null });
      setEditingId(null);
      fetchFaculties();
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (faculty: Faculty) => {
    setEditingId(faculty.id);
    setFormData({
      name: faculty.name,
      designation: faculty.designation,
      image: null,
    });
  };

  const handleDeleteClick = (id: string) => {
    setFacultyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!facultyToDelete) return;

    try {
      const { error } = await supabase.from("faculties").delete().eq("id", facultyToDelete);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Faculty deleted successfully",
      });
      fetchFaculties();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setFacultyToDelete(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", designation: "", image: null });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Faculty" : "Add New Faculty"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Faculty Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g., Principal, Faculty"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Faculty Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={uploading}>
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Uploading..." : editingId ? "Update Faculty" : "Add Faculty"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Faculty Members ({faculties.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : faculties.length === 0 ? (
            <p className="text-muted-foreground">No faculties yet. Add your first one above.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {faculties.map((faculty) => (
                <div
                  key={faculty.id}
                  className="border rounded-lg p-4 space-y-3 bg-card"
                >
                  <img
                    src={faculty.image_url}
                    alt={faculty.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">{faculty.name}</h3>
                    <p className="text-sm text-muted-foreground">{faculty.designation}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(faculty)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(faculty.id)}
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

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Faculty"
        description="Are you sure you want to delete this faculty member? This action cannot be undone."
      />
    </div>
  );
};

export default FacultiesManager;
