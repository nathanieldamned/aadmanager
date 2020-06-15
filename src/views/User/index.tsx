import React from 'react';
import Section from '../../components/Section';
import { Stack, TextField, PrimaryButton, MessageBar, MessageBarType } from '@fluentui/react';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import { ActiveDirectoryApi } from '../../api/ActiveDirectoryApi';
import withAuthProvider, { AuthComponentProps } from '../../AuthProvider';
import { Redirect } from 'react-router-dom';
import { routeMap } from '../../routeMap';
import { config } from '../../config';
import './style.scss';

type State = {
  saved: boolean,
  displayName?: string;
  surname?: string;
  givenName?: string;
  password?: string;
  password2?: string;
  error?: string;
}

type Props = {
  id?: string;
} & AuthComponentProps;

class User extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      saved: false,
    }
  }

  async componentDidMount() {
    const { id, getAccessToken } = this.props;
    if (id) {
      const user = await ActiveDirectoryApi.getUser(getAccessToken(), id);
      if (user) {
        this.setState({
          displayName: user.displayName,
          surname: user.displayName,
          givenName: user.givenName,
        })
      }
    }
  }

  handleFieldChange = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) => {
    const { name } = e.target as HTMLInputElement;
    this.setState({
      ...this.state,
      [name]: value,
    });
  }

  handleSaveButtonClick = async () => {
    const { id, getAccessToken } = this.props;
    const { displayName, givenName, surname, password, password2 } = this.state;

    if (password !== password2) {
      this.setState({
        error: 'Both password values have to be matched',
      });
      return;
    }

    const mailNickname = `${surname?.toLowerCase()}.${givenName?.toLowerCase()}`;
    const mailDetails = id ? null : {
      mailNickname,
      userPrincipalName: `${mailNickname}@${config.orgDomain}`,
    }
    const user: MicrosoftGraph.User = {
      accountEnabled: true,
      displayName,
      givenName,
      surname,
      passwordProfile: {
        password,
        forceChangePasswordNextSignIn: false,
      },
      ...mailDetails,
    }
    const token = getAccessToken();
    try {
      const result = id ? await ActiveDirectoryApi.updateUser(token, user) : await ActiveDirectoryApi.addUser(token, user);
      if (result) {
        this.setState({
          saved: true,
        })
      }
    }
    catch(e) {
      this.setState({
        error: e.message,
      })
    }
  }

  render() {
    const { id } = this.props;
    const { surname, givenName, displayName, password, password2, error, saved } = this.state;
    if (saved) {
      return <Redirect to={routeMap.ad.users} />;
    }
    return (
      <Section header={id ? 'Edit user' : 'Add new user'}>
        <Stack className="user-form">
          {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}
          <TextField label="Display name" name="displayName" value={displayName} onChange={this.handleFieldChange} />
          <TextField label="Surname" name="surname" value={surname} onChange={this.handleFieldChange} />
          <TextField label="Given name" name="givenName" value={givenName} onChange={this.handleFieldChange} />
          {!id && (
            <>
              <TextField label="Password" name="password" value={password} onChange={this.handleFieldChange} />
              <TextField label="Repeat password" name="password2" value={password2} onChange={this.handleFieldChange} />
            </>
          )}
          <Stack className="buttons">
            <PrimaryButton onClick={this.handleSaveButtonClick}>Save</PrimaryButton>
          </Stack>
        </Stack>
      </Section>
    )
  }
}

export default withAuthProvider(User);