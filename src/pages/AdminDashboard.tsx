import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Menu, X, LayoutDashboard, Image as ImageIcon, BookOpen, Building2, GraduationCap, ClipboardList, ToggleRight } from "lucide-react";
import { User, Session } from "@supabase/supabase-js";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import GalleryManager from "@/components/admin/GalleryManager";
import BooksManager from "@/components/admin/BooksManager";
import FacultiesManager from "@/components/admin/FacultiesManager";
import CoursesManager from "@/components/admin/CoursesManager";
import FacilitiesManager from "@/components/admin/FacilitiesManager";
import ResultsManager from "@/components/admin/ResultsManager";
import AdmissionSettings from "@/components/admin/AdmissionSettings";

// Sidebar navigation items
const sidebarItems = [
  { 
    id: "gallery",
    label: "Gallery",
    icon: ImageIcon,
    component: <GalleryManager />
  },
  { 
    id: "books",
    label: "Publications",
    icon: BookOpen,
    component: <BooksManager />
  },
  { 
    id: "faculties",
    label: "Faculties",
    icon: GraduationCap,
    component: <FacultiesManager />
  },
  { 
    id: "courses",
    label: "Courses",
    icon: BookOpen,
    component: <CoursesManager />
  },
  { 
    id: "facilities",
    label: "Facilities",
    icon: Building2,
    component: <FacilitiesManager />
  },
  { 
    id: "results",
    label: "Results",
    icon: ClipboardList,
    component: <ResultsManager />
  },
  {
    id: "admission",
    label: "Admission Settings",
    icon: ToggleRight,
    component: <AdmissionSettings />
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("gallery");
  
  // Close mobile sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
            <X className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <Button 
            onClick={() => navigate('/')} 
            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100 text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1">
            <nav className="p-4 space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      activeTab === item.id 
                        ? "bg-teal-50 text-teal-700" 
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User & Logout */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-medium">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button */}
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none"
                aria-label="Open sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>

              {/* Page title */}
              <h1 className="text-lg font-medium text-gray-900">
                {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
              </h1>

              {/* Right side actions */}
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="hidden sm:flex items-center space-x-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto focus:outline-none bg-gray-50">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {sidebarItems.map((item) => (
                  <div 
                    key={item.id}
                    className={activeTab === item.id ? 'block' : 'hidden'}
                  >
                    {item.component}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
