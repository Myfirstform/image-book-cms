import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, GraduationCap } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string | null;
  duration: string | null;
  level: string | null;
  image_url: string;
  created_at: string;
}

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-teal-bg/20 to-background">
      {/* Header Section */}
      <header className="bg-teal-dark text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gold text-sm md:text-base font-medium mb-2 uppercase tracking-wider">
            Education Excellence
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Our Courses
          </h1>
          <div className="w-24 h-1 bg-gold mx-auto rounded-full"></div>
        </div>
      </header>

      {/* Courses Grid */}
      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">No courses available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white border-border"
              >
                <CardHeader className="p-0">
                  <div className="relative h-48 bg-teal-bg overflow-hidden">
                    <img
                      src={course.image_url}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/60 to-transparent"></div>
                    {course.level && (
                      <div className="absolute top-4 right-4 bg-gold text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {course.level}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-xl font-bold text-teal-dark mb-3 group-hover:text-gold transition-colors">
                    {course.title}
                  </CardTitle>
                  {course.description && (
                    <CardDescription className="text-foreground/70 mb-4 line-clamp-3">
                      {course.description}
                    </CardDescription>
                  )}
                  {course.duration && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4 pt-4 border-t border-border">
                      <GraduationCap className="w-4 h-4 text-gold" />
                      <span className="font-medium">{course.duration}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;