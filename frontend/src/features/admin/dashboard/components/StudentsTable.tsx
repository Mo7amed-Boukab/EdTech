import { Edit2, Trash2, GraduationCap } from "lucide-react";
import { ActionMenu } from "../../../../components/ActionMenu";

interface Student {
  id: string;
  fullName: string;
  email: string;
  class?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface StudentsTableProps {
  students: Student[];
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export const StudentsTable = ({
  students,
  onEdit,
  onDelete,
}: StudentsTableProps) => {
  return (
    <div className="card">
      <div className="table-responsive-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th className="hide-mobile">Registration Date</th>
              <th className="text-center hide-mobile">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-500">
                  No students found
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
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
                          onClick: () => onEdit(student),
                        },
                        {
                          label: "Delete",
                          icon: <Trash2 size={16} />,
                          onClick: () => onDelete(student),
                          variant: "danger",
                        },
                      ]}
                    />
                  </td>

                  <td data-label="Student" className="no-label">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 text-red-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {student.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="cell-name truncate">
                          {student.fullName}
                        </div>
                        <div className="cell-subtitle truncate">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Class">
                    {student.class ? (
                      <div className="flex items-center gap-1.5">
                        <GraduationCap
                          size={14}
                          className="text-[var(--text-muted)] flex-shrink-0"
                        />
                        <span className="font-medium truncate">
                          {student.class.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[var(--text-muted)] text-sm">
                        Not assigned
                      </span>
                    )}
                  </td>
                  <td
                    data-label="Date"
                    className="text-[var(--text-secondary)] hide-mobile"
                  >
                    {new Date(student.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="text-center no-label hide-mobile">
                    <div className="action-btns-desktop flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(student)}
                        className="action-btn edit"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(student)}
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

      {/* Pagination Footer */}
      {students.length > 0 && (
        <div className="table-footer">
          <span className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {students.length}
            </span>{" "}
            student(s)
          </span>
          <div className="pagination">
            <button className="pagination-btn" disabled>
              Previous
            </button>
            <button className="pagination-btn">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};
