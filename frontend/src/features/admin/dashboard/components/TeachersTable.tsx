import { Edit2, Trash2, Mail } from "lucide-react";
import { ActionMenu } from "../../../../components/ActionMenu";

interface Teacher {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  assignedClasses?: { id: string; name: string }[];
}

interface TeachersTableProps {
  teachers: Teacher[];
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
}

export const TeachersTable = ({
  teachers,
  onEdit,
  onDelete,
}: TeachersTableProps) => {
  return (
    <div className="card">
      <div className="table-responsive-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Teacher</th>
              <th className="hide-mobile">Contact</th>
              <th className="hide-tablet">Assigned Classes</th>
              <th className="text-left hide-mobile">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-500">
                  No teachers found
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher.id}>
                  {/* Mobile Action Menu */}
                  {/* Mobile Action Menu is positioned absolutely by the table styles usually, or we can keep it here.
                      The previous implementation had a specific cell for it.
                      To match the image EXACTLY (menu top right), we might need to ensure the ActionMenu is positioned correctly.
                      For now, we keep the ActionMenu cell but ensure the content cell expands correctly.
                  */}
                  <td
                    className="action-menu-cell"
                    style={{ padding: 0, border: 0, width: 0 }}
                  >
                    <ActionMenu
                      actions={[
                        {
                          label: "Edit",
                          icon: <Edit2 size={16} />,
                          onClick: () => onEdit(teacher),
                        },
                        {
                          label: "Delete",
                          icon: <Trash2 size={16} />,
                          onClick: () => onDelete(teacher),
                          variant: "danger",
                        },
                      ]}
                    />
                  </td>

                  <td data-label="Teacher" className="no-label">
                    <div className="flex flex-col md:block">
                      {/* Top Section: Avatar + Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-50 text-red-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {teacher.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="cell-name truncate">
                            {teacher.fullName}
                          </div>
                          <div className="cell-subtitle truncate">
                            <span className="text-[var(--text-muted)] md:hidden">
                              {teacher.email}
                            </span>
                            <span className="hidden md:inline">
                              ID: ...{teacher.id.toString().slice(-4)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Divider & Bottom Section */}
                      <div className="md:hidden mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          CLASS
                        </span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {teacher.assignedClasses &&
                            teacher.assignedClasses.length > 0 ? (
                            teacher.assignedClasses.map((cls, idx) => (
                              <span
                                key={cls.id || idx}
                                className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded"
                              >
                                {cls.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">
                              No classes
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Contact" className="hide-mobile">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Mail
                          size={13}
                          className="text-[var(--text-muted)] flex-shrink-0"
                        />
                        <span className="truncate">{teacher.email}</span>
                      </div>
                      <div className="cell-subtitle pl-5">
                        {teacher.phone || "-"}
                      </div>
                    </div>
                  </td>
                  <td data-label="Classes" className="hide-tablet">
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.assignedClasses &&
                        teacher.assignedClasses.length > 0 ? (
                        teacher.assignedClasses.map((cls, idx) => (
                          <span
                            key={cls.id || idx}
                            className="badge badge-primary"
                          >
                            {cls.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[var(--text-muted)] text-sm">
                          No classes
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-left no-label hide-mobile">
                    <div className="action-btns-desktop flex items-center justify-start gap-2">
                      <button
                        onClick={() => onEdit(teacher)}
                        className="action-btn edit"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(teacher)}
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

      {/* Pagination Removed */}
    </div>
  );
};
