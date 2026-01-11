import { useState, useEffect } from "react";
import { SearchInput } from "../../../../components/SearchInput";
import { CustomSelect } from "../../../../components/CustomSelect";
import { Users, GraduationCap, Loader2 } from "lucide-react";
import { teacherService } from "../../services/teacherService";
import type { TeacherClass } from "../../types/teacher.types";

export const MyClasses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [allClasses, setAllClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all classes initially to get all available levels
  useEffect(() => {
    const fetchAllClasses = async () => {
      try {
        const response = await teacherService.getMyClasses({ limit: 100 });
        setAllClasses(response.data);
      } catch (err: any) {
        console.error("Error fetching all classes:", err);
      }
    };

    fetchAllClasses();
  }, []);

  // Fetch classes from API
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        setError(null);

        const filters = {
          search: searchQuery || undefined,
          level: levelFilter !== "All" ? levelFilter : undefined,
          limit: 100,
        };

        const response = await teacherService.getMyClasses(filters);
        setClasses(response.data);
      } catch (err: any) {
        console.error("Error fetching classes:", err);
        setError(err.response?.data?.message || "Failed to load classes");
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [searchQuery, levelFilter]);

  // Get unique levels for filter from all classes, not filtered ones
  const levels = Array.from(
    new Set(
      allClasses.map((c) => c.level).filter((l): l is string => Boolean(l))
    )
  );

  return (
    <div className="animate-fadeIn">
      <div className="page-container">
        {/* Search and Filter Bar */}
        <div className="filters-bar">
          <div className="filters-bar-left">
            <div className="w-full-mobile">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search classes or subjects..."
              />
            </div>
            <div className="w-full-mobile">
              <CustomSelect
                value={levelFilter}
                onChange={setLevelFilter}
                options={["All", ...levels]}
                placeholder="Level"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="card">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#c41e3a]" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="card">
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Table Layout */}
        {!loading && !error && (
          <div className="card">
            <div className="table-responsive-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th className="hide-mobile">Level</th>
                    <th className="hide-mobile">Subject(s)</th>
                    <th>Students</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-8 text-gray-500"
                      >
                        No classes found
                      </td>
                    </tr>
                  ) : (
                    classes.map((cls) => (
                      <tr key={cls.id}>
                        <td data-label="Class" className="no-label">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                              <GraduationCap size={16} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 truncate">
                                {cls.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                {cls.academicYear || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td data-label="Level" className="hide-mobile">
                          <span className="status-badge bg-gray-100 text-gray-700">
                            {cls.level || "N/A"}
                          </span>
                        </td>
                        <td
                          data-label="Subject(s)"
                          className="text-gray-600 hide-mobile truncate"
                        >
                          {cls.subjects && cls.subjects.length > 0
                            ? cls.subjects.map((s) => s.name).join(", ")
                            : "No subjects"}
                        </td>
                        <td data-label="Students">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Users
                              size={14}
                              className="text-gray-400 shrink-0"
                            />
                            {cls._count?.students || 0}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        {!loading && !error && classes.length > 0 && (
          <div className="table-footer">
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium">{classes.length}</span>{" "}
              class(es)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
