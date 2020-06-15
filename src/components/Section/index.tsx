import React from 'react';
import './style.scss';

type Props = {
  header: string;
}
class Section extends React.PureComponent<Props> {
  render() {
    const { header, children } = this.props;
    return (
      <div className="section">
        <div className="sectionHeader">
          <h2 className="text">{header}</h2>
        </div>
        <div className="content">
          {children}
        </div>
      </div>
    )
  }
}

export default Section;