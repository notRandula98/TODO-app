// Interactive task workspace with API-backed CRUD, filtering, and feedback.
'use client'
import { useState, type FormEvent } from 'react'
import { useTasks } from '@/hooks/use-tasks'
import type { Status, Task } from '@/services/tasks.service'

import {
  CheckCheck,
  ListTodo,
  Plus,
  Search,
  ArrowUpDown,
  Pencil,
  Trash2,
  Circle,
  Clock3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
} from 'lucide-react'

import { Toaster, toast } from 'sonner'

import { Button } from '@/components/ui/button'

import { Badge } from '@/components/ui/badge'

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

const statuses = {
  TODO: {
    label: 'To do',
    color: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    icon: Circle,
  },
  IN_PROGRESS: {
    label: 'In progress',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock3,
  },
  DONE: {
    label: 'Done',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
}

export default function Home() {
  const {
    tasks,
    loading,
    refreshing,
    error,
    refresh,
    createTask,
    updateTask,
    deleteTask,
    busy,
  } = useTasks()

  const [filter, setFilter] = useState<Status | 'ALL'>('ALL')

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [descending, setDescending] = useState(false)

  const [editor, setEditor] = useState<Task | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Task | null>(null)
  const [formError, setFormError] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('TODO')
  const [dueDate, setDueDate] = useState('')

  function openEditor(task: Task | 'new') {
    setEditor(task)
    setFormError('')
    setTitle(task === 'new' ? '' : task.title)
    setDescription(task === 'new' ? '' : task.description || '')
    setStatus(task === 'new' ? 'TODO' : task.status)
    setDueDate(task === 'new' ? '' : task.dueDate?.slice(0, 10) || '')
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) {
      setFormError('Please enter a task title.')
      return
    }

    if (editor && editor !== 'new' && editor.dueDate && !dueDate) {
      setFormError(
        'The task service requires a due date once one has been set. Please choose a date.',
      )
      return
    }

    setFormError('')

    try {
      const input = {
        title: title.trim(),
        description: description.trim(),
        status,
        ...(dueDate ? { dueDate } : {}),
      }
      if (editor === 'new') {
        await createTask(input)
      } else if (editor) {
        await updateTask({ id: editor.id, input })
      }
      setEditor(null)
      toast.success(editor === 'new' ? 'Task created' : 'Task updated')
    } catch (e) {
      setFormError((e as Error).message)
    }
  }

  async function remove() {
    if (!deleting) return
    setFormError('')
    try {
      await deleteTask(deleting.id)
      setDeleting(null)
      toast.success('Task deleted')
    } catch (e) {
      setFormError((e as Error).message)
    }
  }

  const counts = {
    TODO: tasks.filter((t) => t.status === 'TODO').length,
    IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    DONE: tasks.filter((t) => t.status === 'DONE').length,
  }

  const filtered = tasks
    .filter(
      (t) =>
        (filter === 'ALL' || t.status === filter) &&
        `${t.title} ${t.description || ''}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) => {
      if (!a.dueDate) return b.dueDate ? 1 : 0
      if (!b.dueDate) return -1
      return (
        (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) *
        (descending ? -1 : 1)
      )
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / 8))
  const activePage = Math.min(page, totalPages)
  const visible = filtered.slice((activePage - 1) * 8, activePage * 8)

  return (
    <div className="workspace">
      <Toaster richColors position="bottom-right" />

      <div className="main-shell">
        <header className="topbar">
          <span>
            Workspace <span className="breadcrumb-slash">/</span>{' '}
            <strong>All tasks</strong>
          </span>
          <span className="topbar-note">
            <span className="online-dot" /> A little more organized.
          </span>
        </header>

        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR PERSONAL WORKSPACE</div>
              <h1>
                All tasks<span>.</span>
              </h1>
              <p>Less mental clutter. More getting things done.</p>
            </div>
            <Button onClick={() => openEditor('new')}>
              <Plus size={17} />
              New task
            </Button>
          </div>

          <section className="stats" aria-label="Task overview">
            {[
              {
                label: 'Total tasks',
                value: tasks.length,
                icon: ListTodo,
                accent: 'neutral',
                detail: 'Everything on your plate',
              },
              {
                label: 'To do',
                value: counts.TODO,
                icon: Circle,
                accent: 'slate',
                detail: 'Ready when you are',
              },
              {
                label: 'In progress',
                value: counts.IN_PROGRESS,
                icon: Clock3,
                accent: 'amber',
                detail: 'Keep the momentum going',
              },
              {
                label: 'Completed',
                value: counts.DONE,
                icon: CheckCircle2,
                accent: 'green',
                detail: 'One step closer to your goals',
              },
            ].map((item) => (
              <div className="stat-card" key={item.label}>
                <div className="stat-top">
                  <span>{item.label}</span>
                  <item.icon size={17} className={item.accent} />
                </div>
                <strong>{loading || error ? '—' : item.value}</strong>
                <small>{item.detail}</small>
              </div>
            ))}
          </section>

          <section className="task-panel">
            <div className="panel-heading">
              <div>
                <h2>
                  Your tasks{' '}
                  <span>{loading || error ? '—' : tasks.length}</span>
                </h2>
                <p>A clear view of what’s next.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void refresh()}
                disabled={refreshing}
              >
                <ArrowUpRight size={15} />
                Refresh
              </Button>
            </div>
            <div className="toolbar">
              <div className="tabs" role="group" aria-label="Filter tasks">
                {(['ALL', 'TODO', 'IN_PROGRESS', 'DONE'] as const).map(
                  (value) => (
                    <button
                      key={value}
                      className={filter === value ? 'selected' : ''}
                      onClick={() => {
                        setFilter(value)
                        setPage(1)
                      }}
                    >
                      {value === 'ALL' ? 'All tasks' : statuses[value].label}
                      <span>
                        {value === 'ALL' ? tasks.length : counts[value]}
                      </span>
                    </button>
                  ),
                )}
              </div>
              <div className="search">
                <Search size={16} />
                <input
                  aria-label="Search tasks"
                  placeholder="Search tasks…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                />
              </div>
            </div>

            {error ? (
              <div className="empty" role="alert">
                <AlertCircle size={30} />
                <h3>Couldn’t load your tasks</h3>
                <p>{error}</p>
                <Button variant="outline" onClick={() => void refresh()}>
                  Try again
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <button
                        className="inline-flex items-center gap-2"
                        onClick={() => setDescending(!descending)}
                      >
                        Due date
                        <ArrowUpDown size={13} />
                        <span className="sr-only">
                          {descending ? 'descending' : 'ascending'}
                        </span>
                      </button>
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }, (_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={4}>
                          <div
                            className="skeleton"
                            role="status"
                            aria-label="Loading tasks"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : visible.length ? (
                    visible.map((task) => {
                      const meta = statuses[task.status]
                      const Icon = meta.icon
                      const overdue =
                        task.dueDate &&
                        task.dueDate.slice(0, 10) <
                          new Date().toLocaleDateString('en-CA') &&
                        task.status !== 'DONE'
                      return (
                        <TableRow key={task.id}>
                          <TableCell>
                            <div className="task-title">
                              <span
                                className={`task-marker ${task.status === 'DONE' ? 'complete' : ''}`}
                              >
                                {task.status === 'DONE' && (
                                  <CheckCheck size={12} />
                                )}
                              </span>
                              <button
                                className="text-left font-medium text-zinc-800 hover:text-emerald-700"
                                onClick={() => openEditor(task)}
                              >
                                {task.title}
                              </button>
                            </div>
                            {task.description && (
                              <p className="task-description">
                                {task.description}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={meta.color}>
                              <Icon size={12} />
                              {meta.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`due-date ${overdue ? 'overdue' : ''}`}
                            >
                              <CalendarDays size={14} />
                              {task.dueDate
                                ? new Date(
                                    `${task.dueDate.slice(0, 10)}T12:00:00`,
                                  ).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : 'No due date'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Edit ${task.title}`}
                                onClick={() => openEditor(task)}
                              >
                                <Pencil size={15} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Delete ${task.title}`}
                                onClick={() => {
                                  setDeleting(task)
                                  setFormError('')
                                }}
                              >
                                <Trash2 size={15} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <div className="empty">
                          <span className="empty-icon">
                            <ListTodo size={28} />
                          </span>
                          <h3>
                            {tasks.length
                              ? 'No matching tasks'
                              : 'LLM: No tasks yet'}
                          </h3>
                          <p>
                            {tasks.length
                              ? 'Try another search or status filter.'
                              : 'A fresh start. Add your first task to get things moving.'}
                          </p>
                          <Button
                            variant="outline"
                            onClick={() =>
                              tasks.length
                                ? (setSearch(''), setFilter('ALL'))
                                : openEditor('new')
                            }
                          >
                            {tasks.length
                              ? 'Clear filters'
                              : 'Create your first task'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}

            <div className="table-footer">
              <span>
                {loading
                  ? 'Loading tasks…'
                  : error
                    ? 'Tasks unavailable'
                    : `Showing ${filtered.length ? (activePage - 1) * 8 + 1 : 0}–${Math.min(activePage * 8, filtered.length)} of ${filtered.length} tasks`}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={activePage === 1 || loading}
                  aria-label="Previous page"
                  onClick={() => setPage(activePage - 1)}
                >
                  <ChevronLeft size={15} />
                </Button>
                <span className="page-number">{activePage}</span>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={activePage >= totalPages || loading}
                  aria-label="Next page"
                  onClick={() => setPage(activePage + 1)}
                >
                  <ChevronRight size={15} />
                </Button>
              </div>
            </div>
          </section>
          <footer className="page-footer">
            <CheckCheck size={15} />
            <span>Small steps. Meaningful progress.</span>
          </footer>
        </main>
      </div>

      <Dialog
        open={editor !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setEditor(null)
        }}
      >
        <DialogContent
          onEscapeKeyDown={(e) => {
            if (busy) e.preventDefault()
          }}
          onPointerDownOutside={(e) => {
            if (busy) e.preventDefault()
          }}
        >
          <DialogTitle className="text-xl font-semibold">
            {editor === 'new' ? 'Create a task' : 'Edit task'}
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-zinc-500">
            Give your next step a little clarity.
          </DialogDescription>
          <form onSubmit={save} className="task-form">
            <label>
              Title <span>*</span>
              <input
                autoFocus
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to get done?"
                disabled={busy}
              />
            </label>
            <label>
              Description
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a little more detail (optional)"
                disabled={busy}
              />
            </label>
            <div className="form-columns">
              <label>
                Status
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Status)}
                  disabled={busy}
                >
                  {Object.entries(statuses).map(([value, meta]) => (
                    <option key={value} value={value}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Due date
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={busy}
                />
              </label>
            </div>
            {editor && editor !== 'new' && editor.dueDate && (
              <p className="text-xs text-zinc-500">
                An existing due date can be changed, but cannot be removed.
              </p>
            )}
            {formError && (
              <p role="alert" className="form-error">
                {formError}
              </p>
            )}
            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setEditor(null)}
              >
                Cancel
              </Button>
              <Button disabled={busy} type="submit">
                {busy && <Loader2 className="animate-spin" size={16} />}{' '}
                {editor === 'new' ? 'Create task' : 'Save changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open && !busy) setDeleting(null)
        }}
      >
        <DialogContent>
          <DialogTitle className="text-xl font-semibold">
            Delete this task?
          </DialogTitle>
          <DialogDescription className="mt-3 text-sm leading-6 text-zinc-500">
            “{deleting?.title}” will be permanently deleted. This action cannot
            be undone.
          </DialogDescription>
          {formError && (
            <p role="alert" className="form-error mt-4">
              {formError}
            </p>
          )}
          <div className="form-actions mt-6">
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setDeleting(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() => void remove()}
            >
              {busy && <Loader2 size={16} className="animate-spin" />}Delete
              task
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}