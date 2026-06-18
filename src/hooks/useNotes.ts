import { useCallback, useEffect, useState } from 'react';

export interface NoteListItem {
  id: string;
  title: string;
  updatedAt: string;
  pinned: boolean;
}

export interface NoteDetail extends NoteListItem {
  content: string;
}

export function formatNoteDate(iso: string) {
  const date = new Date(iso);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || '请求失败');
  }

  return response.json() as Promise<T>;
}

export function useNotes() {
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await readJson<NoteListItem[]>(await fetch('/api/notes'));
      setNotes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createNote = useCallback(async (title: string, content: string) => {
    const note = await readJson<NoteDetail>(
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      }),
    );
    setNotes((prev) => [{ id: note.id, title: note.title, updatedAt: note.updatedAt, pinned: note.pinned }, ...prev]);
    return note;
  }, []);

  const updateNote = useCallback(async (id: string, title: string, content: string) => {
    const note = await readJson<NoteDetail>(
      await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      }),
    );
    setNotes((prev) => {
      const filtered = prev.filter((item) => item.id !== id && item.id !== note.id);
      return [{ id: note.id, title: note.title, updatedAt: note.updatedAt, pinned: note.pinned }, ...filtered];
    });
    return note;
  }, []);

  const togglePinned = useCallback(async (id: string, pinned: boolean) => {
    const note = await readJson<NoteDetail>(
      await fetch(`/api/notes/${id}/pin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned }),
      }),
    );
    setNotes((prev) => {
      const current = prev.filter((item) => item.id !== id);
      if (pinned) {
        return [{ id: note.id, title: note.title, updatedAt: note.updatedAt, pinned: true }, ...current];
      }
      const next = [...current, { id: note.id, title: note.title, updatedAt: note.updatedAt, pinned: false }];
      return next.sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    });
    return note;
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    await readJson<{ success: true }>(await fetch(`/api/notes/${id}`, { method: 'DELETE' }));
    setNotes((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    notes,
    loading,
    error,
    refresh,
    createNote,
    updateNote,
    togglePinned,
    deleteNote,
  };
}

export async function fetchNoteDetail(id: string) {
  return readJson<NoteDetail>(await fetch(`/api/notes/${id}`));
}
