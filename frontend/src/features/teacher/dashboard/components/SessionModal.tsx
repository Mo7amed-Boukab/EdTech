import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { CustomSelect } from "../../../../components/CustomSelect";
import type {
  Session,
  CreateSessionDto,
  UpdateSessionDto,
} from "../../types/session.types";
import { useToast } from "../../../../hooks/useToast";

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateSessionDto | UpdateSessionDto) => void;
  session?: Session;
  availableClasses: { id: string; name: string }[];
  availableSubjects: { id: string; name: string; classId?: string }[];
}

export const SessionModal = ({
  isOpen,
  onClose,
  onSave,
  session,
  availableClasses,
  availableSubjects,
}: SessionModalProps) => {
  const { error: toastError } = useToast();
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    room: "",
    classId: "",
    subjectId: "",
  });

  useEffect(() => {
    if (session) {
      const sessionDate = new Date(session.date);
      const dateStr = !isNaN(sessionDate.getTime())
        ? sessionDate.toISOString().split("T")[0]
        : "";

      setFormData({
        date: dateStr,
        startTime: session.startTime,
        endTime: session.endTime,
        room: session.room,
        classId: session.class?.id || session.classId,
        subjectId: session.subject?.id || session.subjectId,
      });
    } else {
      setFormData({
        date: "",
        startTime: "",
        endTime: "",
        room: "",
        classId: "",
        subjectId: "",
      });
    }
  }, [session, isOpen]);

  // Filter subjects based on selected class
  const filteredSubjects = formData.classId
    ? availableSubjects.filter(
      (subject) =>
        !subject.classId || subject.classId === formData.classId
    )
    : availableSubjects;

  // Handle class selection
  const handleClassChange = (classId: string) => {
    setFormData((prev) => {
      const newData = { ...prev, classId };

      // If current subject doesn't belong to new class, reset it
      if (prev.subjectId) {
        const selectedSubject = availableSubjects.find(
          (s) => s.id === prev.subjectId
        );
        if (
          selectedSubject?.classId &&
          selectedSubject.classId !== classId
        ) {
          newData.subjectId = "";
        }
      }
      return newData;
    });
  };

  // Handle subject selection
  const handleSubjectChange = (subjectId: string) => {
    const selectedSubject = availableSubjects.find(
      (s) => s.id === subjectId
    );

    setFormData((prev) => {
      const newData = { ...prev, subjectId };
      // If subject has a classId, auto-select that class
      if (selectedSubject?.classId) {
        newData.classId = selectedSubject.classId;
      }
      return newData;
    });
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.classId || !formData.subjectId) {
      toastError("Please select both class and subject");
      return;
    }

    // Ensure date is in ISO format (YYYY-MM-DD)
    const sessionData = {
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      room: formData.room.trim(),
      classId: formData.classId,
      subjectId: formData.subjectId,
    };

    onSave(sessionData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">
            {session ? "Edit Session" : "Add New Session"}
          </h3>
          <button onClick={onClose} className="modal-close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="form-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Start Time</label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Time</label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="form-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <CustomSelect
                  label="Class"
                  value={formData.classId}
                  onChange={handleClassChange}
                  options={availableClasses.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  placeholder="Select..."
                />
              </div>
              <div className="form-group">
                <CustomSelect
                  label="Subject"
                  value={formData.subjectId}
                  onChange={handleSubjectChange}
                  options={filteredSubjects.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  placeholder="Select..."
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Room</label>
              <input
                type="text"
                required
                value={formData.room}
                onChange={(e) =>
                  setFormData({ ...formData, room: e.target.value })
                }
                className="form-input"
                placeholder="e.g. Room 101"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {session ? "Save Changes" : "Add Session"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
