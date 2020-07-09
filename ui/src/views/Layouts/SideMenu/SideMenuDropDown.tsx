import React, { FC } from 'react';
// import _ from 'lodash';
import DropDownChild from './DropDownChild';
import { Link } from 'react-router-dom'
import { MenuItem } from 'src/routes';

interface Props {
  link: MenuItem;
  onHeaderClick?: () => void;
}

const SideMenuDropDown: FC<Props> = props => {
  const { link, onHeaderClick } = props;
  let childrenLinks: MenuItem[] = [];
  if (link.children) {
    // childrenLinks = _.filter(link.children, item => !item.hideFromMenu);
    childrenLinks = link.children
  }

  let renderLink: any
  if (link.url === '') {
    renderLink =
    // eslint-disable-next-line 
      <a className="side-menu-header-link" onClick={onHeaderClick}>
        <span className="sidemenu-item-text">{link.text}</span>
      </a>
  } else {
      if (!link.redirectTo) {
        renderLink = 
        <Link className="side-menu-header-link" to={link.url} onClick={onHeaderClick}>
          <span className="sidemenu-item-text">{link.text}</span>
        </Link>
      } else {
        link.redirectTo === null
        ?
        renderLink = 
        <span className="side-menu-header-link" >
          <span className="sidemenu-item-text">{link.text}</span>
        </span>
        :
        renderLink = 
        <Link className="side-menu-header-link" to={link.redirectTo} onClick={onHeaderClick}>
          <span className="sidemenu-item-text">{link.text}</span>
        </Link>
      }
  }
  return (
    <ul className="dropdown-menu dropdown-menu--sidemenu" role="menu">
      <li className="side-menu-header">
        {
          renderLink
        }

      </li>
      {childrenLinks.map((child, index) => {
        return <DropDownChild child={child} key={`${child.url}-${index}`} />;
      })}
    </ul>
  );
};

export default SideMenuDropDown;
