import React from 'react';
import { UserAgentApplication } from 'msal';

import { config } from './config';

export interface AuthComponentProps {
  error: any;
  isAuthenticated: boolean;
  user: any;
  login: Function;
  logout: Function;
  getAccessToken: Function;
  setError: Function;
}

interface AuthProviderState {
  error: any;
  isAuthenticated: boolean;
  user: any;
}

export default function withAuthProvider<T extends React.Component<AuthComponentProps>>
  (WrappedComponent: new(props: AuthComponentProps, context?: any) => T): React.ComponentClass {
  return class extends React.Component<any, AuthProviderState> {
    private userAgentApplication: UserAgentApplication;

    constructor(props: any) {
      super(props);
      this.state = {
        error: null,
        isAuthenticated: false,
        user: {}
      };

      this.userAgentApplication = new UserAgentApplication({
        auth: {
            clientId: config.appId,
            redirectUri: config.redirectUri
        },
        cache: {
            cacheLocation: "sessionStorage",
            storeAuthStateInCookie: true
        }
      });
    }

    componentDidMount() {
      var account = this.userAgentApplication.getAccount();

      if (account) {
        this.getUserProfile();
      }
    }

    async login() {
      try {
        // Login via popup
        await this.userAgentApplication.loginPopup(
            {
              scopes: config.scopes,
              prompt: "select_account"
          });
        await this.getUserProfile();
      }
      catch(err) {
        this.setState({
          isAuthenticated: false,
          user: {},
          error: this.normalizeError(err)
        });
      }
    }

    logout() {
      this.userAgentApplication.logout();
    }

    async getAccessToken(scopes: string[] = config.scopes): Promise<string> {
      try {
        var silentResult = await this.userAgentApplication.acquireTokenSilent({
          scopes: scopes
        });

        return silentResult.accessToken;
      } catch (err) {
        if (this.isInteractionRequired(err)) {
          var interactiveResult = await this.userAgentApplication.acquireTokenPopup({
            scopes: scopes
          });

          return interactiveResult.accessToken;
        } else {
          throw err;
        }
      }
    }

    async getUserProfile() {
      try {
        var accessToken = await this.getAccessToken(config.scopes);

        if (accessToken) {
          this.setState({
            isAuthenticated: true,
            error: { message: "Access token:", debug: accessToken }
          });
        }
      }
      catch(err) {
        this.setState({
          isAuthenticated: false,
          user: {},
          error: this.normalizeError(err)
        });
      }
    }

    setErrorMessage(message: string, debug: string) {
      this.setState({
        error: {message: message, debug: debug}
      });
    }

    normalizeError(error: string | Error): any {
      var normalizedError = {};
      if (typeof(error) === 'string') {
        var errParts = error.split('|');
        normalizedError = errParts.length > 1 ?
          { message: errParts[1], debug: errParts[0] } :
          { message: error };
      } else {
        normalizedError = {
          message: error.message,
          debug: JSON.stringify(error)
        };
      }
      return normalizedError;
    }

    isInteractionRequired(error: Error): boolean {
      if (!error.message || error.message.length <= 0) {
        return false;
      }

      return (
        error.message.indexOf('consent_required') > -1 ||
        error.message.indexOf('interaction_required') > -1 ||
        error.message.indexOf('login_required') > -1
      );
    }

    render() {
      const { error, user, isAuthenticated } = this.state;
      return <WrappedComponent
        error={error}
        isAuthenticated={isAuthenticated}
        user = {user}
        login = { () => this.login() }
        logout = { () => this.logout() }
        getAccessToken = { (scopes: string[]) => this.getAccessToken(scopes)}
        setError = { (message: string, debug: string) => this.setErrorMessage(message, debug)}
        {...this.props} {...this.state} />;
    }
  }
}