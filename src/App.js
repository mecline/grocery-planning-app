import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';
import PrivateRoute from './firebase/PrivateRoute';
import { UserContextProvider } from './firebase/UserContext';
import HomePage from './pages/HomePage.js';
import ListPage from './pages/ListPage';
import MealPage from './pages/MealPage';
import Navigation from './pages/Navigation';
import EmailSender from './components/EmailSender';

class App extends React.Component {

  render() {

    return (
      <div style={{
        backgroundImage: "url(/knifeGreensBorder.jpg)",
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        width: '100vw',
        height: '100vh'
      }}>
        <UserContextProvider>
          <Router>
            <Navigation />
            <Routes>
              <Route exact path='/' element={<PrivateRoute><EmailSender /></PrivateRoute>} />
              <Route path='/meals' element={<PrivateRoute><MealPage /></PrivateRoute>} />
              <Route path='/list' element={<PrivateRoute><ListPage /></PrivateRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </Router>
        </UserContextProvider>
      </div >
    );
  }
}

export default App;
