import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, GraduationCap, School } from "lucide-react";

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

  const getCourseIcon = (index: number) => {
    const icons = [School, BookOpen, GraduationCap];
    const Icon = icons[index % icons.length];
    return <Icon className="w-16 h-16 text-white" />;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-gold-accent text-sm md:text-base font-semibold mb-3 uppercase tracking-wider">
            Academic Programs
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-dark-blue mb-6">
            Our Courses
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto">
            Comprehensive programs designed to provide excellence in Islamic and modern education.
          </p>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-teal-bg/10">
        <div className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </Card>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl text-muted-foreground">No courses available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, index) => (
                <Card
                  key={course.id}
                  className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white border-0 rounded-2xl"
                >
                  {/* Colored Top Section with Icon */}
                  <div className="relative h-48 bg-teal-blue flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-blue to-teal-blue/80"></div>
                    <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                      {getCourseIcon(index)}
                    </div>
                  </div>

                  {/* White Bottom Section with Content */}
                  <CardContent className="p-6 bg-white">
                    <h3 className="text-xl font-bold text-dark-blue mb-3 group-hover:text-teal-blue transition-colors">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                        {course.description}
                      </p>
                    )}
                    {(course.duration || course.level) && (
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-border/50">
                        {course.level && (
                          <span className="text-xs font-medium bg-teal-bg text-teal-blue px-3 py-1 rounded-full">
                            {course.level}
                          </span>
                        )}
                        {course.duration && (
                          <span className="text-xs font-medium bg-gold-accent/10 text-gold-accent px-3 py-1 rounded-full">
                            {course.duration}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Courses;
