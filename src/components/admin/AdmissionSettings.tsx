import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const KEY = "secondary_admission";

const AdmissionSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", KEY)
      .maybeSingle();
    if (!error && data) {
      const status = (data.value as { status?: string })?.status;
      setIsOpen(status === "open");
    }
    setLoading(false);
  };

  const handleToggle = async (checked: boolean) => {
    setSaving(true);
    const newStatus = checked ? "open" : "closed";
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { key: KEY, value: { status: newStatus }, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setIsOpen(checked);
    toast({
      title: "Updated",
      description: `Secondary admission is now ${newStatus.toUpperCase()}.`,
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-1">Admission Settings</h2>
      <p className="text-sm text-gray-500 mb-6">
        Control whether the public admission button accepts applications.
      </p>

      <div className="max-w-xl rounded-xl border border-gray-200 p-6 bg-gray-50/50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-base font-medium text-gray-900">
              Secondary Admission Status
            </p>
            <p className="text-sm text-gray-500 mt-1">
              When OPEN, the button leads to the application page. When CLOSED, users
              see an "Admissions Closed" info page.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-semibold ${
                isOpen ? "text-green-600" : "text-red-600"
              }`}
            >
              {isOpen ? "OPEN" : "CLOSED"}
            </span>
            <Switch checked={isOpen} onCheckedChange={handleToggle} disabled={saving} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmissionSettings;
