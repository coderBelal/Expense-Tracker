import { useState, useEffect } from "react";
import { db } from '../../Config/Firebase-config';
import "./Note.css";
import { collection, addDoc, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

const Note = () => {
    const [newNote, setNewNote] = useState("");
    const [notes, setNotes] = useState([]);
    const [editingNote, setEditingNote] = useState(null);
    const [editingText, setEditingText] = useState("");

    const fetchNotes = async () => {
        try {
            const notesCollectionRef = collection(db, 'notes');
            const notesSnapshot = await getDocs(notesCollectionRef);
            const notesData = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setNotes(notesData);
        } catch (error) {
            console.error("Error fetching notes: ", error);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleAddNote = async () => {
        if (newNote.trim()) {
            try {
                const docRef = await addDoc(collection(db, 'notes'), { text: newNote });
                setNotes([...notes, { id: docRef.id, text: newNote }]);
                setNewNote("");
            } catch (error) {
                console.error("Error adding note: ", error);
            }
        }
    };

    const handleDeleteNote = async (id) => {
        try {
            await deleteDoc(doc(db, 'notes', id));
            setNotes(notes.filter(note => note.id !== id));
        } catch (error) {
            console.error("Error deleting note: ", error);
        }
    };

    const handleEditNote = async (id) => {
        setEditingNote(id);
        const noteToEdit = notes.find(note => note.id === id);
        setEditingText(noteToEdit.text);
    };

    const saveEditNote = async (id) => {
        try {
            const noteRef = doc(db, 'notes', id);
            await setDoc(noteRef, { text: editingText }, { merge: true });
            setNotes(notes.map(note => note.id === id ? { ...note, text: editingText } : note));
            setEditingNote(null);
            setEditingText("");
        } catch (error) {
            console.error("Error editing note: ", error);
        }
    };

    return (
        <div className="note-section">
            <h3>Add Your Note</h3>
            <input
                type="text"
                placeholder="Add your note"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
            />
            <button onClick={handleAddNote}>Add Note</button>

            <div className="notes-list">
                {notes.map(note => (
                    <div key={note.id} className="note-card">
                        {editingNote === note.id ? (
                            <div>
                                <input
                                    type="text"
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                />
                                <button onClick={() => saveEditNote(note.id)}>Save</button>
                                <button onClick={() => setEditingNote(null)}>Cancel</button>
                            </div>
                        ) : (
                            <div>
                                <p>{note.text}</p>
                                <div className="flex">
                                    <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
                                    <button onClick={() => handleEditNote(note.id)}>Edit</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Note;
