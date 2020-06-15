import React from 'react';
import { Nav, INavStyles, INavLinkGroup, INavLink } from '@fluentui/react';
import { routeMap } from '../../routeMap';
import './style.scss';
import { withRouter, RouteComponentProps } from 'react-router-dom';

const navStyles: Partial<INavStyles> = { root: { width: 300 } };

const navLinkGroups: INavLinkGroup[] = [
  {
    name: 'Active Directory',
    links: [
      {
        key: routeMap.ad.summary,
        url: routeMap.ad.summary,
        name: 'Summary',
      },
      {
        key: routeMap.ad.users,
        url: routeMap.ad.users,
        name: 'Users',
      },
      {
        key: routeMap.ad.user,
        url: routeMap.ad.user,
        name: 'Add new user',
      }
    ]
  },
  {
    name: 'Application',
    links: [
      {
        key: routeMap.app.profile,
        url: routeMap.app.profile,
        name: 'Profile',
      },
      {
        key: routeMap.app.logout,
        url: routeMap.app.logout,
        name: 'Logout',
      },
    ]
  }
];

class MainLayout extends React.PureComponent<RouteComponentProps> {

  handleLinkClick = (e?: React.MouseEvent<HTMLElement, MouseEvent>, item?: INavLink) => {
    if (!e || !item) { return; }
    e.preventDefault();
    const { history } = this.props;
    history.push(item.url);
  }

  render() {
    return (
      <>
        <header className="main-header">
        </header>
        <div className="main-container">
          <Nav groups={navLinkGroups} styles={navStyles} onLinkClick={this.handleLinkClick} />
          <div className="main-section">
            {this.props.children}
          </div>
        </div>
      </>
    );
  }
}

export default withRouter(MainLayout);
