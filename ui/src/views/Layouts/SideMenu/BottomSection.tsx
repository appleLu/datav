import React from 'react';
import _ from 'lodash';
import BottomNavLinks from './BottomNavLinks';
import { contextSrv } from 'src/core/services/context';
import { menuItems,MenuItem, MenuPosition} from 'src/routes';


export default function BottomSection() {
  const bottomNav: MenuItem[] = _.filter(menuItems, item => item.showPosition === MenuPosition.Bottom);
  // const isSignedIn = contextSrv.isSignedIn;

  return (
    <div className="sidemenu__bottom">
      {bottomNav.map((link, index) => {
        return <BottomNavLinks link={link} user={contextSrv.user} key={`${link.url}-${index}`} />;
      })}
    </div>
  );
}
