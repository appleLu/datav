// Libraries
import React, { PureComponent } from 'react';

// Components
import Page from '../../Layouts/Page/Page';
// Types
import {  NavModel } from 'src/packages/datav-core';
import { getNavModel } from '../../Layouts/Page/navModel';
import { withRouter } from 'react-router-dom';

import DashboardListPage from 'src/views/search/components/DashboardListPage'

 

export interface Props {
  routeID: string;
  parentRouteID: string;
  navModel: NavModel;


  hasFetched: boolean;
}

interface State {

}

export class DatasourceListPage extends PureComponent<Props&any,State> {
  constructor(props) {
    super(props)
    this.state = {
      
    }
  }
  componentDidMount() {
    
  }
  

  render() {
    const hasFetched= true
    const {routeID,parentRouteID} = this.props
    const navModel = getNavModel(routeID,parentRouteID)


    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={!hasFetched}>
          <>
            <DashboardListPage />
          </>
        </Page.Contents>
      </Page>
    );
  }
}



export default withRouter(DatasourceListPage);
