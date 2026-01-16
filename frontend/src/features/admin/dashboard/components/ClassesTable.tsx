import { Edit2, Trash2, Users, GraduationCap } from "lucide-react";
import { ActionMenu } from "../../../../components/ActionMenu";

interface ClassItem {
  id: string;
  name: string;
  level: string;
  studentCount: number;
  teacher: string;
  academicYear: string;
}

interface ClassesTableProps {
  classes: ClassItem[];
  onEdit: (classItem: ClassItem) => void;
  onDelete: (classItem: ClassItem) => void;
}

export const ClassesTable = ({
  classes,
  onEdit,
  onDelete,
}: ClassesTableProps) => {
  return (
    <div className="card">
      <div className="table-responsive-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Class</th>
              <th className="hide-mobile">Level</th>
              <th className="hide-tablet">Main Teacher</th>
              <th>Students</th>
              <th className="text-left hide-mobile">Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  No classes found
                </td>
              </tr>
            ) : (
              classes.map((cls) => (
                <tr key={cls.id}>
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
                          onClick: () => onEdit(cls),
                        },
                        {
                          label: "Delete",
                          icon: <Trash2 size={16} />,
                          onClick: () => onDelete(cls),
                          variant: "danger",
                        },
                      ]}
                    />
                  </td>

                  <td data-label="Class" className="no-label">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                        <GraduationCap size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="cell-name truncate">{cls.name}</div>
                        <div className="cell-subtitle">{cls.academicYear}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Level" className="hide-mobile">
                    <span className="badge badge-neutral">
                      {cls.level || "-"}
                    </span>
                  </td>
                  <td data-label="Teacher" className="hide-tablet">
                    {cls.teacher || (
                      <span className="text-[var(--text-muted)]">
                        Not assigned
                      </span>
                    )}
                  </td>
                  <td data-label="Students">
                    <div className="flex items-center gap-1.5">
                      <Users
                        size={14}
                        className="text-[var(--text-muted)] flex-shrink-0"
                      />
                      <span>{cls.studentCount}</span>
                    </div>
                  </td>
                  <td className="text-left no-label hide-mobile">
                    <div className="action-btns-desktop flex items-center justify-start gap-2">
                      <button
                        onClick={() => onEdit(cls)}
                        className="action-btn edit"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(cls)}
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
