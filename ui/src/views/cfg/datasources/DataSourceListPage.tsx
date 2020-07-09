// Libraries
import React, { PureComponent } from 'react';

// Components
import Page from '../../Layouts/Page/Page';
import DataSourceList from './DataSourceList'
// Types
import { DataSourceSettings, NavModel, getBackendSrv } from 'src/packages/datav-core';
import { getNavModel } from '../../Layouts/Page/navModel';
import { withRouter } from 'react-router-dom';
import { Button } from 'antd';
import appEvents from 'src/core/library/utils/app_events';



 

export interface Props {
  routeID: string;
  parentRouteID: string;
  navModel: NavModel;

  searchQuery: string;
  hasFetched: boolean;
}

interface State {
  dataSources: DataSourceSettings[]
}

export class DatasourceListPage extends PureComponent<Props&any,State> {
  constructor(props) {
    super(props)
    this.state = {
      dataSources: []
    }
  }
  componentDidMount() {
    this.fetchDataSources();
  }
  
  async fetchDataSources() {
     const res = await getBackendSrv().get('/api/datasources')
     this.setState({
       ...this.state,
       dataSources: res.data
     })
  }

  render() {
    const {
      searchQuery,
      history
    } = this.props;
    const hasFetched= true
    const {routeID,parentRouteID} = this.props
    const navModel = getNavModel(routeID,parentRouteID)
    const dataSourses = this.state.dataSources

    const gotoUrl = () => {
      history.push('/datasources/new')
    }

    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={!hasFetched}>
          <>
            <div className="ub-right"><Button type="primary" onClick={() => gotoUrl()}>ADD DATASOURCE</Button></div>
            <div style={{marginTop: '40px'}}>
            {hasFetched && dataSourses.length === 0 && <div>Empty Datasources</div>}
            {hasFetched &&
              dataSourses.length > 0 &&
                <DataSourceList dataSources={dataSourses} key="list" />}
            </div>
          </>
        </Page.Contents>
      </Page>
    );
  }
}



export default withRouter(DatasourceListPage);
