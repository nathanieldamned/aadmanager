import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { PrimaryButton } from '@fluentui/react';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import withAuthProvider, { AuthComponentProps } from './AuthProvider';
import MainLayout from './layouts/main';
import { routeMap } from './routeMap';
import Users from './views/Users';
import User from './views/User';

initializeIcons();

class App extends React.PureComponent<AuthComponentProps> {
  handleLoginClick = () => {
    const { login } = this.props;
    login();
  }
  render() {
    const { isAuthenticated, error, logout } = this.props;
    return (
      <Router>
        {!isAuthenticated && (
          <>
            <PrimaryButton onClick={this.handleLoginClick}>Login</PrimaryButton>
            <p>{error && JSON.stringify(error)}</p>
          </>
        )}
        {isAuthenticated && (
          <MainLayout>
            <Route path={routeMap.ad.users} component={Users} />
            <Route path={`${routeMap.ad.user}/:id?`} exact render={(props) => <User {...props.match.params} />} />
            <Route path={routeMap.app.logout} render={() => logout() } />
          </MainLayout>
        )}
      </Router>
    );
  }
}

export default withAuthProvider(App);
