import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Subject {
  subject: string;
  marks: number;
  grade: string;
}

interface StudentData {
  name: string;
  register_number: string;
  class_name: string;
  subjects: Subject[];
  total_marks: number;
  result: string;
}

const StudentResult = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      if (!id) return;
      const { data: student, error } = await supabase
        .from("students")
        .select("name, register_number, is_published, classes(name)")
        .eq("id", id)
        .maybeSingle();

      if (error || !student || !student.is_published) {
        setLoading(false);
        return;
      }

      const { data: subjects } = await supabase
        .from("student_subjects")
        .select("subject, marks, grade")
        .eq("student_id", id);

      const subs = subjects || [];
      const total = subs.reduce((sum, s) => sum + Number(s.marks), 0);
      const hasFail = subs.some((s) => s.grade.toUpperCase() === "F" || Number(s.marks) < 35);

      setData({
        name: student.name,
        register_number: student.register_number,
        class_name: (student.classes as any)?.name || "",
        subjects: subs,
        total_marks: total,
        result: hasFail ? "FAIL" : "PASS",
      });
      setLoading(false);
    };
    fetchResult();
  }, [id]);

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    // Simple: use browser print to PDF
    window.print();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500 space-y-4">
        <p>Result not available.</p>
        <Button variant="outline" onClick={() => navigate("/results")}>Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg p-6 shadow-sm print:shadow-none print:border-none">
        <h1 className="text-xl font-bold text-center text-gray-900 mb-4">Examination Result</h1>

        <div className="space-y-1 mb-4 text-sm">
          <p><span className="font-medium">Name:</span> {data.name}</p>
          <p><span className="font-medium">Register Number:</span> {data.register_number}</p>
          <p><span className="font-medium">Class:</span> {data.class_name}</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead className="text-right">Marks</TableHead>
              <TableHead className="text-right">Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.subjects.map((s, i) => (
              <TableRow key={i}>
                <TableCell>{s.subject}</TableCell>
                <TableCell className="text-right">{s.marks}</TableCell>
                <TableCell className="text-right">{s.grade}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 space-y-1 text-sm">
          <p><span className="font-medium">Total Marks:</span> {data.total_marks}</p>
          <p>
            <span className="font-medium">Result: </span>
            <span className={data.result === "PASS" ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
              {data.result}
            </span>
          </p>
        </div>

        <div className="flex gap-2 mt-6 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint}>Print</Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>Download PDF</Button>
          <Button variant="outline" size="sm" onClick={() => navigate("/results")}>Back</Button>
        </div>
      </div>
    </div>
  );
};

export default StudentResult;
