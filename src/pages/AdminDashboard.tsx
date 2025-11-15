import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { User, Session } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GalleryManager from "@/components/admin/GalleryManager";
import BooksManager from "@/components/admin/BooksManager";
import FacultiesManager from "@/components/admin/FacultiesManager";
import CoursesManager from "@/components/admin/CoursesManager";
import FacilitiesManager from "@/components/admin/FacilitiesManager";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (!session?.user) {
          navigate("/login");
        } else {
          setTimeout(() => {
            checkAdminStatus(session.user.id);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        navigate("/login");
      } else {
        checkAdminStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        navigate("/login");
        return;
      }

      if (data) {
        setIsAdmin(true);
      } else {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        navigate("/login");
      }
    } catch (error) {
      console.error("Error:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-bg via-background to-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-gold-accent font-semibold mb-1">
                MANAGEMENT PORTAL
              </p>
              <h1 className="text-3xl font-bold text-dark-blue">Admin Dashboard</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-dark-blue text-dark-blue hover:bg-dark-blue hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-border/20">
          <Tabs defaultValue="gallery" className="w-full">
            <TabsList className="grid w-full grid-cols-5 max-w-5xl mx-auto h-14 bg-teal-bg/50 p-1.5 rounded-xl">
              <TabsTrigger 
                value="gallery"
                className="data-[state=active]:bg-teal-blue data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-300"
              >
                Gallery Images
              </TabsTrigger>
              <TabsTrigger 
                value="books"
                className="data-[state=active]:bg-teal-blue data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-300"
              >
                Publications
              </TabsTrigger>
              <TabsTrigger 
                value="faculties"
                className="data-[state=active]:bg-teal-blue data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-300"
              >
                Faculties
              </TabsTrigger>
              <TabsTrigger 
                value="courses"
                className="data-[state=active]:bg-teal-blue data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-300"
              >
                Courses
              </TabsTrigger>
              <TabsTrigger 
                value="facilities"
                className="data-[state=active]:bg-teal-blue data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg font-medium transition-all duration-300"
              >
                Facilities
              </TabsTrigger>
            </TabsList>

            <TabsContent value="gallery" className="mt-8">
              <GalleryManager />
            </TabsContent>

            <TabsContent value="books" className="mt-8">
              <BooksManager />
            </TabsContent>

            <TabsContent value="faculties" className="mt-8">
              <FacultiesManager />
            </TabsContent>

            <TabsContent value="courses" className="mt-8">
              <CoursesManager />
            </TabsContent>

            <TabsContent value="facilities" className="mt-8">
              <FacilitiesManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
