import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { CustomSelect } from "../../../../components/CustomSelect";
import { SearchInput } from "../../../../components/SearchInput";
import { StudentsTable } from "../components/StudentsTable";
import { StudentModal } from "../components/StudentModal";
import { DeleteConfirmationModal } from "../../../../components/DeleteConfirmationModal";
import { studentService } from "../../services/studentService";
import { classService } from "../../services/classService";
import type { Student } from "../../types/student.types";
import type { Class } from "../../types/class.types";
import { useToast } from "../../../../hooks/useToast";

export const StudentsManagement = () => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("All");

  const [students, setStudents] = useState<Student[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        limit: 100,
        ...(searchQuery && { search: searchQuery }),
      };

      if (classFilter !== "All") {
        filters.classId = classFilter;
      }

      const [studentsRes, classesRes] = await Promise.all([
        studentService.getAll(filters),
        classService.getAll({ limit: 100 }),
      ]);

      setStudents(studentsRes.data);
      setAllClasses(classesRes.data);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(
        err.response?.data?.message || "Erreur lors du chargement des données"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery, classFilter]);

  // Handlers
  const handleAddStudent = () => {
    setSelectedStudent(null);
    setIsStudentModalOpen(true);
  };

  const handleEditStudent = (student: any) => {
    setSelectedStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleDeleteClick = (student: any) => {
    setSelectedStudent(student);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedStudent) return;
    try {
      await studentService.delete(selectedStudent.id);
      toast.success("Student deleted successfully");
      await fetchData();
      setIsDeleteModalOpen(false);
      setSelectedStudent(null);
    } catch (err: any) {
      console.error("Error deleting student:", err);
      toast.error("Error deleting student");
    }
  };

  const handleSaveStudent = async (studentData: any) => {
    try {
      if (selectedStudent) {
        // Update
        await studentService.update(selectedStudent.id, {
          fullName: studentData.fullName,
          email: studentData.email,
          password: studentData.password || undefined,
          classId: studentData.classId || undefined,
        });
        toast.success("Student updated successfully");
      } else {
        // Create
        await studentService.create({
          fullName: studentData.fullName,
          email: studentData.email,
          password: studentData.password,
          role: "STUDENT",
          classId: studentData.classId || undefined,
        });
        toast.success("Student created successfully");
      }
      await fetchData();
      setIsStudentModalOpen(false);
      setSelectedStudent(null);
    } catch (err: any) {
      console.error("Error saving student:", err);
      toast.error(err.response?.data?.message || "Error saving student");
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-container">
        {/* Actions Bar */}
        <div className="filters-bar">
          <div className="filters-bar-left">
            <div className="w-full-mobile">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students..."
              />
            </div>

            <div className="w-full-mobile">
              <CustomSelect
                value={classFilter}
                onChange={setClassFilter}
                options={[
                  "All",
                  ...allClasses.map((c) => ({ value: c.id, label: c.name })),
                ]}
                placeholder="All Classes"
              />
            </div>
          </div>

          <div className="filters-bar-actions">
            <button
              onClick={handleAddStudent}
              className="btn btn-primary flex items-center justify-center gap-2 w-full-mobile"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Add Student</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E94560]"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-[#c41e3a] px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && (
          <StudentsTable
            students={students}
            onEdit={handleEditStudent}
            onDelete={handleDeleteClick}
          />
        )}

        <StudentModal
          isOpen={isStudentModalOpen}
          onClose={() => setIsStudentModalOpen(false)}
          onSave={handleSaveStudent}
          student={selectedStudent}
          availableClasses={allClasses.map((c) => ({ id: c.id, name: c.name }))}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={selectedStudent?.fullName}
          itemType="student"
        />
      </div>
    </div>
  );
};
