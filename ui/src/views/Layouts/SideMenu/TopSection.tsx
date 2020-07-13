import React  from 'react';
import _ from 'lodash';
import TopSectionItem from './TopSectionItem';
import { menuItems,MenuItem, MenuPosition } from 'src/routes';
import { addParamToUrl } from 'src/core/library/utils/url';
import { getLocationSrv } from 'src/packages/datav-core/src';


const TopSection = () => {
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
