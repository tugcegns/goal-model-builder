import React from 'react';
import './App.css';
import MainPage from "./MainPage";
import Home from "./Home";
import First from "./First";
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

function App() {
  return (
    <Router>
        <Switch>
          <Route exact path="/" component={Home}/>
          <Route exact path="/playground" component={MainPage} />
          <Route exact path="/first" component={First} />   
          <Redirect to='/' />
        </Switch>
    </Router>
  );
}

export default App;
