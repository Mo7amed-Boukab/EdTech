import { useState, useEffect } from "react";
import { SearchInput } from "../../../../components/SearchInput";
import { CustomSelect } from "../../../../components/CustomSelect";
import { ActionMenu } from "../../../../components/ActionMenu";
import {
  Plus,
  Edit2,
  Trash2,
  Book,
  Loader2,
} from "lucide-react";
import { useToast } from "../../../../hooks/useToast";
import { useAuth } from "../../../../context/AuthContext";
import { DeleteConfirmationModal } from "../../../../components/DeleteConfirmationModal";
import { SubjectModal } from "../../../../features/admin/dashboard/components/SubjectModal";
import { subjectService } from "../../../../features/admin/services/subjectService";
import { teacherService } from "../../services/teacherService";
import type { Subject, CreateSubjectDto, UpdateSubjectDto } from "../../../../features/admin/types/subject.types";
import type { TeacherClass } from "../../types/teacher.types";

export const TeacherSubjects = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch teacher's classes
      const classesRes = await teacherService.getMyClasses({ limit: 100 });
      setClasses(classesRes.data);

      // Fetch subjects assigned to this teacher (using teacherId filter)
      if (user?.id) {
        const subjectsRes = await subjectService.getAll({
          teacherId: user.id,
          limit: 100
        });
        setSubjects(subjectsRes.data);
      } else {
        setSubjects([]);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError("Failed to load subjects");
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (subject.class?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass =
      classFilter === "All" || subject.class?.name === classFilter;
    return matchesSearch && matchesClass;
  });

  const classNames = Array.from(new Set(classes.map((c) => c.name)));

  const handleEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const handleDelete = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeleteModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedSubject(null);
    setIsModalOpen(true);
  };

  const handleSave = async (data: CreateSubjectDto | UpdateSubjectDto) => {
    try {
      // Clean up empty strings - convert to undefined for optional fields
      const cleanedData = {
        name: data.name,
        classId: data.classId || undefined,
        teacherId: user?.id || undefined,
      };

      if (selectedSubject) {
        await subjectService.update(selectedSubject.id, cleanedData as UpdateSubjectDto);
        toast.success("Subject updated successfully");
      } else {
        await subjectService.create(cleanedData as CreateSubjectDto);
        toast.success("Subject created successfully");
      }
      fetchData();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error saving subject:", err);
      toast.error(err.response?.data?.message || "Failed to save subject");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSubject) return;
    try {
      await subjectService.delete(selectedSubject.id);
      toast.success("Subject deleted successfully");
      fetchData();
      setIsDeleteModalOpen(false);
      setSelectedSubject(null);
    } catch (err: any) {
      console.error("Error deleting subject:", err);
      toast.error(err.response?.data?.message || "Failed to delete subject");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">

      <div className="page-container">
        {/* Filters and Actions */}
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
                options={["All", ...classNames]}
                placeholder="Class"
              />
            </div>
          </div>

          <div className="filters-bar-actions">
            <button
              onClick={handleAdd}
              className="btn btn-primary flex items-center justify-center gap-2 w-full-mobile"
            >
              <Plus size={18} />
              <span>Add Subject</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-responsive-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class</th>
                  <th className="text-center hide-mobile">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500">
                      No subjects found
                    </td>
                  </tr>
                ) : (
                  filteredSubjects.map((subject) => (
                    <tr key={subject.id}>
                      <td data-label="Name">
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="w-8 h-8 rounded bg-red-50 text-red-700 flex items-center justify-center flex-shrink-0">
                            <Book size={15} strokeWidth={2} />
                          </div>
                          <span className="font-medium">{subject.name}</span>
                        </div>
                        {/* Mobile Action Menu */}
                        <div className="show-mobile">
                          <ActionMenu
                            actions={[
                              {
                                label: "Edit",
                                icon: <Edit2 size={16} />,
                                onClick: () => handleEdit(subject),
                              },
                              {
                                label: "Delete",
                                icon: <Trash2 size={16} />,
                                onClick: () => handleDelete(subject),
                                variant: "danger",
                              },
                            ]}
                          />
                        </div>
                      </td>
                      <td data-label="Class">
                        <span className="status-badge bg-red-50 text-red-700">
                          {subject.class?.name || "Unassigned"}
                        </span>
                      </td>
                      <td className="text-center no-label hide-mobile">
                        <div className="action-btns-desktop flex items-center justify-center gap-2 w-full h-full">
                          <button
                            onClick={() => handleEdit(subject)}
                            className="action-btn edit"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(subject)}
                            className="action-btn delete"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        {filteredSubjects.length > 0 && (
          <div className="table-footer">
            <span className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium">{filteredSubjects.length}</span>{" "}
              subject(s)
            </span>
          </div>
        )}
      </div>

      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        subject={selectedSubject || undefined}
        availableClasses={classes.map(c => ({ id: c.id, name: c.name }))}
        hideTeacher={true}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedSubject?.name || ""}
        itemType="subject"
      />
    </div>
  );
};
