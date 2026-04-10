import { useCallback, useMemo, useState } from "react";
import {
  assignAdminHelpRequest,
  getAdminHelpRequestById,
  getAdminHelpRequests,
  listAdminNgos,
  updateAdminHelpRequest,
} from "../services/adminTaskService";

const EMPTY_PAGINATION = {
  total: 0,
  page: 1,
  limit: 12,
  totalPages: 1,
};

const updateTaskById = (list, updatedTask) => {
  if (!updatedTask?._id) return list;

  const exists = list.some((task) => task._id === updatedTask._id);
  if (!exists) return list;

  return list.map((task) => (task._id === updatedTask._id ? updatedTask : task));
};

export default function useAdminTasks() {
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [isListLoading, setIsListLoading] = useState(false);
  const [isTaskLoading, setIsTaskLoading] = useState(false);
  const [isNgosLoading, setIsNgosLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [ngos, setNgos] = useState([]);

  const fetchTasks = useCallback(async (filters = {}) => {
    setIsListLoading(true);
    setError("");

    try {
      const response = await getAdminHelpRequests(filters);
      setTasks(Array.isArray(response?.data) ? response.data : []);
      setPagination(response?.pagination || EMPTY_PAGINATION);
      return response;
    } catch (fetchError) {
      setError(fetchError.message);
      throw fetchError;
    } finally {
      setIsListLoading(false);
    }
  }, []);

  const fetchTaskById = useCallback(async (taskId) => {
    setIsTaskLoading(true);
    setError("");

    try {
      const response = await getAdminHelpRequestById(taskId);
      const task = response?.data || null;
      setSelectedTask(task);
      if (task) {
        setTasks((prevTasks) => updateTaskById(prevTasks, task));
      }
      return response;
    } catch (fetchError) {
      setError(fetchError.message);
      throw fetchError;
    } finally {
      setIsTaskLoading(false);
    }
  }, []);

  const prefetchNgos = useCallback(async () => {
    if (ngos.length > 0) {
      return ngos;
    }

    setIsNgosLoading(true);
    setError("");

    try {
      const response = await listAdminNgos();
      const ngoData = Array.isArray(response?.data) ? response.data : [];
      setNgos(ngoData);
      return ngoData;
    } catch (fetchError) {
      setError(fetchError.message);
      throw fetchError;
    } finally {
      setIsNgosLoading(false);
    }
  }, [ngos]);

  const assignTaskOptimistic = useCallback(
    async ({ taskId, organizationId, taskType }) => {
      const previousTasks = tasks;
      const previousSelectedTask = selectedTask;
      const assignedNgo = ngos.find((ngo) => ngo._id === organizationId);
      const optimisticAssignment = {
        ngoId: assignedNgo
          ? {
              _id: assignedNgo._id,
              organizationName:
                assignedNgo.organizationName
                || assignedNgo.userId?.name
                || assignedNgo.contactPerson
                || assignedNgo.registrationNumber
                || "Unknown NGO",
              type: assignedNgo.type,
              contactPerson: assignedNgo.contactPerson || assignedNgo.userId?.name,
              contactPhone: assignedNgo.contactPhone,
              availabilityStatus: assignedNgo.availabilityStatus,
            }
          : organizationId,
        taskType: taskType || "General Relief",
        status: "assigned",
        assignedAt: new Date().toISOString(),
      };

      const applyOptimisticState = (task) => {
        if (!task || task._id !== taskId) {
          return task;
        }

        const taskAssignments = Array.isArray(task.assignments) ? task.assignments : [];
        const alreadyAssigned = taskAssignments.some((assignment) => {
          const ngoId = assignment?.ngoId?._id || assignment?.ngoId;
          return String(ngoId) === String(organizationId);
        });

        return {
          ...task,
          status: "assigned",
          assignments: alreadyAssigned
            ? taskAssignments
            : [...taskAssignments, optimisticAssignment],
        };
      };

      setTasks((prevTasks) => prevTasks.map(applyOptimisticState));
      setSelectedTask((prevTask) => applyOptimisticState(prevTask));

      try {
        const response = await assignAdminHelpRequest(taskId, {
          organizationId,
          taskType,
        });

        const updatedTask = response?.data;
        if (updatedTask) {
          setTasks((prevTasks) => updateTaskById(prevTasks, updatedTask));
          setSelectedTask((prevTask) => {
            if (!prevTask || prevTask._id !== updatedTask._id) {
              return prevTask;
            }
            return updatedTask;
          });
        }

        return response;
      } catch (assignError) {
        setTasks(previousTasks);
        setSelectedTask(previousSelectedTask);
        setError(assignError.message);
        throw assignError;
      }
    },
    [ngos, selectedTask, tasks],
  );

  const updateTaskFields = useCallback(async (taskId, payload) => {
    setError("");

    try {
      const response = await updateAdminHelpRequest(taskId, payload);
      const updatedTask = response?.data;

      if (updatedTask) {
        setTasks((prevTasks) => updateTaskById(prevTasks, updatedTask));
        setSelectedTask((prevTask) => {
          if (!prevTask || prevTask._id !== updatedTask._id) {
            return prevTask;
          }
          return updatedTask;
        });
      }

      return response;
    } catch (updateError) {
      setError(updateError.message);
      throw updateError;
    }
  }, []);

  const assignedNgoMap = useMemo(() => {
    return ngos.reduce((map, ngo) => {
      map[ngo._id] = ngo;
      return map;
    }, {});
  }, [ngos]);

  return {
    tasks,
    pagination,
    error,
    selectedTask,
    ngos,
    assignedNgoMap,
    isListLoading,
    isTaskLoading,
    isNgosLoading,
    fetchTasks,
    fetchTaskById,
    setSelectedTask,
    prefetchNgos,
    assignTaskOptimistic,
    updateTaskFields,
  };
}
