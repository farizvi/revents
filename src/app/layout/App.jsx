import React, { Component } from 'react';
import { Container } from 'semantic-ui-react'
import { Route, Switch } from 'react-router-dom'
import HomePage from '../../features/home/HomePage'
import EventDashboard from '../../features/event/EventDashboard/eventDashboard'
import EventDetailedPage from '../../features/event/EventDetailed/EventDetailedPage'
import PeopleDashboard from '../../features/user/PeopleDashboard/PeopleDashboard'
import UserDetailedPage from '../../features/user/UserDetailed/UserDetailedPage'
import SettingsDashboard from '../../features/user/Settings/SettingsDashboard'
import EventForm from '../../features/event/EventForm/EventForm'
import NavBar from '../../features/nav/NavBar/NavBar'
import TestComponent from '../../features/testarea/TestComponent';

class App extends Component {
  render() {
    return (
      <div>
        <Switch>
          <Route exact path='/' component={HomePage} />
        </Switch>
        <Route path="/(.+)" 
          render={() => (
            <div>
              <NavBar />
              <Container className="main">
                <Switch>              
                  <Route path='/events' component={EventDashboard} />
                  <Route path='/test' component={TestComponent} />
                  <Route path='/event/:id' component={EventDetailedPage} />
                  <Route path='/people' component={PeopleDashboard} />
                  <Route path='/profile/:id' component={UserDetailedPage} />
                  <Route path='/settings' component={SettingsDashboard} />
                  <Route path='/createEvent' component={EventForm} />
                </Switch>
              </Container>
            </div>
          )} />              
      </div>
    );
  }
}

export default App;
