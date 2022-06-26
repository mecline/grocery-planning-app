import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';
import PrivateRoute from './firebase/PrivateRoute';
import { UserContextProvider } from './firebase/UserContext';
import HomePage from './pages/HomePage.js';
import ListPage from './pages/ListPage';
import MealPage from './pages/MealPage';
import Navigation from './pages/Navigation';
import MealPlannerTheme from './theme/MealPlannerTheme';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      anchorEl: undefined,
      menuOpen: false,
      mealViewActive: true
    };
  }

  handleMenuOpen = (event) => {
    this.setState({ menuOpen: !this.state.menuOpen, anchorEl: event.currentTarget });
  }

  handleMenuClose = () => {
    this.setState({ menuOpen: !this.state.menuOpen });
  }

  handleViewChange = (page) => {
    if (page.id === 'listView') {
      this.setState({ mealViewActive: false, menuOpen: false });
    }
    if (page.id === 'mealView') {
      this.setState({ mealViewActive: true, menuOpen: false });
    }
  }

  render() {

    return (
      <div>
        <UserContextProvider>
          <Router>
            <Navigation />
            <Routes>
              {/* <PrivateRoute exact path="/" element={<HomePage />} /> */}

              <Route exact path='/' element={<PrivateRoute />}>
                <Route exact path='/' element={<MealPage />} />
              </Route>
              <Route path='/meals' element={<PrivateRoute><MealPage /></PrivateRoute>} />
              <Route path='/list' element={<PrivateRoute><ListPage /></PrivateRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </Router>
        </UserContextProvider>
      </div >
    );
  }
}

export default App;
