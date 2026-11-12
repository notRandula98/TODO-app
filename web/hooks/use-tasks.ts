"use client";

import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'
import { TASKS_KEY, tasksService, type Task, type CreateTaskInput, type UpdateTaskInput } from '@/services/tasks.service'

export function useTasks() {
  const query = useSWR<Task[], Error>(TASKS_KEY, () => tasksService.list())

  const create = useSWRMutation(TASKS_KEY,
    (_key, { arg }: { arg: CreateTaskInput }) => tasksService.create(arg), {
      populateCache: (saved: Task, current: Task[] | undefined) => [saved, ...(current ?? [])],
    })
  const update = useSWRMutation(TASKS_KEY,
    (_key, { arg }: { arg: { id: string; input: UpdateTaskInput } }) => tasksService.update(arg.id, arg.input), {
      populateCache: (saved: Task, current: Task[] | undefined) => (current ?? []).map(task => task.id === saved.id ? saved : task),
    })
  const remove = useSWRMutation(TASKS_KEY,
    async (_key, { arg }: { arg: string }) => { await tasksService.remove(arg); return arg; }, {
      populateCache: (id: string, current: Task[] | undefined) => (current ?? []).filter(task => task.id !== id),
    })

  return {
    tasks: query.data ?? [],
    loading: query.isLoading,
    refreshing: query.isValidating,
    error: query.error?.message ?? '',
    refresh: () => query.mutate().catch(() => undefined),
    createTask: create.trigger,
    updateTask: update.trigger,
    deleteTask: remove.trigger,
    busy: create.isMutating || update.isMutating || remove.isMutating,
  };
}
