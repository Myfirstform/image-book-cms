import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface Book {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string;
  created_at: string;
}

const Publications = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error("Error fetching books:", error);
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
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Gallery
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">Publications</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Books Grid */}
      <main className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-[3/4] bg-muted animate-pulse" />
                <CardHeader>
                  <div className="h-6 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No books published yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <Card
                key={book.id}
                className="group overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  <img
                    src={book.image_url}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{book.title}</CardTitle>
                  {book.description && (
                    <CardDescription className="line-clamp-3">
                      {book.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardFooter>
                  <p className="text-2xl font-bold text-primary">
                    ${book.price.toFixed(2)}
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Publications;
