import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import client from "@/api/client";

interface CoursesParams {
  page?: number;
  perPage?: number;
  categoryId?: number;
}

export function useCourses(params: CoursesParams = {}) {
  const { page = 1, perPage = 50, categoryId } = params;
  return useQuery({
    queryKey: ["courses", { page, perPage, categoryId }],
    queryFn: async () => {
      const { data, error } = await client.GET("/courses", {
        params: {
          query: {
            page,
            per_page: perPage,
            ...(categoryId ? { category_id: categoryId } : {}),
          },
        },
      });
      if (error) throw new Error("Failed to fetch courses");
      return data;
    },
  });
}

export function useCourseCategories() {
  return useQuery({
    queryKey: ["course-categories"],
    queryFn: async () => {
      const { data, error } = await client.GET("/courses/categories", {
        params: { query: { per_page: 100 } },
      });
      if (error) throw new Error("Failed to fetch course categories");
      return data;
    },
  });
}

interface SchedulesParams {
  page?: number;
  perPage?: number;
  courseId?: number;
  state?: string;
}

export function useCourseSchedules(params: SchedulesParams = {}) {
  const { page = 1, perPage = 50, courseId, state } = params;
  return useQuery({
    queryKey: ["course-schedules", { page, perPage, courseId, state }],
    queryFn: async () => {
      const { data, error } = await client.GET("/courses/schedules", {
        params: {
          query: {
            page,
            per_page: perPage,
            ...(courseId ? { course_id: courseId } : {}),
            ...(state ? { state } : {}),
          },
        },
      });
      if (error) throw new Error("Failed to fetch course schedules");
      return data;
    },
  });
}

export function useAdvanceSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data, error } = await client.POST("/courses/schedules/{id}/advance", {
        params: { path: { id } },
      });
      if (error) throw new Error("Failed to advance schedule");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-schedules"] }),
  });
}

export function useCancelSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data, error } = await client.POST("/courses/schedules/{id}/cancel", {
        params: { path: { id } },
      });
      if (error) throw new Error("Failed to cancel schedule");
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["course-schedules"] }),
  });
}
