
import { BrowserRouter as Router, Route,Routes } from "react-router-dom"
import Auth from "./Pages/Auth/Index"

import Expense from "./Pages/Expense-Tracker/Index"
import Note from "./Pages/Expense-Tracker/Note"
const App = () => {
  return (
    <div className="app">
   
      <Router>

        <Routes>
             <Route path="/" element={<Auth/>}/>
          <Route path="/expense" element={<Expense/>} />
           <Route path="/note" element={<Note/>}/>
        </Routes>
      </Router>
    </div>
  )
}

export default App