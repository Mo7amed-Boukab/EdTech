import { useState, useEffect } from "react";
import { Check, X, Clock, Search, Calendar, FileText, Loader2 } from "lucide-react";
import { CustomSelect } from "../../../../components/CustomSelect";
import { studentService, type StudentAttendanceRecord } from "../../services/studentService";

export const StudentAttendance = () => {
  const [records, setRecords] = useState<StudentAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const data = await studentService.getAttendanceHistory();
        setRecords(data);
      } catch (error) {
        console.error("Failed to fetch attendance history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  // Extract unique values for filters
  const SUBJECTS = [...new Set(records.map((a) => a.subject))];
  const STATUSES = ["All", "PRESENT", "ABSENT", "LATE"];

  // Filter attendance records
  const filteredRecords = records.filter((record) => {
    if (
      searchQuery &&
      !record.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !record.teacher.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    if (subjectFilter && record.subject !== subjectFilter) return false;
    if (
      statusFilter &&
      statusFilter !== "All" &&
      record.status !== statusFilter
    )
      return false;
    if (dateFilter && record.date !== dateFilter) return false;
    return true;
  });

  // Group by date
  const groupedByDate = filteredRecords.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = [];
    }
    acc[record.date].push(record);
    return acc;
  }, {} as Record<string, StudentAttendanceRecord[]>);

  // Count totals
  const totalPresent = filteredRecords.filter(
    (r) => r.status === "PRESENT"
  ).length;
  const totalAbsent = filteredRecords.filter(
    (r) => r.status === "ABSENT"
  ).length;
  const totalLate = filteredRecords.filter((r) => r.status === "LATE").length;
  const justifiedCount = filteredRecords.filter(
    (r) => r.justified === true
  ).length;
  const unjustifiedCount = filteredRecords.filter(
    (r) => r.justified === false
  ).length;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-[var(--primary)]" size={48} />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="page-container">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="card bg-white">
            <div className="card-body p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] mb-2">
                    Present
                  </p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {totalPresent}
                  </p>
                </div>
                <div className="w-10 h-10 rounded flex items-center justify-center bg-[var(--success)]/10">
                  <Check size={20} className="text-[var(--success)]" />
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-white">
            <div className="card-body p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] mb-2">
                    Absent
                  </p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {totalAbsent}
                  </p>
                </div>
                <div className="w-10 h-10 rounded flex items-center justify-center bg-[var(--danger)]/10">
                  <X size={20} className="text-[var(--danger)]" />
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-white">
            <div className="card-body p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] mb-2">
                    Late
                  </p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {totalLate}
                  </p>
                </div>
                <div className="w-10 h-10 rounded flex items-center justify-center bg-[var(--warning)]/10">
                  <Clock size={20} className="text-[var(--warning)]" />
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-white">
            <div className="card-body p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)] mb-2">
                    Justified
                  </p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {justifiedCount}/{justifiedCount + unjustifiedCount}
                  </p>
                </div>
                <div className="w-10 h-10 rounded flex items-center justify-center bg-[var(--primary)]/10">
                  <FileText size={20} className="text-[var(--primary)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="filters-bar">
          <div className="filters-bar-left">
            {/* Search */}
            <div className="search-input-wrapper w-full-mobile">
              <Search size={16} className="text-[var(--text-muted)] shrink-0" />
              <input
                type="text"
                placeholder="Search subject or teacher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Date Filter */}
            <div className="search-input-wrapper w-full-mobile">
              <Calendar
                size={16}
                className="text-[var(--text-muted)] shrink-0"
              />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-[var(--text-primary)] flex-1"
              />
            </div>

            {/* Subject Filter */}
            <div className="w-full-mobile hide-mobile">
              <CustomSelect
                value={subjectFilter}
                onChange={setSubjectFilter}
                options={[
                  { value: "", label: "All Subjects" },
                  ...SUBJECTS.map((s) => ({ value: s, label: s })),
                ]}
                placeholder="All Subjects"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full-mobile">
              <CustomSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={STATUSES.map((s) => ({
                  value: s === "All" ? "" : s,
                  label: s,
                }))}
                placeholder="All Statuses"
              />
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="card bg-white">
          <div className="table-responsive-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="min-w-[220px]">Date</th>
                  <th className="min-w-[140px]">Time</th>
                  <th className="w-[18%]">Subject</th>
                  <th className="w-[18%]">Teacher</th>
                  <th className="w-[18%]">Room</th>
                  <th className="text-center w-[150px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(groupedByDate).length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-8 text-[var(--text-muted)]"
                    >
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  Object.entries(groupedByDate).map(([date, records]) =>
                    records.map((record, recordIndex) => (
                      <tr key={record.id}>
                        {/* Date - Only show for first record of each date */}
                        {recordIndex === 0 ? (
                          <td
                            rowSpan={records.length}
                            className="font-medium text-[var(--text-primary)] bg-[var(--bg-light)] align-top"
                          >
                            {formatDate(date)}
                          </td>
                        ) : null}

                        {/* Time */}
                        <td className="text-[var(--text-secondary)]">
                          {record.time}
                        </td>

                        {/* Subject */}
                        <td>
                          <span className="font-medium text-[var(--text-primary)]">
                            {record.subject}
                          </span>
                        </td>

                        {/* Teacher */}
                        <td className="text-[var(--text-secondary)]">
                          {record.teacher}
                        </td>

                        {/* Room */}
                        <td>
                          <span className="px-2 py-1 bg-[var(--bg-main)] text-[var(--text-secondary)] text-xs font-medium">
                            {record.room}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={`status-badge ${record.status === "PRESENT"
                                ? "success"
                                : record.status === "ABSENT"
                                  ? "danger"
                                  : record.status === "LATE"
                                    ? "warning"
                                    : "neutral" // Handle null/upcoming
                                }`}
                            >
                              {record.status === "PRESENT" && (
                                <Check size={12} />
                              )}
                              {record.status === "ABSENT" && <X size={12} />}
                              {record.status === "LATE" && <Clock size={12} />}
                              {/* If null/upcoming, show - or Pending */}
                              {!record.status ? "Pending" : record.status}
                            </span>
                            {record.justified !== null && (
                              <span
                                className={`text-xs ${record.justified
                                  ? "text-[var(--success)]"
                                  : "text-[var(--danger)]"
                                  }`}
                              >
                                {record.justified
                                  ? "(Justified)"
                                  : "(Unjustified)"}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
