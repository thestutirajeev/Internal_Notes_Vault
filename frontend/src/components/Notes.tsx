import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

interface NotesProps {
  token: string;
  handleLogout: () => void;
}

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  expires_at: string;
}

const Notes: React.FC<NotesProps> = ({ token, handleLogout }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState({ title: '', content: '', expires_at: '' });
  const [timerStates, setTimerStates] = useState<{ [key: number]: string }>({});
  const [deletedNotes, setDeletedNotes] = useState<Set<number>>(new Set());
  const timers = useRef<NodeJS.Timeout[]>([]);

  useEffect(() =>{
    fetchNotes();
  }, [token]);

  const handleDeleteNote = async (id: number) => {
    if (deletedNotes.has(id)) {
      return; // Skip if already deleted
    }
    try {
      await axios.delete(`http://localhost:8000/api/notes/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletedNotes(prev => new Set(prev).add(id));
      setNotes(notes.filter(note => note.id !== id)); // Immediate UI update
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setDeletedNotes(prev => new Set(prev).add(id));
        setNotes(notes.filter(note => note.id !== id));
      } else if (error.response && error.response.status === 500) {
        console.warn(`Server error for note ${id}, refreshing list`);
        fetchNotes();
      } else {
        console.error('Error deleting note:', error);
      }
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/notes/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/notes/', {
        title: newNote.title,
        content: newNote.content,
        expires_at: newNote.expires_at,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewNote({ title: '', content: '', expires_at: '' });
      fetchNotes();
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  useEffect(() => {
    const updateTimers = () => {
      const newStates: { [key: number]: string } = {};
      const notesToProcess = notes.filter(note => !deletedNotes.has(note.id)); // Only process non-deleted notes
      notesToProcess.forEach(note => {
        const now = new Date();
        const expires = new Date(note.expires_at);
        const diffMs = expires.getTime() - now.getTime();
        if (diffMs <= 0 && !deletedNotes.has(note.id)) {
          newStates[note.id] = '00:00:00';
          handleDeleteNote(note.id); // Trigger deletion
        } else if (diffMs > 0) {
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          if (diffDays < 1) {
            const totalSeconds = Math.floor(diffMs / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            newStates[note.id] = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          }
        }
      });
      setTimerStates(newStates);
    };

    updateTimers(); // Initial call
    const timer = setInterval(updateTimers, 1000);
    timers.current.push(timer);

    return () => clearInterval(timer);
  }, [notes, token, deletedNotes]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Notes</h1>
      <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded mb-4">
        Logout
      </button>
      <form onSubmit={handleCreateNote} className="mb-6 p-4 bg-gray-100 rounded">
        <input
          type="text"
          placeholder="Title"
          value={newNote.title}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <textarea
          placeholder="Content"
          value={newNote.content}
          onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="datetime-local"
          value={newNote.expires_at}
          onChange={(e) => setNewNote({ ...newNote, expires_at: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Create Note
        </button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.length === 0 && <p>No notes available</p>}
        {notes.map((note) => (
          <div key={note.id} className="p-4 bg-white rounded shadow relative">
            {timerStates[note.id] && timerStates[note.id] !== '00:00:00' && (
              <div className="absolute top-2 right-2 text-red-500 animate-pulse">
                {timerStates[note.id]}
              </div>
            )}
            <h3 className="text-lg font-bold">{note.title}</h3>
            <p className="text-gray-600">{note.content}</p>
            <p className="text-sm text-gray-500">Created: {new Date(note.created_at).toLocaleString()}</p>
            {timerStates[note.id] === '00:00:00' ? (
              <p className="text-sm text-red-500">Expired</p>
            ) : (
              timerStates[note.id] === undefined && (
                <p className="text-sm text-red-500">Expires at: {new Date(note.expires_at).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).replace(/,/, '')}</p>
              )
            )}
            {!deletedNotes.has(note.id) && (
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="mt-2 bg-red-500 text-white px-4 py-1 rounded"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notes;