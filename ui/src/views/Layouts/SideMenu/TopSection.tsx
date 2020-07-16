import React  from 'react';
import _ from 'lodash';
import TopSectionItem from './TopSectionItem';
import { MenuItem, MenuPosition } from 'src/types';
import { getLocationSrv } from 'src/packages/datav-core/src';
import {store} from 'src/store/store'


const TopSection = () => {
  const menuItems = store.getState().menu.items
  const mainLinks = _.filter(menuItems, (item:MenuItem) => item.showPosition === MenuPosition.Top);
  const searchLink:MenuItem= {
    text: 'Search',
    icon: 'search',
    sortWeight: -50,
    url: ''
  };

  const onOpenSearch = () => {
    getLocationSrv().update({ query: { search: 'open' }, partial: true });
  };

  return (
    <div className="sidemenu__top">
      {mainLinks.map((link) => {
        return <TopSectionItem link={link} key={link.url} />;
      })}
      <TopSectionItem link={searchLink} onClick={onOpenSearch} />
    </div>
  );
};

export default TopSection;
