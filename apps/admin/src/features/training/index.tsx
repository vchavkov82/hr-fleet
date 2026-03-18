import { useState, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { GraduationCap, Calendar, Users, BookOpen, ChevronRight, Plus } from "lucide-react";
import { useCourses, useCourseSchedules, useAdvanceSchedule, useCancelSchedule } from "./hooks";

interface Course {
  id: number;
  name: string;
  category_id?: { id: number; name: string };
  permanence?: boolean;
}

interface Schedule {
  id: number;
  name: string;
  course_id: { id: number; name: string };
  start_date: string;
  end_date: string;
  cost: number;
  authorized_by: { id: number; name: string };
  state: string;
  attendant_ids?: number[];
  place?: string;
}

const STATE_CONFIG: Record<string, { label: string; color: string; nextAction?: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700", nextAction: "Open Registration" },
  waiting_attendees: { label: "Registration Open", color: "bg-blue-100 text-blue-700", nextAction: "Start Course" },
  in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-700", nextAction: "To Validation" },
  in_validation: { label: "Validation", color: "bg-purple-100 text-purple-700", nextAction: "Complete" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

type TabType = "courses" | "schedules";

export function TrainingPage() {
  const [activeTab, setActiveTab] = useState<TabType>("schedules");
  const [stateFilter, setStateFilter] = useState<string>("");

  const { data: coursesData, isLoading: coursesLoading } = useCourses({ perPage: 100 });
  const { data: schedulesData, isLoading: schedulesLoading } = useCourseSchedules({
    perPage: 100,
    state: stateFilter || undefined,
  });

  const advanceMutation = useAdvanceSchedule();
  const cancelMutation = useCancelSchedule();

  const courses = ((coursesData as { data?: Course[] })?.data ?? []) as Course[];
  const schedules = ((schedulesData as { data?: Schedule[] })?.data ?? []) as Schedule[];

  const stats = useMemo(() => {
    let active = 0, upcoming = 0, completed = 0;
    schedules.forEach((s) => {
      if (s.state === "in_progress") active++;
      else if (s.state === "draft" || s.state === "waiting_attendees") upcoming++;
      else if (s.state === "completed") completed++;
    });
    return { active, upcoming, completed, totalCourses: courses.length };
  }, [schedules, courses]);

  const handleAdvance = (id: number) => {
    if (confirm("Advance this schedule to the next state?")) {
      advanceMutation.mutate(id);
    }
  };

  const handleCancel = (id: number) => {
    if (confirm("Cancel this course schedule?")) {
      cancelMutation.mutate(id);
    }
  };

  const isLoading = coursesLoading || schedulesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Training</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage training courses and schedules
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          New Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalCourses}</div>
              <div className="text-sm text-gray-500">Courses</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <GraduationCap className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
              <div className="text-sm text-gray-500">In Progress</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.upcoming}</div>
              <div className="text-sm text-gray-500">Upcoming</div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("schedules")}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${activeTab === "schedules" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Schedules
        </button>
        <button
          onClick={() => setActiveTab("courses")}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${activeTab === "courses" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Course Catalog
        </button>
      </div>

      {activeTab === "schedules" && (
        <>
          <div className="flex items-center gap-2">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All States</option>
              <option value="draft">Draft</option>
              <option value="waiting_attendees">Registration Open</option>
              <option value="in_progress">In Progress</option>
              <option value="in_validation">Validation</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Schedule</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Course</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Attendees</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No schedules found
                    </td>
                  </tr>
                ) : (
                  schedules.map((schedule) => {
                    const stateInfo = STATE_CONFIG[schedule.state] ?? { label: schedule.state, color: "bg-gray-100 text-gray-700" };
                    return (
                      <tr key={schedule.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {schedule.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {schedule.course_id.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {schedule.start_date ? (
                            <>
                              {format(parseISO(schedule.start_date), "MMM d")}
                              {schedule.end_date && ` - ${format(parseISO(schedule.end_date), "MMM d, yyyy")}`}
                            </>
                          ) : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {schedule.attendant_ids?.length ?? 0}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${stateInfo.color}`}>
                            {stateInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {stateInfo.nextAction && schedule.state !== "cancelled" && (
                              <button
                                onClick={() => handleAdvance(schedule.id)}
                                disabled={advanceMutation.isPending}
                                className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100"
                              >
                                {stateInfo.nextAction}
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            )}
                            {schedule.state !== "completed" && schedule.state !== "cancelled" && (
                              <button
                                onClick={() => handleCancel(schedule.id)}
                                disabled={cancelMutation.isPending}
                                className="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === "courses" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{course.name}</h3>
                  {course.category_id && (
                    <p className="text-sm text-gray-500">{course.category_id.name}</p>
                  )}
                  {course.permanence && (
                    <span className="inline-flex mt-2 items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Has Permanence
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No courses found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
