import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Plus, BookOpen } from "lucide-react";

interface Book {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string;
  created_at: string;
}

const BooksManager = () => {
  const { toast } = useToast();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBooks(data || []);
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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPrice("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingBook(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = editingBook?.image_url || "";

      // Upload new image if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("book-images")
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("book-images")
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      if (!imageUrl && !editingBook) {
        toast({
          title: "Error",
          description: "Please select an image",
          variant: "destructive",
        });
        setUploading(false);
        return;
      }

      const bookData = {
        title,
        description: description || null,
        price: parseFloat(price),
        image_url: imageUrl,
      };

      if (editingBook) {
        const { error } = await supabase
          .from("books")
          .update(bookData)
          .eq("id", editingBook.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Book updated successfully!",
        });
      } else {
        const { error } = await supabase
          .from("books")
          .insert([bookData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Book added successfully!",
        });
      }

      resetForm();
      setDialogOpen(false);
      fetchBooks();
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

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setTitle(book.title);
    setDescription(book.description || "");
    setPrice(book.price.toString());
    setPreviewUrl(book.image_url);
    setDialogOpen(true);
  };

  const handleDelete = async (bookId: string, imageUrl: string) => {
    try {
      const filePath = imageUrl.split("/").pop();
      if (filePath) {
        await supabase.storage.from("book-images").remove([filePath]);
      }

      const { error } = await supabase
        .from("books")
        .delete()
        .eq("id", bookId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Book deleted successfully!",
      });

      fetchBooks();
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
      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Book
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBook ? "Edit Book" : "Add New Book"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Book Cover Image {!editingBook && "*"}</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>

            {previewUrl && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-xs rounded-lg shadow-md"
                />
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? "Saving..." : editingBook ? "Update" : "Add Book"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Books List */}
      <Card>
        <CardHeader>
          <CardTitle>Published Books ({books.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[3/4] bg-muted rounded-lg animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No books published yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map((book) => (
                <Card key={book.id} className="overflow-hidden">
                  <div className="relative aspect-[3/4] bg-muted">
                    <img
                      src={book.image_url}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold line-clamp-1">{book.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {book.description}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      ${book.price.toFixed(2)}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(book)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(book.id, book.image_url)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
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
    </div>
  );
};

export default BooksManager;
