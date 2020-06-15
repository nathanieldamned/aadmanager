import React from 'react';
import Section from '../../components/Section';
import { ActiveDirectoryApi } from '../../api/ActiveDirectoryApi';
import { DetailsList, IColumn, SelectionMode, PrimaryButton, Stack, Dialog, DialogFooter, DefaultButton, DialogType, DialogContent } from '@fluentui/react';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import withAuthProvider, { AuthComponentProps } from '../../AuthProvider';
import './style.scss';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { routeMap } from '../../routeMap';

type State = {
  users: MicrosoftGraph.User[];
  selectedUserId?: string;
  remove: boolean;
}

type Props = AuthComponentProps & RouteComponentProps;

const columns: IColumn[] = [
  {
    key: 'name',
    name: 'Full name',
    fieldName: 'displayName',
    minWidth: 100,
  },
  {
    key: 'surname',
    name: 'Surname',
    fieldName: 'surname',
    minWidth: 200,
  },
  {
    key: 'givenName',
    name: 'Given name',
    fieldName: 'givenName',
    minWidth: 200,
  },
  {
    key: 'upn',
    name: 'Email address',
    fieldName: 'userPrincipalName',
    minWidth: 300,
  }
]

class Users extends React.PureComponent<Props, State>  {
  constructor(props: Props) {
    super(props);
    this.state = {
      users: [],
      remove: false,
    }
  }

  componentDidMount() {
    this.fetchUsers();
  }

  async fetchUsers() {
    const { getAccessToken } = this.props;
    const users = await ActiveDirectoryApi.getUsers(getAccessToken());
    this.setState({ users });
  }

  handleActiveItemChanged = (item?: MicrosoftGraph.User) => {
    this.setState({
      selectedUserId: item?.id ?? undefined,
    });
  }

  handleEditUserClick = () => {
    const { selectedUserId } = this.state;
    const { history } = this.props;
    if (!selectedUserId) { return; }
    history.push(`${routeMap.ad.user}/${selectedUserId}`);
  }

  handleRemoveUserClick = () => {
    const { selectedUserId } = this.state;
    if (!selectedUserId) { return; }
    this.setState({
      remove: true,
    })
  }

  handleCloseDialogClick = () => {
    this.setState({
      remove: false,
    })
  }

  handleConfirmRemoveUserClick = async () => {
    this.handleCloseDialogClick();
    const { selectedUserId } = this.state;
    if (!selectedUserId) { return; }
    const { getAccessToken } = this.props;
    await ActiveDirectoryApi.deleteUser(getAccessToken(), selectedUserId);
    this.fetchUsers();    
  }

  render() {
    const { users, selectedUserId, remove } = this.state;
    const user = selectedUserId ? users.find(u => u.id === selectedUserId) : null;
    return (
      <Section header="Users">
        <DetailsList items={users} columns={columns} selectionMode={SelectionMode.single} onActiveItemChanged={this.handleActiveItemChanged} />
        <Stack className="users-buttons">
          <PrimaryButton disabled={!selectedUserId} onClick={this.handleEditUserClick}>Edit user</PrimaryButton>
          <PrimaryButton disabled={!selectedUserId} onClick={this.handleRemoveUserClick}>Remove user</PrimaryButton>
        </Stack>
        <Dialog
          hidden={!remove}
          onDismiss={this.handleCloseDialogClick}
          type={DialogType.normal}
          title="Remove user"
        >
          <DialogContent>Do you really want to remove user "{user?.displayName}"?</DialogContent>
          <DialogFooter>
            <PrimaryButton onClick={this.handleConfirmRemoveUserClick} text="Send" />
            <DefaultButton onClick={this.handleCloseDialogClick} text="Cancel" />
          </DialogFooter>
        </Dialog>
      </Section>
    )
  }
}

export default withAuthProvider(withRouter(Users));