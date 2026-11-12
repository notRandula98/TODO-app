CREATE TABLE IF NOT EXISTS t_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'TODO'
        CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE')),
    dueDate TEXT,
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);