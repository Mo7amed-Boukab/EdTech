import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { CustomSelect } from "../../../../components/CustomSelect";
import { SearchInput } from "../../../../components/SearchInput";
import { TeachersTable } from "../components/TeachersTable";
import { TeacherModal } from "../components/TeacherModal";
import { DeleteConfirmationModal } from "../../../../components/DeleteConfirmationModal";
import { teacherService } from "../../services/teacherService";
import { classService } from "../../services/classService";
import type { Class } from "../../types/class.types";
import type { Teacher } from "../../types/teacher.types";
import { useToast } from "../../../../hooks/useToast";

export const TeachersManagement = () => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("All");

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Parallel fetch
      const [teachersRes, classesRes] = await Promise.all([
        teacherService.getAll({ limit: 100, search: searchQuery }),
        classService.getAll({ limit: 100 }),
      ]);

      setTeachers(teachersRes.data);
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
  }, [searchQuery]);

  // Prepare table data
  const tableTeachers = useMemo(() => {
    let filtered = teachers;

    if (classFilter !== "All") {
      // Filter by class ID
      filtered = filtered.filter((t) =>
        allClasses.some((c) => c.id === classFilter && c.teacher?.id === t.id)
      );
    }

    return filtered.map((t) => {
      // Find assigned classes for this teacher
      const assigned = allClasses
        .filter((c) => c.teacher?.id === t.id)
        .map((c) => ({ id: c.id, name: c.name }));

      return {
        id: t.id,
        fullName: t.fullName,
        email: t.email,
        assignedClasses: assigned,
      };
    });
  }, [teachers, allClasses, classFilter]);

  // Available classes for filter dropdown
  const filterClassOptions = useMemo(() => {
    return ["All", ...allClasses.map((c) => ({ value: c.id, label: c.name }))];
  }, [allClasses]);

  // Handlers
  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setIsTeacherModalOpen(true);
  };

  const handleEditTeacher = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsTeacherModalOpen(true);
  };

  const handleDeleteClick = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTeacher) return;
    try {
      await teacherService.delete(selectedTeacher.id);
      toast.success("Teacher deleted successfully");
      await fetchData();
      setIsDeleteModalOpen(false);
      setSelectedTeacher(null);
    } catch (err: any) {
      console.error("Error deleting teacher:", err);
      toast.error("Error deleting teacher");
    }
  };

  const handleSaveTeacher = async (teacherData: any) => {
    try {
      let savedTeacher;
      if (selectedTeacher) {
        // Update
        savedTeacher = await teacherService.update(selectedTeacher.id, {
          fullName: teacherData.fullName,
          email: teacherData.email,
          password: teacherData.password || undefined, // Only send if set
        });
      } else {
        // Create
        savedTeacher = await teacherService.create({
          fullName: teacherData.fullName,
          email: teacherData.email,
          password: teacherData.password,
          role: "TEACHER",
        });
      }

      // Current assigned classes for this teacher 
      const currentClassIds = allClasses
        .filter((c) => c.teacher?.id === savedTeacher.id)
        .map((c) => c.id);

      const newClassIds: string[] = teacherData.assignedClasses;

      // Classes to assign (new ones)
      for (const classId of newClassIds) {
        if (!currentClassIds.includes(classId)) {
          await classService.assignTeacher(classId, savedTeacher.id);
        }
      }

      // Classes to unassign (removed ones) - set teacherId to null
      for (const classId of currentClassIds) {
        if (!newClassIds.includes(classId)) {
          // Unassign by setting teacherId to null 
          await classService.update(classId, { teacherId: "" });
        }
      }

      await fetchData();
      setIsTeacherModalOpen(false);
      setSelectedTeacher(null);
      toast.success(selectedTeacher ? "Teacher updated successfully" : "Teacher created successfully");
    } catch (err: any) {
      console.error("Error saving teacher:", err);
      toast.error(err.response?.data?.message || "Error saving teacher");
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
                placeholder="Search teachers..."
              />
            </div>

            <div className="w-full-mobile">
              <CustomSelect
                value={classFilter}
                onChange={setClassFilter}
                options={filterClassOptions}
                placeholder="Filter by Class"
              />
            </div>
          </div>

          <div className="filters-bar-actions">
            <button
              onClick={handleAddTeacher}
              className="btn btn-primary flex items-center justify-center gap-2 w-full-mobile"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Add Teacher</span>
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
          <TeachersTable
            teachers={tableTeachers}
            onEdit={handleEditTeacher}
            onDelete={handleDeleteClick}
          />
        )}

        <TeacherModal
          isOpen={isTeacherModalOpen}
          onClose={() => setIsTeacherModalOpen(false)}
          onSave={handleSaveTeacher}
          teacher={selectedTeacher}
          availableClasses={allClasses.map((c) => ({ id: c.id, name: c.name }))}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={selectedTeacher?.fullName}
          itemType="teacher"
        />
      </div>
    </div>
  );
};
