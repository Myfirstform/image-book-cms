import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FacultyCard } from './FacultyCard';

interface Faculty {
  id: string;
  name: string;
  designation: string;
  image_url: string;
  created_at: string;
}

export const FacultiesManager = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentFaculty, setCurrentFaculty] = useState<Partial<Faculty> | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('faculties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFaculties(data || []);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      toast({
        title: 'Error',
        description: 'Failed to load faculties. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file (JPEG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB',
        variant: 'destructive',
      });
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `faculty/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('faculty-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('faculty-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentFaculty?.name || !currentFaculty.designation) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      let imageUrl = currentFaculty.image_url;

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (currentFaculty.id) {
        // Update existing faculty
        const { error } = await supabase
          .from('faculties')
          .update({
            name: currentFaculty.name,
            designation: currentFaculty.designation,
            ...(imageUrl && { image_url: imageUrl }),
          })
          .eq('id', currentFaculty.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Faculty updated successfully',
        });
      } else {
        // Create new faculty
        const { error } = await supabase
          .from('faculties')
          .insert([
            {
              name: currentFaculty.name,
              designation: currentFaculty.designation,
              image_url: imageUrl,
            },
          ]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Faculty added successfully',
        });
      }

      await fetchFaculties();
      resetForm();
    } catch (error) {
      console.error('Error saving faculty:', error);
      toast({
        title: 'Error',
        description: 'Failed to save faculty. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (faculty: Faculty) => {
    setCurrentFaculty(faculty);
    setImagePreview(faculty.image_url || null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this faculty member?')) return;

    try {
      const { error } = await supabase
        .from('faculties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Faculty deleted successfully',
      });

      await fetchFaculties();
    } catch (error) {
      console.error('Error deleting faculty:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete faculty. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setCurrentFaculty(null);
    setImagePreview(null);
    setImageFile(null);
    setIsDialogOpen(false);
  };

  const openNewFacultyDialog = () => {
    setCurrentFaculty({
      name: '',
      designation: '',
      image_url: '',
    });
    setImagePreview(null);
    setImageFile(null);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Faculties</h2>
        <Button onClick={openNewFacultyDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Faculty
        </Button>
      </div>

      {faculties.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-gray-500">No faculty members added yet.</p>
          <Button onClick={openNewFacultyDialog} className="mt-4">
            <Plus className="mr-2 h-4 w-4" /> Add Your First Faculty
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {faculties.map((faculty) => (
            <div key={faculty.id} className="relative">
              <FacultyCard
                id={faculty.id}
                name={faculty.name}
                designation={faculty.designation}
                imageUrl={faculty.image_url}
                isAdmin={true}
                onEdit={() => handleEdit(faculty)}
                onDelete={() => handleDelete(faculty.id)}
              />
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentFaculty?.id ? 'Edit Faculty' : 'Add New Faculty'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={currentFaculty?.name || ''}
                onChange={(e) =>
                  setCurrentFaculty({
                    ...currentFaculty!,
                    name: e.target.value,
                  })
                }
                placeholder="Dr. John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Input
                id="designation"
                value={currentFaculty?.designation || ''}
                onChange={(e) =>
                  setCurrentFaculty({
                    ...currentFaculty!,
                    designation: e.target.value,
                  })
                }
                placeholder="Principal / Faculty Member"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Profile Image</Label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400">No image</div>
                  )}
                </div>
                <div>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-sm text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG (max 2MB)
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {currentFaculty?.id ? 'Updating...' : 'Adding...'}
                  </>
                ) : currentFaculty?.id ? (
                  'Update Faculty'
                ) : (
                  'Add Faculty'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacultiesManager;
