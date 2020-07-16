import React from 'react';
import _ from 'lodash';
import BottomNavLinks from './BottomNavLinks';
import { contextSrv } from 'src/core/services/context';
import { MenuItem, MenuPosition} from 'src/types';
import {store} from 'src/store/store'


export default function BottomSection() {
  const menuItems = store.getState().menu.items
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
