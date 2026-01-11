import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { CustomSelect } from "../../../../components/CustomSelect";
import { SearchInput } from "../../../../components/SearchInput";
import { ClassesTable } from "../components/ClassesTable";
import { ClassModal } from "../components/ClassModal";
import { DeleteConfirmationModal } from "../../../../components/DeleteConfirmationModal";
import { classService } from "../../services/classService";
import { teacherService } from "../../services/teacherService";
import type { Class } from "../../types/class.types";
import { useToast } from "../../../../hooks/useToast";

export const ClassesManagement = () => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; fullName: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  // Fetch classes from API
  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        ...(searchQuery && { search: searchQuery }),
        ...(levelFilter !== "All" && { level: levelFilter }),
        limit: 100,
      };

      const response = await classService.getAll(filters);
      setClasses(response.data);
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      setError(
        err.response?.data?.message || "Erreur lors du chargement des classes"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch teachers for the modal
  const fetchTeachers = async () => {
    try {
      const response = await teacherService.getAll({ limit: 100 });
      setTeachers(
        response.data.map((t: any) => ({
          id: t.id,
          fullName: t.fullName,
        }))
      );
    } catch (err) {
      console.error("Error fetching teachers:", err);
    }
  };

  // Fetch classes on mount and when filters change
  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, [searchQuery, levelFilter]);

  // Handlers
  const handleAddClass = () => {
    setSelectedClass(null);
    setIsClassModalOpen(true);
  };

  const handleEditClass = (cls: Class) => {
    setSelectedClass(cls);
    setIsClassModalOpen(true);
  };

  const handleDeleteClick = (cls: Class) => {
    setSelectedClass(cls);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedClass) return;

    try {
      await classService.delete(selectedClass.id);
      toast.success("Class deleted successfully");
      await fetchClasses(); 
      setIsDeleteModalOpen(false);
      setSelectedClass(null);
    } catch (err: any) {
      console.error("Error deleting class:", err);
      toast.error("Error deleting class");
    }
  };

  const handleSaveClass = async (classData: any) => {
    try {
      if (selectedClass) {
        // Update existing class
        await classService.update(selectedClass.id, classData);
        toast.success("Class updated successfully");
      } else {
        // Create new class
        await classService.create(classData);
        toast.success("Class created successfully");
      }

      await fetchClasses(); // Refresh list
      setIsClassModalOpen(false);
      setSelectedClass(null);
    } catch (err: any) {
      console.error("Error saving class:", err);
      toast.error(err.response?.data?.message || "Error saving class");
    }
  };

  // Transform classes for table display
  const tableClasses = classes.map((cls) => ({
    id: cls.id,
    name: cls.name,
    level: cls.level || "-",
    studentCount: cls._count?.students || 0,
    teacher: cls.teacher?.fullName || "-",
    academicYear: cls.academicYear || "-",
  }));

  return (
    <div className="animate-fadeIn">
      <div className="page-container">
        <div className="filters-bar">
          <div className="filters-bar-left">
            <div className="w-full-mobile">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search classes..."
              />
            </div>

            <div className="w-full-mobile">
              <CustomSelect
                value={levelFilter}
                onChange={setLevelFilter}
                options={[
                  "All",
                  ...(Array.from(
                    new Set(classes.map((c) => c.level).filter(Boolean))
                  ) as string[]),
                ]}
                placeholder="Filter by Level"
              />
            </div>
          </div>

          <div className="filters-bar-actions">
            <button
              onClick={handleAddClass}
              className="btn btn-primary flex items-center justify-center gap-2 w-full-mobile"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Add Class</span>
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

        {/* Classes Table */}
        {!loading && !error && (
          <ClassesTable
            classes={tableClasses}
            onEdit={(cls) =>
              handleEditClass(classes.find((c) => c.id === cls.id)!)
            }
            onDelete={(cls) =>
              handleDeleteClick(classes.find((c) => c.id === cls.id)!)
            }
          />
        )}

        <ClassModal
          isOpen={isClassModalOpen}
          onClose={() => setIsClassModalOpen(false)}
          onSave={handleSaveClass}
          classItem={selectedClass}
          teachers={teachers}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={selectedClass?.name}
          itemType="class"
        />
      </div>
    </div>
  );
};
