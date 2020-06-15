import { Client } from '@microsoft/microsoft-graph-client';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';

class ActiveDirectoryApi {
  static getAuthenticatedClient = async (accessToken: string) => {
    const client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });
    return client;
  }

  static getUsers = async (token: string, limit = 10, offset = 0): Promise<MicrosoftGraph.User[]>  => {
    const client = await ActiveDirectoryApi.getAuthenticatedClient(token);
    const result = await client.api('/users').get();
    return result.value;
  }

  static getUser = async (token: string, id: string): Promise<MicrosoftGraph.User> => {
    const client = await ActiveDirectoryApi.getAuthenticatedClient(token);
    const result = await client.api(`/users/${id}`).get();
    return result;
  }

  static addUser = async (token: string, user: MicrosoftGraph.User): Promise<MicrosoftGraph.User> => {
    const client = await ActiveDirectoryApi.getAuthenticatedClient(token);
    const result = await client.api('/users').post(user);
    if (result.error) {
      throw new Error(result.error);
    }
    return result;
  }

  static updateUser = async (token: string, user: MicrosoftGraph.User): Promise<MicrosoftGraph.User> => {
    const client = await ActiveDirectoryApi.getAuthenticatedClient(token);
    const result = await client.api(`/users/${user.id}`).patch(user);
    return result;
  }

  static deleteUser = async (token: string, id: string): Promise<MicrosoftGraph.User> => {
    const client = await ActiveDirectoryApi.getAuthenticatedClient(token);
    const result = await client.api(`/users/${id}`).delete();
    return result;
  }
}

export { ActiveDirectoryApi };