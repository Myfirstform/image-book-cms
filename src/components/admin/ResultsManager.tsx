import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import { Plus, Trash2, Edit2, Upload, Trophy } from "lucide-react";

interface ClassItem { id: string; name: string; }
interface SubjectEntry { subject: string; marks: string; grade: string; }
interface Student {
  id: string;
  register_number: string;
  name: string;
  dob: string;
  class_id: string;
  is_published: boolean;
  classes?: { name: string };
}

const ResultsManager = () => {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filterClassId, setFilterClassId] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  // Class form
  const [newClassName, setNewClassName] = useState("");

  // Student form
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({ register_number: "", name: "", dob: "", class_id: "" });
  const [subjects, setSubjects] = useState<SubjectEntry[]>([{ subject: "", marks: "", grade: "" }]);

  // CSV
  const [csvFile, setCsvFile] = useState<File | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string } | null>(null);

  // Toppers
  const [toppers, setToppers] = useState<Record<string, { name: string; register_number: string; total: number; class_name: string }[]>>({});

  const fetchClasses = useCallback(async () => {
    const { data } = await supabase.from("classes").select("*").order("name");
    setClasses(data || []);
  }, []);

  const fetchStudents = useCallback(async () => {
    let query = supabase.from("students").select("*, classes(name)").order("name");
    if (filterClassId && filterClassId !== "all") {
      query = query.eq("class_id", filterClassId);
    }
    const { data } = await query;
    setStudents((data as any) || []);
  }, [filterClassId]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);
  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  // --- Classes ---
  const addClass = async () => {
    if (!newClassName.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("classes").insert({ name: newClassName.trim() });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Class added" }); setNewClassName(""); fetchClasses(); }
    setLoading(false);
  };

  const deleteClass = async (id: string) => {
    const { error } = await supabase.from("classes").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Class deleted" }); fetchClasses(); fetchStudents(); }
  };

  // --- Students ---
  const openAddStudent = () => {
    setEditingStudent(null);
    setStudentForm({ register_number: "", name: "", dob: "", class_id: classes[0]?.id || "" });
    setSubjects([{ subject: "", marks: "", grade: "" }]);
    setShowStudentForm(true);
  };

  const openEditStudent = async (student: Student) => {
    setEditingStudent(student);
    setStudentForm({
      register_number: student.register_number,
      name: student.name,
      dob: student.dob,
      class_id: student.class_id,
    });
    const { data } = await supabase.from("student_subjects").select("subject, marks, grade").eq("student_id", student.id);
    setSubjects(data?.map(s => ({ subject: s.subject, marks: String(s.marks), grade: s.grade })) || [{ subject: "", marks: "", grade: "" }]);
    setShowStudentForm(true);
  };

  const addSubjectRow = () => setSubjects([...subjects, { subject: "", marks: "", grade: "" }]);
  const removeSubjectRow = (i: number) => setSubjects(subjects.filter((_, idx) => idx !== i));
  const updateSubject = (i: number, field: keyof SubjectEntry, value: string) => {
    const updated = [...subjects];
    updated[i][field] = value;
    setSubjects(updated);
  };

  const saveStudent = async () => {
    const { register_number, name, dob, class_id } = studentForm;
    if (!register_number.trim() || !name.trim() || !dob || !class_id) {
      toast({ title: "Missing fields", variant: "destructive" }); return;
    }
    const validSubjects = subjects.filter(s => s.subject.trim() && s.marks.trim());

    setLoading(true);
    try {
      let studentId: string;
      if (editingStudent) {
        const { error } = await supabase.from("students").update({
          register_number: register_number.trim(),
          name: name.trim(),
          dob,
          class_id,
        }).eq("id", editingStudent.id);
        if (error) throw error;
        studentId = editingStudent.id;
        // Delete old subjects
        await supabase.from("student_subjects").delete().eq("student_id", studentId);
      } else {
        const { data, error } = await supabase.from("students").insert({
          register_number: register_number.trim(),
          name: name.trim(),
          dob,
          class_id,
        }).select("id").single();
        if (error) throw error;
        studentId = data.id;
      }

      // Insert subjects
      if (validSubjects.length > 0) {
        const { error } = await supabase.from("student_subjects").insert(
          validSubjects.map(s => ({
            student_id: studentId,
            subject: s.subject.trim(),
            marks: Number(s.marks),
            grade: s.grade.trim() || "N/A",
          }))
        );
        if (error) throw error;
      }

      toast({ title: editingStudent ? "Student updated" : "Student added" });
      setShowStudentForm(false);
      fetchStudents();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  const deleteStudent = async (id: string) => {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Student deleted" }); fetchStudents(); }
  };

  const togglePublish = async (student: Student) => {
    const { error } = await supabase.from("students").update({ is_published: !student.is_published }).eq("id", student.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: student.is_published ? "Unpublished" : "Published" }); fetchStudents(); }
  };

  // --- CSV Upload ---
  const handleCSVUpload = async () => {
    if (!csvFile) return;
    setLoading(true);
    try {
      const text = await csvFile.text();
      const lines = text.split("\n").filter(l => l.trim());
      if (lines.length < 2) throw new Error("CSV must have header + data rows");

      // Skip header: RegisterNumber, Name, DOB, Class, Subject, Marks, Grade
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map(c => c.trim());
        if (cols.length < 7) continue;
        const [regNo, name, dob, className, subject, marks, grade] = cols;

        // Find or create class
        let classId: string;
        const existing = classes.find(c => c.name.toLowerCase() === className.toLowerCase());
        if (existing) {
          classId = existing.id;
        } else {
          const { data, error } = await supabase.from("classes").insert({ name: className }).select("id").single();
          if (error) continue;
          classId = data.id;
          await fetchClasses();
        }

        // Find or create student
        let studentId: string;
        const { data: existingStudent } = await supabase.from("students")
          .select("id").eq("register_number", regNo).maybeSingle();
        if (existingStudent) {
          studentId = existingStudent.id;
        } else {
          const { data, error } = await supabase.from("students").insert({
            register_number: regNo, name, dob, class_id: classId,
          }).select("id").single();
          if (error) continue;
          studentId = data.id;
        }

        // Add subject
        await supabase.from("student_subjects").insert({
          student_id: studentId,
          subject,
          marks: Number(marks),
          grade: grade || "N/A",
        });
      }

      toast({ title: "CSV uploaded successfully" });
      setCsvFile(null);
      fetchClasses();
      fetchStudents();
    } catch (err: any) {
      toast({ title: "CSV Error", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  // --- Toppers ---
  const fetchToppers = async () => {
    const { data: allStudents } = await supabase.from("students").select("id, name, register_number, class_id, classes(name)");
    if (!allStudents) return;

    const studentTotals: Record<string, { name: string; register_number: string; total: number; class_name: string }[]> = {};

    for (const s of allStudents as any[]) {
      const { data: subs } = await supabase.from("student_subjects").select("marks").eq("student_id", s.id);
      const total = subs?.reduce((sum: number, sub: any) => sum + Number(sub.marks), 0) || 0;
      const classId = s.class_id;
      if (!studentTotals[classId]) studentTotals[classId] = [];
      studentTotals[classId].push({ name: s.name, register_number: s.register_number, total, class_name: s.classes?.name || "" });
    }

    const result: typeof toppers = {};
    for (const [classId, students] of Object.entries(studentTotals)) {
      students.sort((a, b) => b.total - a.total);
      const className = students[0]?.class_name || classId;
      result[className] = students.slice(0, 3);
    }
    setToppers(result);
  };

  // --- Delete confirm ---
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "class") deleteClass(deleteTarget.id);
    else if (deleteTarget.type === "student") deleteStudent(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <div className="p-4 sm:p-6">
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <Tabs defaultValue="students">
        <TabsList className="mb-4">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="csv">CSV Upload</TabsTrigger>
          <TabsTrigger value="toppers" onClick={fetchToppers}>Toppers</TabsTrigger>
        </TabsList>

        {/* CLASSES TAB */}
        <TabsContent value="classes">
          <div className="flex gap-2 mb-4">
            <Input placeholder="Class name" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} className="max-w-xs" />
            <Button onClick={addClass} disabled={loading} size="sm"><Plus className="h-4 w-4 mr-1" />Add</Button>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Class Name</TableHead><TableHead className="w-20">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {classes.map(c => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: "class", id: c.id })}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* STUDENTS TAB */}
        <TabsContent value="students">
          {showStudentForm ? (
            <div className="space-y-4 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium">{editingStudent ? "Edit Student" : "Add Student"}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div><Label>Register Number</Label><Input value={studentForm.register_number} onChange={e => setStudentForm({ ...studentForm, register_number: e.target.value })} /></div>
                <div><Label>Name</Label><Input value={studentForm.name} onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} /></div>
                <div><Label>Date of Birth</Label><Input type="date" value={studentForm.dob} onChange={e => setStudentForm({ ...studentForm, dob: e.target.value })} /></div>
                <div>
                  <Label>Class</Label>
                  <Select value={studentForm.class_id} onValueChange={v => setStudentForm({ ...studentForm, class_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Subjects</Label>
                  <Button variant="outline" size="sm" onClick={addSubjectRow}><Plus className="h-3 w-3 mr-1" />Add Subject</Button>
                </div>
                {subjects.map((s, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <Input placeholder="Subject" value={s.subject} onChange={e => updateSubject(i, "subject", e.target.value)} />
                    <Input placeholder="Marks" type="number" value={s.marks} onChange={e => updateSubject(i, "marks", e.target.value)} className="w-24" />
                    <Input placeholder="Grade" value={s.grade} onChange={e => updateSubject(i, "grade", e.target.value)} className="w-20" />
                    {subjects.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeSubjectRow(i)}><Trash2 className="h-4 w-4" /></Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={saveStudent} disabled={loading}>{editingStudent ? "Update" : "Save"}</Button>
                <Button variant="outline" onClick={() => setShowStudentForm(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button size="sm" onClick={openAddStudent}><Plus className="h-4 w-4 mr-1" />Add Student</Button>
                <Select value={filterClassId} onValueChange={setFilterClassId}>
                  <SelectTrigger className="w-48"><SelectValue placeholder="Filter by class" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reg No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-sm">{s.register_number}</TableCell>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{(s as any).classes?.name || ""}</TableCell>
                      <TableCell>{s.dob}</TableCell>
                      <TableCell>
                        <Button variant={s.is_published ? "default" : "outline"} size="sm" onClick={() => togglePublish(s)}>
                          {s.is_published ? "Published" : "Unpublished"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditStudent(s)}><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: "student", id: s.id })}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {students.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-gray-400 py-8">No students found</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          )}
        </TabsContent>

        {/* CSV TAB */}
        <TabsContent value="csv">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              CSV format: <code className="bg-gray-100 px-1 rounded">RegisterNumber, Name, DOB, Class, Subject, Marks, Grade</code>
            </p>
            <p className="text-xs text-gray-400">DOB format: YYYY-MM-DD. One row per subject per student.</p>
            <Input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)} />
            <Button onClick={handleCSVUpload} disabled={!csvFile || loading}>
              <Upload className="h-4 w-4 mr-1" />{loading ? "Uploading..." : "Upload CSV"}
            </Button>
          </div>
        </TabsContent>

        {/* TOPPERS TAB */}
        <TabsContent value="toppers">
          <div className="space-y-6">
            {Object.keys(toppers).length === 0 && <p className="text-gray-400 text-sm">Click "Toppers" tab to load data.</p>}
            {Object.entries(toppers).map(([className, top3]) => (
              <div key={className}>
                <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-1"><Trophy className="h-4 w-4 text-yellow-500" />{className}</h3>
                <Table>
                  <TableHeader><TableRow><TableHead>Rank</TableHead><TableHead>Name</TableHead><TableHead>Reg No.</TableHead><TableHead className="text-right">Total Marks</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {top3.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-bold">{i + 1}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell className="font-mono text-sm">{s.register_number}</TableCell>
                        <TableCell className="text-right">{s.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResultsManager;
