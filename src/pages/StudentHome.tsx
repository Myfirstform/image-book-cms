import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const StudentHome = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [registerNumber, setRegisterNumber] = useState("");
  const [dob, setDob] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verified) {
      toast({ title: "Please verify", description: "Check the verification box.", variant: "destructive" });
      return;
    }
    if (!registerNumber.trim() || !dob) {
      toast({ title: "Missing fields", description: "Enter register number and date of birth.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("lookup_student_id", {
        _register_number: registerNumber.trim(),
        _dob: dob,
      });

      if (error) throw error;

      if (!data) {
        toast({ title: "Not found", description: "No published result found for the given details.", variant: "destructive" });
      } else {
        // Pass credentials via sessionStorage so result page can re-fetch securely
        sessionStorage.setItem("result_lookup", JSON.stringify({ register_number: registerNumber.trim(), dob }));
        navigate(`/result/${data}`);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h1 className="text-xl font-bold text-center text-gray-900 mb-1">School Result Portal</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Enter your details to view your result</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="reg">Register Number</Label>
            <Input
              id="reg"
              placeholder="Enter register number"
              value={registerNumber}
              onChange={(e) => setRegisterNumber(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="verify"
              checked={verified}
              onCheckedChange={(checked) => setVerified(checked === true)}
            />
            <Label htmlFor="verify" className="text-sm">I am not a robot</Label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Checking..." : "View Result"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default StudentHome;
