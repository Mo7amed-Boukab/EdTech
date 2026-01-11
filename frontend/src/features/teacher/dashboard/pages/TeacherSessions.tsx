import { useState, useEffect } from "react";
import { SearchInput } from "../../../../components/SearchInput";
import { CustomSelect } from "../../../../components/CustomSelect";
import { ActionMenu } from "../../../../components/ActionMenu";
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  BookOpen,
  Loader2,
  MapPin,
} from "lucide-react";
import { SessionModal } from "../components/SessionModal";
import { DeleteConfirmationModal } from "../../../../components/DeleteConfirmationModal";
import { teacherService } from "../../services/teacherService";
import type { Session } from "../../types/session.types";
import type { TeacherClass } from "../../types/teacher.types";
import { useToast } from "../../../../hooks/useToast";

export const TeacherSessions = () => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch classes and sessions
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchClasses(), fetchSessions()]);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await teacherService.getMyClasses({ limit: 100 });
      setClasses(response.data || []);
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      // Don't block UI for class fetch fail, just log it
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teacherService.getSessions({ limit: 100 });
      setSessions(response.data || []);
    } catch (err: any) {
      console.error("Error fetching sessions:", err);
      setError(err.response?.data?.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  // Get unique subjects from classes
  // Each class has subjects, so we map them out effectively
  const availableSubjects = classes.flatMap((cls) =>
    (cls.subjects || []).map(sub => ({ ...sub, classId: cls.id }))
  );

  const uniqueSubjectsMap = new Map();
  availableSubjects.forEach(s => {
    if (!uniqueSubjectsMap.has(s.id)) {
      uniqueSubjectsMap.set(s.id, s);
    }
  });
  const uniqueSubjects = Array.from(uniqueSubjectsMap.values());

  // Filter logic
  const filteredSessions = sessions.filter((session) => {
    const subjectName = session.subject?.name || "";
    const className = session.class?.name || "";

    const matchesSearch =
      subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      className.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass =
      classFilter === "All" || className === classFilter;

    return matchesSearch && matchesClass;
  });

  const classNames = Array.from(new Set(sessions.map((s) => s.class?.name).filter(Boolean)));

  const handleEdit = (session: Session) => {
    setSelectedSession(session);
    setIsSessionModalOpen(true);
  };

  const handleDelete = (session: Session) => {
    setSelectedSession(session);
    setIsDeleteModalOpen(true);
  };

  const handleAddSession = () => {
    setSelectedSession(null);
    setIsSessionModalOpen(true);
  };

  const handleSaveSession = async (sessionData: any) => {
    try {
      if (selectedSession) {
        await teacherService.updateSession(selectedSession.id, sessionData);
        toast.success("Session updated successfully");
      } else {
        await teacherService.createSession(sessionData);
        toast.success("Session created successfully");
      }
      fetchSessions();
      setIsSessionModalOpen(false);
    } catch (err: any) {
      console.error("Error saving session:", err);
      toast.error(err.response?.data?.message || "Failed to save session");
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSession) return;
    try {
      await teacherService.deleteSession(selectedSession.id);
      toast.success("Session deleted successfully");
      fetchSessions();
      setIsDeleteModalOpen(false);
      setSelectedSession(null);
    } catch (err: any) {
      console.error("Error deleting session:", err);
      toast.error(err.response?.data?.message || "Failed to delete session");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
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
                placeholder="Search sessions..."
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
              onClick={handleAddSession}
              className="btn btn-primary flex items-center justify-center gap-2 w-full-mobile"
            >
              <Plus size={18} />
              <span>Add Session</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-responsive-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Class</th>
                  <th className="hide-mobile">Subject</th>
                  <th className="hide-mobile">Time</th>
                  <th className="hide-tablet">Room</th>
                  <th className="text-center hide-mobile">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No sessions found
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session) => (
                    <tr key={session.id}>
                      <td data-label="Date" className="no-label">
                        {/* Mobile Action Menu */}
                        <div className="show-mobile">
                          <ActionMenu
                            actions={[
                              {
                                label: "Edit",
                                icon: <Edit2 size={16} />,
                                onClick: () => handleEdit(session),
                              },
                              {
                                label: "Delete",
                                icon: <Trash2 size={16} />,
                                onClick: () => handleDelete(session),
                                variant: "danger",
                              },
                            ]}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="capitalize">
                            {formatDate(session.date)}
                          </span>
                        </div>
                      </td>
                      <td data-label="Class">
                        <span className="status-badge bg-red-50 text-red-700">
                          {session.class?.name || 'N/A'}
                        </span>
                      </td>
                      <td data-label="Subject" className="hide-mobile">
                        <div className="flex items-center gap-2 text-gray-700">
                          <BookOpen size={14} className="text-gray-400" />
                          {session.subject?.name || 'N/A'}
                        </div>
                      </td>
                      <td data-label="Time" className="hide-mobile">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock size={14} className="text-gray-400" />
                          {session.startTime} – {session.endTime}
                        </div>
                      </td>
                      <td data-label="Room" className="hide-tablet">
                        <div className="flex items-center gap-2 text-gray-700">
                          <MapPin size={14} className="text-gray-400" />
                          {session.room}
                        </div>
                      </td>
                      <td className="text-center no-label hide-mobile">
                        <div className="action-btns-desktop flex items-center justify-center gap-2 w-full h-full">
                          <button
                            onClick={() => handleEdit(session)}
                            className="action-btn edit"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(session)}
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
        {filteredSessions.length > 0 && (
          <div className="table-footer">
            <span className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium">{filteredSessions.length}</span>{" "}
              session(s)
            </span>
          </div>
        )}
      </div>

      {/* Modals */}
      <SessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onSave={handleSaveSession}
        session={selectedSession || undefined}
        availableClasses={classes}
        availableSubjects={uniqueSubjects}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={
          selectedSession
            ? `${selectedSession.class?.name} - ${selectedSession.subject?.name}`
            : ""
        }
        itemType="session"
      />
    </div>
  );
};
