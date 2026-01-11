import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Clock,
  Loader2,
} from "lucide-react";
import { studentService, type StudentDashboardStats } from "../../services/studentService";

// Types for absence data
interface AbsenceRecord {
  id: string; // Changed to string to match backend
  subject: string;
  justified: boolean;
}

interface DayAbsences {
  date: number;
  records: AbsenceRecord[];
}

export const StudentOverview = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayAbsences | null>(null);

  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await studentService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch student dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
    setSelectedDay(null);
  };
  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
    setSelectedDay(null);
  };

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-[var(--primary)]" size={48} />
      </div>
    );
  }

  // Use fetched data
  const { attendanceData, absenceData, todaySchedule } = stats;

  // Calculate percentages for pie chart
  // Prevent division by zero
  const totalForCalc = attendanceData.total || 1;
  const presentPercent = (attendanceData.present / totalForCalc) * 100;
  const absentPercent = (attendanceData.absent / totalForCalc) * 100;
  const latePercent = (attendanceData.late / totalForCalc) * 100;

  // SVG arc calculation for pie chart
  const circumference = 2 * Math.PI * 40;
  const presentArc = (presentPercent / 100) * circumference;
  const absentArc = (absentPercent / 100) * circumference;
  const lateArc = (latePercent / 100) * circumference;

  // Get absence status for a day
  const getAbsenceStatus = (
    day: number
  ): "justified" | "unjustified" | "mixed" | null => {
    const absences = absenceData[day];
    if (!absences || absences.length === 0) return null;

    const hasJustified = absences.some((s) => s.justified);
    const hasUnjustified = absences.some((s) => !s.justified);

    if (hasJustified && hasUnjustified) return "mixed";
    if (hasJustified) return "justified";
    return "unjustified";
  };

  // Handle day click
  const handleDayClick = (day: number) => {
    const absences = absenceData[day];
    if (absences && absences.length > 0) {
      setSelectedDay({ date: day, records: absences });
    } else {
      setSelectedDay(null);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="p-7 max-md:p-4 max-md:pt-5">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* ATTENDANCE SECTION */}
          <div className="bg-white border border-gray-200">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-[13px] font-semibold text-gray-900 uppercase tracking-wide">
                My Attendance
              </h2>
            </div>

            <div className="p-4">
              {/* Chart & Legend */}
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Donut Chart */}
                <div className="relative w-[180px] h-[180px]">
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full h-full -rotate-90"
                  >
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#F3F4F6"
                      strokeWidth="10"
                    />
                    {/* Present (green) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#22C55E"
                      strokeWidth="10"
                      strokeDasharray={`${presentArc} ${circumference}`}
                      strokeDashoffset="0"
                    />
                    {/* Absent (red) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="10"
                      strokeDasharray={`${absentArc} ${circumference}`}
                      strokeDashoffset={`${-presentArc}`}
                    />
                    {/* Late (orange) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="10"
                      strokeDasharray={`${lateArc} ${circumference}`}
                      strokeDashoffset={`${-(presentArc + absentArc)}`}
                    />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-[var(--text-primary)]">
                      {attendanceData.total}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      Sessions
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#22C55E]"></span>
                    <span className="text-sm text-gray-500">
                      Present ({attendanceData.present})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#EF4444]"></span>
                    <span className="text-sm text-gray-500">
                      Absent ({attendanceData.absent})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#F59E0B]"></span>
                    <span className="text-sm text-gray-500">
                      Late ({attendanceData.late})
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Check size={14} className="text-green-600" />
                    <span className="text-xs text-gray-400 uppercase">
                      Present
                    </span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">
                    {attendanceData.present}
                  </span>
                </div>
                <div className="text-center border-l border-r border-gray-200">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <X size={14} className="text-red-600" />
                    <span className="text-xs text-gray-400 uppercase">
                      Absent
                    </span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">
                    {attendanceData.absent}
                  </span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock size={14} className="text-orange-500" />
                    <span className="text-xs text-gray-400 uppercase">
                      Late
                    </span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">
                    {attendanceData.late}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CALENDAR SECTION - My Absences */}
          <div className="bg-white border border-gray-200">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-[13px] font-semibold text-gray-900 uppercase tracking-wide">
                My Absences Calendar
              </h2>
            </div>

            <div className="p-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  onClick={prevMonth}
                  className="p-1 hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={20} className="text-gray-400" />
                </button>
                <h3 className="text-base font-semibold text-gray-800 min-w-[160px] text-center capitalize">
                  {monthName}
                </h3>
                <button
                  onClick={nextMonth}
                  className="p-1 hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight size={20} className="text-gray-400" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-xs font-medium text-gray-400 py-2"
                    >
                      {day}
                    </div>
                  )
                )}

                {/* Empty cells for days before month starts */}
                {Array.from({ length: startingDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="py-2"></div>
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const status = getAbsenceStatus(day);
                  const isSelected = selectedDay?.date === day;

                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`
                                                relative py-2 text-sm font-medium transition-colors
                                                ${status === "justified"
                          ? "bg-green-600/20 text-green-600"
                          : ""
                        }
                                                ${status === "unjustified"
                          ? "bg-red-600/20 text-red-600"
                          : ""
                        }
                                                ${status === "mixed"
                          ? "bg-orange-500/20 text-orange-500"
                          : ""
                        }
                                                ${!status
                          ? "text-gray-500 hover:bg-gray-100"
                          : ""
                        }
                                                ${isSelected
                          ? "ring-2 ring-[#c41e3a]"
                          : ""
                        }
                                            `}
                    >
                      {day}
                      {status && (
                        <span
                          className={`
                                                    absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1
                                                    ${status === "justified"
                              ? "bg-green-600"
                              : ""
                            }
                                                    ${status === "unjustified"
                              ? "bg-red-600"
                              : ""
                            }
                                                    ${status === "mixed"
                              ? "bg-orange-500"
                              : ""
                            }
                                                `}
                        ></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-600/30"></span>
                  <span className="text-xs text-gray-400">Justified</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-600/30"></span>
                  <span className="text-xs text-gray-400">Unjustified</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-orange-500/30"></span>
                  <span className="text-xs text-gray-400">Mixed</span>
                </div>
              </div>

              {/* Selected Day Details */}
              {selectedDay && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    Absences on {selectedDay.date} {monthName}
                  </h4>
                  <div className="space-y-2">
                    {selectedDay.records.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-500">{record.subject}</span>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 ${record.justified
                              ? "bg-green-600/10 text-green-600"
                              : "bg-red-600/10 text-red-600"
                            }`}
                        >
                          {record.justified ? "Justified" : "Unjustified"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white border border-gray-200 mt-6">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-gray-50">
            <h2 className="text-[13px] font-semibold text-gray-900 uppercase tracking-wide">
              Today's Schedule
            </h2>
          </div>
          <div className="p-0">
            {todaySchedule.length === 0 ? (
              <div className="p-8 text-center text-[var(--text-muted)]">
                No classes scheduled for today.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Room</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todaySchedule.map((item, i) => (
                    <tr key={i}>
                      <td className="font-medium text-gray-800">{item.time}</td>
                      <td className="text-gray-500">{item.subject}</td>
                      <td className="text-gray-500">{item.teacher}</td>
                      <td className="text-gray-500">{item.room}</td>
                      <td>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${item.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : item.status === "In Progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
