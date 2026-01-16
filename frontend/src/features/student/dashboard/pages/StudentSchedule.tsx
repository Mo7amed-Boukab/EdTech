import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin, User, Loader2 } from "lucide-react";
import { studentService } from "../../services/studentService";

// Types - API Ready
interface ScheduleSession {
  id: string; // Changed to string
  day: string; // "Monday", etc.
  startTime: string; // "08:00"
  endTime: string; // "10:00"
  subject: string;
  class: string; // Not strictly needed for student view but keeping for types
  teacher: string;
  room: string;
}

interface WeekRange {
  start: Date;
  end: Date;
}

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;
const WEEK_DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const WEEK_DAYS_FR = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];

// Schedule starts at 8:00, ends at 18:00
const SCHEDULE_START_HOUR = 8;
const SCHEDULE_END_HOUR = 18;
const HOUR_HEIGHT = 60; // pixels per hour

export const StudentSchedule = () => {
  const [currentWeek, setCurrentWeek] = useState<WeekRange>(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    monday.setHours(0, 0, 0, 0);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);
    return { start: monday, end: friday };
  });

  const [fetchedSessions, setFetchedSessions] = useState<ScheduleSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(0); // For mobile view

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = await studentService.getSchedule(currentWeek.start, currentWeek.end);

        // Transform backend data to ScheduleSession
        const formatted: ScheduleSession[] = data.map((s: any) => {
          const dateObj = new Date(s.date);
          return {
            id: s.id,
            day: dateObj.toLocaleDateString("en-US", { weekday: "long" }),
            startTime: s.startTime,
            endTime: s.endTime,
            subject: s.subject || "No Subject",
            class: s.class || "",
            teacher: s.teacher,
            room: s.room
          };
        });
        setFetchedSessions(formatted);
      } catch (error) {
        console.error("Failed to fetch schedule", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [currentWeek]);

  // Use fetched sessions
  const sessions = fetchedSessions;

  // Navigation
  const goToPreviousWeek = () => {
    setCurrentWeek((prev) => {
      const newStart = new Date(prev.start);
      newStart.setDate(newStart.getDate() - 7);
      const newEnd = new Date(prev.end);
      newEnd.setDate(newEnd.getDate() - 7);
      return { start: newStart, end: newEnd };
    });
  };

  const goToNextWeek = () => {
    setCurrentWeek((prev) => {
      const newStart = new Date(prev.start);
      newStart.setDate(newStart.getDate() + 7);
      const newEnd = new Date(prev.end);
      newEnd.setDate(newEnd.getDate() + 7);
      return { start: newStart, end: newEnd };
    });
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    monday.setHours(0, 0, 0, 0);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    friday.setHours(23, 59, 59, 999);
    setCurrentWeek({ start: monday, end: friday });
  };

  // Format week range
  const formatWeekRange = () => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
    };
    const startStr = currentWeek.start.toLocaleDateString("en-US", options);
    const endStr = currentWeek.end.toLocaleDateString("en-US", {
      ...options,
      year: "numeric",
    });
    return `${startStr} – ${endStr}`;
  };

  // Calculate session position and height
  const getSessionStyle = (session: ScheduleSession) => {
    const [startHour, startMin] = session.startTime.split(":").map(Number);
    const [endHour, endMin] = session.endTime.split(":").map(Number);

    const startOffset =
      (startHour - SCHEDULE_START_HOUR) * HOUR_HEIGHT +
      (startMin / 60) * HOUR_HEIGHT;
    const endOffset =
      (endHour - SCHEDULE_START_HOUR) * HOUR_HEIGHT +
      (endMin / 60) * HOUR_HEIGHT;
    const height = endOffset - startOffset;

    return {
      top: `${startOffset}px`,
      height: `${height}px`,
    };
  };

  // Get sessions for a specific day
  const getSessionsForDay = (day: string) => {
    return sessions.filter((s) => s.day === day);
  };

  // Time slots for the sidebar
  const timeSlots = Array.from(
    { length: SCHEDULE_END_HOUR - SCHEDULE_START_HOUR },
    (_, i) => SCHEDULE_START_HOUR + i
  );

  // Get dates for each day of current week
  const getDateForDay = (dayIndex: number) => {
    const date = new Date(currentWeek.start);
    date.setDate(date.getDate() + dayIndex);
    return date.getDate();
  };

  // Check if current week contains today
  const isCurrentWeek = () => {
    const today = new Date();
    return today >= currentWeek.start && today <= currentWeek.end;
  };

  // Check if a day is today
  const isToday = (dayIndex: number) => {
    const today = new Date();
    const dayDate = new Date(currentWeek.start);
    dayDate.setDate(dayDate.getDate() + dayIndex);
    return (
      today.getDate() === dayDate.getDate() &&
      today.getMonth() === dayDate.getMonth() &&
      today.getFullYear() === dayDate.getFullYear()
    );
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Weekly Schedule
          </h2>
          <div className="flex items-center gap-2">
            {!isCurrentWeek() && (
              <button
                onClick={goToCurrentWeek}
                className="px-4 py-2 text-xs font-medium text-gray-900 bg-white rounded hover:text-[var(--primary)] transition-colors"
                disabled={loading}
              >
                Today
              </button>
            )}
            <div className="flex items-center border border-[var(--border-color)] bg-white rounded">
              <button
                onClick={goToPreviousWeek}
                className="p-2 hover:bg-[var(--bg-light)] transition-colors text-[var(--text-muted)] border-r border-[var(--border-color)]"
                disabled={loading}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-4 py-1.5 font-medium text-sm text-[var(--text-primary)] min-w-[180px] text-center">
                {formatWeekRange()}
              </span>
              <button
                onClick={goToNextWeek}
                className="p-2 hover:bg-[var(--bg-light)] transition-colors text-[var(--text-muted)] border-l border-[var(--border-color)]"
                disabled={loading}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-[var(--primary)]" size={48} />
          </div>
        ) : (
          <>
            {/* Mobile: Day selector */}
            <div className="flex gap-1 mb-4 overflow-x-auto pb-2 lg:hidden">
              {WEEK_DAYS.map((day, index) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(index)}
                  className={`flex-1 min-w-[60px] py-2 px-3 rounded text-center transition-colors ${selectedDay === index
                    ? "bg-[var(--primary)] text-white"
                    : isToday(index)
                      ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]"
                      : "bg-white border border-[var(--border-color)] text-[var(--text-primary)]"
                    }`}
                >
                  <div className="text-xs font-medium">
                    {WEEK_DAYS_SHORT[index]}
                  </div>
                  <div className="text-lg font-bold">{getDateForDay(index)}</div>
                </button>
              ))}
            </div>

            {/* Desktop/Tablet: Full week grid */}
            <div
              className="card hidden lg:block overflow-hidden"
              style={{ background: "white" }}
            >
              {/* Days Header */}
              <div className="grid grid-cols-[70px_repeat(5,1fr)] border-b border-[var(--border-color)]">
                <div className="p-3 bg-[var(--bg-light)] border-r border-[var(--border-color)]"></div>
                {WEEK_DAYS.map((day, index) => (
                  <div
                    key={day}
                    className={`p-3 text-center border-r border-[var(--border-color)] last:border-r-0 ${isToday(index)
                      ? "bg-[var(--primary)]/5"
                      : "bg-[var(--bg-light)]"
                      }`}
                  >
                    <div className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
                      {WEEK_DAYS_FR[index]}
                    </div>
                    <div
                      className={`text-xl font-bold mt-1 ${isToday(index)
                        ? "text-[var(--primary)]"
                        : "text-[var(--text-primary)]"
                        }`}
                    >
                      {getDateForDay(index)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Schedule Grid - REMOVED SCROLL and MAX-HEIGHT */}
              <div
                className="grid grid-cols-[70px_repeat(5,1fr)]"
              // No style maxHeight
              >
                {/* Time Column */}
                <div className="border-r border-[var(--border-color)]">
                  {timeSlots.map((hour) => (
                    <div
                      key={hour}
                      className="border-b border-[var(--border-color)] text-xs text-[var(--text-muted)] pr-2 text-right bg-[var(--bg-light)]"
                      style={{ height: `${HOUR_HEIGHT}px`, paddingTop: "4px" }}
                    >
                      {hour.toString().padStart(2, "0")}:00
                    </div>
                  ))}
                </div>

                {/* Day Columns */}
                {WEEK_DAYS.map((day, dayIndex) => (
                  <div
                    key={day}
                    className={`relative border-r border-[var(--border-color)] last:border-r-0 ${isToday(dayIndex) ? "bg-[var(--primary)]/[0.02]" : ""
                      }`}
                  >
                    {/* Hour lines */}
                    {timeSlots.map((hour) => (
                      <div
                        key={hour}
                        className="border-b border-[var(--border-color)]"
                        style={{ height: `${HOUR_HEIGHT}px` }}
                      />
                    ))}

                    {/* Sessions */}
                    {getSessionsForDay(day).map((session) => (
                      <div
                        key={session.id}
                        className="absolute left-1 right-1 bg-white border-l-4 border-[var(--primary)] shadow-sm rounded-r overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                        style={getSessionStyle(session)}
                      >
                        <div className="p-2 h-full flex flex-col justify-center min-h-0">
                          <div className="font-bold text-sm text-[var(--text-primary)] leading-tight truncate shrink-0 mb-0.5 capitalize">
                            {session.subject || "No Subject"}
                          </div>
                          <div className="flex flex-col gap-0.5 overflow-hidden">
                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                              <Clock size={12} className="flex-shrink-0" />
                              <span className="truncate">
                                {session.startTime} - {session.endTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                              <MapPin size={12} className="flex-shrink-0" />
                              <span className="truncate">{session.room}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                              <User size={12} className="flex-shrink-0" />
                              <span className="truncate">{session.teacher}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile: Day view (list) */}
            <div className="lg:hidden">
              <div className="space-y-3">
                {getSessionsForDay(WEEK_DAYS[selectedDay]).length === 0 ? (
                  <div className="card">
                    <div className="card-body text-center py-12">
                      <p className="text-[var(--text-muted)]">
                        No classes scheduled for this day
                      </p>
                    </div>
                  </div>
                ) : (
                  getSessionsForDay(WEEK_DAYS[selectedDay]).map((session) => {
                    // Helper to format full date logic removed as it's no longer used in the card header

                    return (
                      <div
                        key={session.id}
                        className="card border-l-4 border-l-[var(--primary)]"
                        style={{ background: "white" }}
                      >
                        <div
                          className="card-body"
                          style={{ padding: "16px", background: "white" }}
                        >
                          {/* Added Time Header (Date removed as requested) */}
                          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100 text-[var(--text-muted)]">
                            <Clock size={14} />
                            <span className="text-sm font-medium">
                              {session.startTime} - {session.endTime}
                            </span>
                          </div>

                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-[var(--text-primary)]">
                                  {session.subject}
                                </h3>
                              </div>

                              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-[var(--text-muted)]">
                                {/* Placeholders for other info if needed, keeping Room and Teacher */}
                                <span className="flex items-center gap-1">
                                  <MapPin size={14} />
                                  {session.room}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User size={14} />
                                  {session.teacher}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

