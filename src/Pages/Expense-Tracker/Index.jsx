import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../Config/Firebase-config';
import { Link } from 'react-router-dom';
import { collection, addDoc, query, where, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';

import "./Expense.css";

const Index = () => {
  const navigate = useNavigate();
  const [authInfo, setAuthInfo] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });
  const [budget, setBudget] = useState(0);
  const [newBudget, setNewBudget] = useState('');
  const [editingExpense, setEditingExpense] = useState(null); 
  const [expenseToEdit, setExpenseToEdit] = useState({ description: '', amount: '' }); 
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState([]);
  const fetchExpenses = async (userID) => {
    const q = query(collection(db, 'expenses'), where('userID', '==', userID));
    const querySnapshot = await getDocs(q);
    const expensesData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setExpenses(expensesData);
  };

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
  

  const handleEditNote = async (id, newText) => {
    try {
      const noteRef = doc(db, 'notes', id);
      await setDoc(noteRef, { text: newText }, { merge: true });
      setNotes(notes.map(note => note.id === id ? { ...note, text: newText } : note));
    } catch (error) {
      console.error("Error editing note: ", error);
    }
  };
  
  useEffect(() => {
    const storedAuthInfo = localStorage.getItem('auth');
    if (storedAuthInfo) {
      const parsedAuthInfo = JSON.parse(storedAuthInfo);
      setAuthInfo(parsedAuthInfo);
      fetchExpenses(parsedAuthInfo.userID);
      fetchBudget(parsedAuthInfo.userID);
    } else {
      navigate('/');
    }
  }, [navigate]);
  
  const fetchBudget = async (userID) => {

    const budgetDoc = doc(db, 'budgets', userID);
    const budgetSnapshot = await getDoc(budgetDoc);
    if (budgetSnapshot.exists()) {
    
      setBudget(budgetSnapshot.data().amount || 0);
    } else {
   
      setBudget(0);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('auth');
    navigate('/');
  };

  const handleAddExpense = async () => {
    if (newExpense.description && newExpense.amount) {
      const expenseData = {
        userID: authInfo.userID,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        timestamp: new Date()
      };
      await addDoc(collection(db, 'expenses'), expenseData);
      fetchExpenses(authInfo.userID);
      setNewExpense({ description: '', amount: '' });
    }
  };

  const handleSetBudget = async () => {
    if (newBudget) {
      const budgetData = {
        amount: parseFloat(newBudget)
      };
      await setDoc(doc(db, 'budgets', authInfo.userID), budgetData, { merge: true });
      setBudget(parseFloat(newBudget));
      setNewBudget('');
    }
  };

  const handleDeleteExpense = async (id) => {
    await deleteDoc(doc(db, 'expenses', id));
    fetchExpenses(authInfo.userID);
  };

  const handleEditExpense = async () => {
    if (expenseToEdit.description && expenseToEdit.amount) {
      const expenseRef = doc(db, 'expenses', editingExpense.id);
      await setDoc(expenseRef, {
        description: expenseToEdit.description,
        amount: parseFloat(expenseToEdit.amount)
      }, { merge: true });
      setEditingExpense(null);
      setExpenseToEdit({ description: '', amount: '' });
      fetchExpenses(authInfo.userID);
    }
  };

  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
  const remainingBudget = budget - totalExpenses;

  return (
    
    <div className="expense-page">
      {authInfo ? (
        <div className="user-info">
          <img 
            src={authInfo.profilePhoto} 
            alt={authInfo.name} 
            className="user-photo" 
            onError={(e) => { e.target.onerror = null; e.target.src = "default-photo-url.jpg"; }} 
          />
          <h1>Welcome,<span>{authInfo.name}</span> </h1>
           <Link to={"/note"}> <button  className="logout-btn" > Add Note</button></Link>
          <button className="logout-btn" onClick={handleLogout}>Log Out</button>
        
        </div>
      ) : (
        <p>Loading...</p>
      )}

            <div className="notes-list">
                {notes.map(note => (
                    <div key={note.id} className="note-card">
                        <p>{note.text}</p>
                        <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
                        <button onClick={() => handleEditNote(note.id, prompt("Edit your note", note.text))}>Edit</button>
                    </div>
                ))}
            </div>
      <div className="budget-section">
        <h2>Set Your Budget</h2>
    
        <input
          type="number"
          placeholder="Total Budget"
          value={newBudget}
          onChange={(e) => setNewBudget(e.target.value)}
        />
        <button onClick={handleSetBudget}>Set Budget</button>
        <div className='card'>
          <div className='card-one'>
          <h3>Current Budget: ৳{budget.toFixed(2)} TK</h3>
          </div>
          <div className="card-two">
          <h3>Remaining Budget: ৳{remainingBudget.toFixed(2)} TK</h3>
          </div>
        
        </div>
 
      </div>

      <div className="expense-form">
        <input
          type="text"
          placeholder="Description"
          value={newExpense.description}
          onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
        />
        <input
          type="number"
          placeholder="Amount"
          value={newExpense.amount}
          onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
        />
        <button onClick={handleAddExpense}>Add Expense</button>
      </div>

      {editingExpense && (
        <div className="expense-edit-form">
          <h2>Edit Expense</h2>
          <input
            type="text"
            placeholder="New Description"
            value={expenseToEdit.description}
            onChange={(e) => setExpenseToEdit({ ...expenseToEdit, description: e.target.value })}
          />
          <input
            type="number"
            placeholder="New Amount"
            value={expenseToEdit.amount}
            onChange={(e) => setExpenseToEdit({ ...expenseToEdit, amount: e.target.value })}
          />
          <button onClick={handleEditExpense}>Save Changes</button>
          <button onClick={() => setEditingExpense(null)}>Cancel</button>
        </div>
      )}

      <div className="expenses-list">
        <h2>Your Expenses</h2>
        <ul>
          {expenses.map(expense => (
            <li key={expense.id}>
           <b>  {expense.description}: ৳{expense.amount.toFixed(2)} TK</b> 
              <button onClick={() => {
                setEditingExpense(expense);
                setExpenseToEdit({ description: expense.description, amount: expense.amount });
              }} className='edit'>Edit</button>
              <button onClick={() => handleDeleteExpense(expense.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
      <footer className="footer">
    
      <button 
        className="chat-with-me-btn"
        onClick={() => window.open('https://wa.me/+8801568885065', '_blank')}
      >
        Chat with Dev..
      </button>
    </footer>
    </div>
  );
};

export default Index;
