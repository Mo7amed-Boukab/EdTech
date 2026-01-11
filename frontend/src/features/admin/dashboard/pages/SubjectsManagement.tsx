import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { SearchInput } from "../../../../components/SearchInput";
import { CustomSelect } from "../../../../components/CustomSelect";
import { SubjectsTable } from "../components/SubjectsTable";
import { SubjectModal } from "../components/SubjectModal";
import { DeleteConfirmationModal } from "../../../../components/DeleteConfirmationModal";
import { subjectService } from "../../services/subjectService";
import { classService } from "../../services/classService";
import { teacherService } from "../../services/teacherService";
import type { Subject } from "../../types/subject.types";
import type { Class } from "../../types/class.types";
import { useToast } from "../../../../hooks/useToast";

export const SubjectsManagement = () => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("All");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<{ id: string; fullName: string }[]>(
    []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        limit: 100,
        ...(searchQuery && { search: searchQuery }),
        ...(classFilter !== "All" && { classId: classFilter }),
      };

      // Fetch subjects, classes, and teachers in parallel
      const [subjectsRes, classesRes, teachersRes] = await Promise.all([
        subjectService.getAll(filters),
        classService.getAll({ limit: 100 }),
        teacherService.getAll({ limit: 100 }),
      ]);

      setSubjects(subjectsRes.data);
      setClasses(classesRes.data);
      setTeachers(
        teachersRes.data.map((t: any) => ({
          id: t.id,
          fullName: t.fullName,
        }))
      );
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
  const handleAddSubject = () => {
    setSelectedSubject(null);
    setIsSubjectModalOpen(true);
  };

  const handleEditSubject = (sub: any) => {
    setSelectedSubject(sub);
    setIsSubjectModalOpen(true);
  };

  const handleDeleteClick = (sub: any) => {
    setSelectedSubject(sub);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSubject) return;
    try {
      await subjectService.delete(selectedSubject.id);
      toast.success("Subject deleted successfully");
      await fetchData();
      setIsDeleteModalOpen(false);
      setSelectedSubject(null);
    } catch (err: any) {
      console.error("Error deleting subject:", err);
      toast.error("Error deleting subject");
    }
  };

  const handleSaveSubject = async (subjectData: any) => {
    try {
      if (selectedSubject) {
        // Update
        await subjectService.update(selectedSubject.id, subjectData);
        toast.success("Subject updated successfully");
      } else {
        // Create
        await subjectService.create(subjectData);
        toast.success("Subject created successfully");
      }
      await fetchData();
      setIsSubjectModalOpen(false);
      setSelectedSubject(null);
    } catch (err: any) {
      console.error("Error saving subject:", err);
      toast.error(err.response?.data?.message || "Error saving subject");
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-container">
        <div className="filters-bar">
          <div className="filters-bar-left">
            <div className="w-full-mobile">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subjects..."
              />
            </div>
            <div className="w-full-mobile">
              <CustomSelect
                value={classFilter}
                onChange={setClassFilter}
                options={[
                  "All",
                  ...classes.map((c) => ({ value: c.id, label: c.name })),
                ]}
                placeholder="Filter by Class"
              />
            </div>
          </div>

          <div className="filters-bar-actions">
            <button
              onClick={handleAddSubject}
              className="btn btn-primary flex items-center justify-center gap-2 w-full-mobile"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Add Subject</span>
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
          <SubjectsTable
            subjects={subjects}
            onEdit={handleEditSubject}
            onDelete={handleDeleteClick}
          />
        )}

        <SubjectModal
          isOpen={isSubjectModalOpen}
          onClose={() => setIsSubjectModalOpen(false)}
          onSave={handleSaveSubject}
          subject={selectedSubject}
          availableClasses={classes.map((c) => ({ id: c.id, name: c.name }))}
          availableTeachers={teachers}
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={selectedSubject?.name}
          itemType="subject"
        />
      </div>
    </div>
  );
};
