import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pencil, Trash2, Upload, X } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  level: string | null;
  image_url: string;
  created_at: string;
}

const CoursesManager = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [level, setLevel] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
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
        description: "Please enter a course title",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = "";

      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("book-images")
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("book-images")
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (editingId) {
        const updateData: any = {
          title,
          description: description || null,
          duration: duration || null,
          level: level || null,
          updated_at: new Date().toISOString(),
        };

        if (imageUrl) {
          updateData.image_url = imageUrl;
        }

        const { error } = await supabase
          .from("courses")
          .update(updateData)
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Course updated successfully",
        });
      } else {
        if (!imageUrl) {
          toast({
            title: "Error",
            description: "Please upload a course image",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { error } = await supabase.from("courses").insert({
          title,
          description: description || null,
          duration: duration || null,
          level: level || null,
          image_url: imageUrl,
          uploaded_by: user?.id,
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Course added successfully",
        });
      }

      // Reset form
      setTitle("");
      setDescription("");
      setDuration("");
      setLevel("");
      setImage(null);
      setImagePreview("");
      setEditingId(null);
      fetchCourses();
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

  const handleEdit = (course: Course) => {
    setTitle(course.title);
    setDescription(course.description || "");
    setDuration(course.duration || "");
    setLevel(course.level || "");
    setImagePreview(course.image_url);
    setEditingId(course.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      fetchCourses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setTitle("");
    setDescription("");
    setDuration("");
    setLevel("");
    setImage(null);
    setImagePreview("");
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Edit Course" : "Add New Course"}</CardTitle>
          <CardDescription>
            {editingId ? "Update the course details" : "Fill in the course information"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Islamic Graduation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Input
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  placeholder="e.g., Undergraduate, Graduate"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 2 Years, 4 Semesters"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Course Image *</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!editingId}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the course..."
                rows={4}
              />
            </div>

            {imagePreview && (
              <div className="space-y-2">
                <Label>Image Preview</Label>
                <div className="relative w-48 h-48 border rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Update Course" : "Add Course"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Courses</CardTitle>
          <CardDescription>Manage your courses here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <div className="relative h-40">
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-lg line-clamp-1">{course.title}</h3>
                  {course.level && (
                    <p className="text-sm text-muted-foreground">Level: {course.level}</p>
                  )}
                  {course.duration && (
                    <p className="text-sm text-muted-foreground">Duration: {course.duration}</p>
                  )}
                  {course.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(course)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(course.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {courses.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No courses added yet. Create your first course above!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CoursesManager;