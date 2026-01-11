import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { CustomSelect } from "../../../../components/CustomSelect";

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subjectData: any) => void;
  subject?: any;
  availableClasses?: { id: string; name: string }[];
  availableTeachers?: { id: string; fullName: string }[];
  hideTeacher?: boolean;
}

export const SubjectModal = ({
  isOpen,
  onClose,
  onSave,
  subject,
  availableClasses = [],
  availableTeachers = [],
  hideTeacher = false,
}: SubjectModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    classId: "",
    teacherId: "",
  });

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name,
        classId: subject.class?.id || "",
        teacherId: subject.teacher?.id || "",
      });
    } else {
      setFormData({
        name: "",
        classId: "",
        teacherId: "",
      });
    }
  }, [subject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">
            {subject ? "Edit Subject" : "Add New Subject"}
          </h3>
          <button onClick={onClose} className="modal-close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Subject Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="form-input"
                placeholder="e.g. Mathematics"
              />
            </div>

            <div className="form-group">
              <CustomSelect
                label="Class"
                value={formData.classId}
                onChange={(val) => setFormData({ ...formData, classId: val })}
                options={availableClasses.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                placeholder="Select a class..."
              />
            </div>

            {!hideTeacher && (
              <div className="form-group">
                <CustomSelect
                  label="Teacher"
                  value={formData.teacherId}
                  onChange={(val) => setFormData({ ...formData, teacherId: val })}
                  options={availableTeachers.map((t) => ({
                    value: t.id,
                    label: t.fullName,
                  }))}
                  placeholder="Select a teacher..."
                />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {subject ? "Save Changes" : "Add Subject"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
