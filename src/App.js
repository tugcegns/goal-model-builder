import React from 'react';
import './App.css';
import MainPage from "./MainPage";
import Home from "./Home";
import ReactUSUpload from "./uploadUS";
import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

function App() {
  return (
    <Router>
        <Switch>
          <Route exact path="/" component={Home}/>
          <Route exact path="/playground" component={MainPage} />
          <Route exact path="/first" component={ReactUSUpload} />   
          <Redirect to='/' />
        </Switch>
    </Router>
  );
}

export default App;
