import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { NoMatch } from './components/';

import App from './App';

function Routes() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact component={App} />
        <Route component={NoMatch} />
      </Switch>
    </Router>
  );
}

export default Routes;
