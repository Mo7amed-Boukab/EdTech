import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { CustomSelect } from "../../../../components/CustomSelect";

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classData: any) => void;
  classItem?: any;
  teachers?: { id: string; fullName: string }[];
}

export const ClassModal = ({
  isOpen,
  onClose,
  onSave,
  classItem,
  teachers = [],
}: ClassModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    academicYear: "",
    teacherId: "",
  });

  useEffect(() => {
    if (classItem) {
      setFormData({
        name: classItem.name || "",
        level: classItem.level || "",
        academicYear: classItem.academicYear || "",
        teacherId: classItem.teacher?.id || "",
      });
    } else {
      setFormData({
        name: "",
        level: "",
        academicYear: "",
        teacherId: "",
      });
    }
  }, [classItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const levelOptions = [
    { value: "A1", label: "A1" },
    { value: "A2", label: "A2" },
    { value: "B1", label: "B1" },
    { value: "B2", label: "B2" },
    { value: "C1", label: "C1" },
    { value: "C2", label: "C2" },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">
            {classItem ? "Edit Class" : "Add New Class"}
          </h3>
          <button onClick={onClose} className="modal-close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Class Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="form-input"
                placeholder="e.g. Terminale S1"
              />
            </div>

            <div className="form-group">
              <CustomSelect
                label="Level"
                value={formData.level}
                onChange={(val) => setFormData({ ...formData, level: val })}
                options={levelOptions}
                placeholder="Select a level..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Academic Year</label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) =>
                  setFormData({ ...formData, academicYear: e.target.value })
                }
                className="form-input"
                placeholder="e.g. 2025-2026"
              />
            </div>

            <div className="form-group">
              <CustomSelect
                label="Main Teacher"
                value={formData.teacherId}
                onChange={(val) => setFormData({ ...formData, teacherId: val })}
                options={teachers.map((t) => ({
                  value: t.id,
                  label: t.fullName,
                }))}
                placeholder="Select a teacher..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {classItem ? "Save Changes" : "Add Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
