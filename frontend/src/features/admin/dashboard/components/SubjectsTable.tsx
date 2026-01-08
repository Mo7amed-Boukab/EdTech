import { Edit2, Trash2, BookOpen, User, GraduationCap } from "lucide-react";
import { ActionMenu } from "../../../../components/ActionMenu";

interface Subject {
  id: string;
  name: string;
  class?: {
    name: string;
  };
  teacher?: {
    fullName: string;
  };
}

interface SubjectsTableProps {
  subjects: Subject[];
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

export const SubjectsTable = ({
  subjects,
  onEdit,
  onDelete,
}: SubjectsTableProps) => {
  return (
    <div className="card">
      <div className="table-responsive-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Class</th>
              <th className="hide-mobile">Teacher</th>
              <th className="text-center hide-mobile">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-500">
                  No subjects found
                </td>
              </tr>
            ) : (
              subjects.map((subject) => (
                <tr key={subject.id}>
                  {/* Mobile Action Menu */}
                  <td
                    className="action-menu-cell"
                    style={{ padding: 0, border: 0, width: 0 }}
                  >
                    <ActionMenu
                      actions={[
                        {
                          label: "Edit",
                          icon: <Edit2 size={16} />,
                          onClick: () => onEdit(subject),
                        },
                        {
                          label: "Delete",
                          icon: <Trash2 size={16} />,
                          onClick: () => onDelete(subject),
                          variant: "danger",
                        },
                      ]}
                    />
                  </td>

                  <td data-label="Subject" className="no-label">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#c41e3a] text-white flex items-center justify-center flex-shrink-0">
                        <BookOpen size={15} strokeWidth={2} />
                      </div>
                      <div className="cell-name truncate">{subject.name}</div>
                    </div>
                  </td>
                  <td data-label="Class">
                    <div className="flex items-center gap-2">
                      <GraduationCap
                        size={14}
                        className="text-[var(--text-muted)] flex-shrink-0"
                      />
                      <span className="truncate">
                        {subject.class?.name || (
                          <span className="text-[var(--text-muted)]">-</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td data-label="Teacher" className="hide-mobile">
                    <div className="flex items-center gap-2">
                      <User
                        size={14}
                        className="text-[var(--text-muted)] flex-shrink-0"
                      />
                      <span className="truncate">
                        {subject.teacher?.fullName || (
                          <span className="text-[var(--text-muted)]">-</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="text-center no-label hide-mobile">
                    <div className="action-btns-desktop flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(subject)}
                        className="action-btn edit"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(subject)}
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
  );
};
