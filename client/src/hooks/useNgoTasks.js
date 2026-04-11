import { useCallback, useRef, useState } from "react";
import {
  NGO_TASK_FILTER_DEFAULTS,
  resolveAssignmentStatus,
} from "../constants/ngoTaskConstants";
import {
  acceptNgoTask,
  completeNgoTask,
  declineNgoTask,
  getNgoTaskById,
  getNgoTaskPerformance,
  getNgoTasks,
  markNgoTaskInProgress,
} from "../services/ngoTaskService";

const EMPTY_PAGINATION = {
  total: 0,
  page: 1,
  limit: NGO_TASK_FILTER_DEFAULTS.limit,
  totalPages: 1,
};

const EMPTY_PERFORMANCE = {
  completedTasks: 0,
  averageResponseTime: null,
  rating: 0,
  availabilityStatus: "OFFLINE",
  assignmentCounts: {
    assigned: 0,
    accepted: 0,
    declined: 0,
    inProgress: 0,
    completed: 0,
  },
};

const normalizeTaskQuery = (filters = {}) => ({
  status: filters.status || "",
  page: Number(filters.page) > 0 ? Number(filters.page) : 1,
  limit: Number(filters.limit) > 0 ? Number(filters.limit) : NGO_TASK_FILTER_DEFAULTS.limit,
});

const clearTaskUpdating = (prev, taskId) => {
  const next = { ...prev };
  delete next[taskId];
  return next;
};

export default function useNgoTasks({ ngoProfileId } = {}) {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [performance, setPerformance] = useState(EMPTY_PERFORMANCE);
  const [selectedTask, setSelectedTask] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isPerformanceLoading, setIsPerformanceLoading] = useState(false);
  const [updatingTaskIds, setUpdatingTaskIds] = useState({});

  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [actionError, setActionError] = useState("");

  const lastTaskQueryRef = useRef(normalizeTaskQuery(NGO_TASK_FILTER_DEFAULTS));

  const fetchTasks = useCallback(async (filters = {}) => {
    setIsLoading(true);
    setError("");

    const query = normalizeTaskQuery(filters);
    lastTaskQueryRef.current = query;

    try {
      const response = await getNgoTasks(query);
      setTasks(Array.isArray(response?.data) ? response.data : []);
      setPagination(response?.pagination || EMPTY_PAGINATION);
      return response;
    } catch (fetchError) {
      setError(fetchError.message || "Could not load assigned tasks.");
      throw fetchError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPerformance = useCallback(async () => {
    setIsPerformanceLoading(true);

    try {
      const response = await getNgoTaskPerformance();
      setPerformance(response?.data || EMPTY_PERFORMANCE);
      return response;
    } catch (fetchError) {
      setActionError(fetchError.message || "Could not load performance data.");
      throw fetchError;
    } finally {
      setIsPerformanceLoading(false);
    }
  }, []);

  const fetchTaskById = useCallback(async (taskId) => {
    setIsDetailLoading(true);
    setDetailError("");

    try {
      const response = await getNgoTaskById(taskId);
      setSelectedTask(response?.data || null);
      return response;
    } catch (fetchError) {
      setDetailError(fetchError.message || "Could not load task details.");
      throw fetchError;
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const mutateTask = useCallback(
    async (taskId, mutationFn) => {
      setActionError("");
      setUpdatingTaskIds((prev) => ({ ...prev, [taskId]: true }));

      try {
        const response = await mutationFn();
        await fetchTasks(lastTaskQueryRef.current);

        if (selectedTask?._id === taskId) {
          await fetchTaskById(taskId);
        }

        return response;
      } catch (mutationError) {
        setActionError(mutationError.message || "Could not update task status.");
        throw mutationError;
      } finally {
        setUpdatingTaskIds((prev) => clearTaskUpdating(prev, taskId));
      }
    },
    [fetchTaskById, fetchTasks, selectedTask?._id],
  );

  const acceptTask = useCallback(
    async (taskId) => {
      return mutateTask(taskId, () => acceptNgoTask(taskId));
    },
    [mutateTask],
  );

  const declineTask = useCallback(
    async (taskId, reason = "") => {
      const payload = reason ? { reason } : {};
      return mutateTask(taskId, () => declineNgoTask(taskId, payload));
    },
    [mutateTask],
  );

  const markTaskInProgress = useCallback(
    async (taskId) => {
      return mutateTask(taskId, () => markNgoTaskInProgress(taskId));
    },
    [mutateTask],
  );

  const markTaskCompleted = useCallback(
    async (taskId) => {
      return mutateTask(taskId, () => completeNgoTask(taskId));
    },
    [mutateTask],
  );

  const isTaskUpdating = useCallback(
    (taskId) => Boolean(updatingTaskIds[taskId]),
    [updatingTaskIds],
  );

  const getAssignmentStatus = useCallback(
    (task) => resolveAssignmentStatus(task, ngoProfileId),
    [ngoProfileId],
  );

  return {
    tasks,
    pagination,
    performance,
    selectedTask,
    error,
    detailError,
    actionError,
    isLoading,
    isDetailLoading,
    isPerformanceLoading,
    fetchTasks,
    fetchPerformance,
    fetchTaskById,
    setSelectedTask,
    acceptTask,
    declineTask,
    markTaskInProgress,
    markTaskCompleted,
    isTaskUpdating,
    getAssignmentStatus,
  };
}
