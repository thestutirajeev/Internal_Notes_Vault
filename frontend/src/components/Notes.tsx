import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

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
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    expires_at: "",
  });
  const [timerStates, setTimerStates] = useState<{ [key: number]: string }>({});
  const [deletedNotes, setDeletedNotes] = useState<Set<number>>(new Set());
  const timers = useRef<NodeJS.Timeout[]>([]);
  const [showMore, setShowMore] = useState({});

  useEffect(() => {
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
      setDeletedNotes((prev) => new Set(prev).add(id));
      setNotes(notes.filter((note) => note.id !== id)); // Immediate UI update
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setDeletedNotes((prev) => new Set(prev).add(id));
        setNotes(notes.filter((note) => note.id !== id));
      } else if (error.response && error.response.status === 500) {
        console.warn(`Server error for note ${id}, refreshing list`);
        fetchNotes();
      } else {
        console.error("Error deleting note:", error);
      }
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/notes/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8000/api/notes/",
        {
          title: newNote.title,
          content: newNote.content,
          expires_at: newNote.expires_at,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewNote({ title: "", content: "", expires_at: "" });
      fetchNotes();
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  useEffect(() => {
    const updateTimers = () => {
      const newStates: { [key: number]: string } = {};
      const notesToProcess = notes.filter((note) => !deletedNotes.has(note.id)); // Only process non-deleted notes
      notesToProcess.forEach((note) => {
        const now = new Date();
        const expires = new Date(note.expires_at);
        const diffMs = expires.getTime() - now.getTime();
        if (diffMs <= 0 && !deletedNotes.has(note.id)) {
          newStates[note.id] = "00:00:00";
          handleDeleteNote(note.id); // Trigger deletion
        } else if (diffMs > 0) {
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          if (diffDays < 1) {
            const totalSeconds = Math.floor(diffMs / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            newStates[note.id] = `${hours.toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
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
    <div className="p-4">
      {/* Header Row */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Notes ...✒️</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Notes Grid - Left */}
        <div className="lg:w-3/4 w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {notes.length === 0 && <p>OOPS!! No notes available</p>}
          {notes.map((note) => {
            const isLong = note.content.length > 200;
            const showFull = showMore[note.id];
            return (
              <div
                key={note.id}
                className="relative p-4 bg-white rounded shadow hover:shadow-md transition"
              >
                {/* Timer on top right */}
                {timerStates[note.id] &&
                  timerStates[note.id] !== "00:00:00" && (
                    <div className="absolute top-2 right-2 text-red-500 animate-pulse">
                       ⏳{timerStates[note.id]}
                    </div>
                  )}

                {/* Note Content */}
                <h3 className="text-lg font-bold mb-2">{note.title}</h3>
                <p className="text-gray-600 mb-1">
                  {isLong && !showFull
                    ? note.content.slice(0, 200) + "..."
                    : note.content}✒️
                </p>
                {isLong && (
                  <button
                    onClick={() =>
                      setShowMore((prev) => ({
                        ...prev,
                        [note.id]: !prev[note.id],
                      }))
                    }
                    className="text-blue-500 text-sm"
                  >
                    {showFull ? "Show less" : "Show more"}
                  </button>
                )}
                <p className="text-sm text-gray-500">
                  Created: {new Date(note.created_at).toLocaleString()}
                </p>
                {timerStates[note.id] === "00:00:00" ? (
                  <p className="text-sm text-red-500">Expired</p>
                ) : (
                  timerStates[note.id] === undefined && (
                    <p className="text-sm text-red-500">
                      Expires at:{" "}
                      {new Date(note.expires_at)
                        .toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        .replace(/,/, "")}
                    </p>
                  )
                )}

                {/* Bin Icon */}
                <div
                  className="absolute bottom-2 right-2 cursor-pointer text-red-500"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  🗑️
                </div>
              </div>
            );
          })}
        </div>

        {/* Form - Right */}
        <form
          onSubmit={handleCreateNote}
          className="lg:w-1/4 w-full bg-gray-100 p-4 rounded shadow flex flex-col gap-3"
        >
          <h2 className="font-bold mb-2 text-xl ">New Note</h2>
          <p className="text-sm text-gray-600 mb-2">Your Title here ✒️:</p>
          <input
            type="text"
            placeholder="Title"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full p-2 border rounded"
            required
            maxLength={255}
          />
          <p className="text-sm text-gray-600 mb-2">Your Content here 📝:</p>
          <textarea
            placeholder="Content"
            value={newNote.content}
            onChange={(e) =>
              setNewNote({ ...newNote, content: e.target.value })
            }
            className="w-full p-2 border rounded h-40 resize-none"
            required
          />
          <p className="text-sm text-gray-600 mb-2">
            Set Expiry Date and Time ⏳:
          </p>
          <input
            type="datetime-local"
            value={newNote.expires_at}
            onChange={(e) =>
              setNewNote({ ...newNote, expires_at: e.target.value })
            }
            className="w-full p-2 border rounded"
            required
            min={new Date().toISOString().slice(0, 16)}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white w-full p-2 rounded"
          >
            Create Note
          </button>
        </form>
      </div>
    </div>
  );
};

export default Notes;
