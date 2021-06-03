import './App.css';
import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import MainView from './view/MainView';
import ShareView from './view/ShareView';

class App extends React.Component {

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path='/' component={MainView} />
          <Route exect path='/share/:id' component={ShareView} />
        </Switch>
      </Router>
    )
  }
}

export default App;
