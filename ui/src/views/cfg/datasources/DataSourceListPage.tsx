// Libraries
import React, { PureComponent } from 'react';

// Components
import Page from '../../Layouts/Page/Page';
import DataSourceList from './DataSourceList'
// Types
import { DataSourceSettings, NavModel, getBackendSrv,IconName, LinkButton} from 'src/packages/datav-core';
import EmptyListCTA from 'src/views/components/EmptyListCTA/EmptyListCTA'
import { getNavModel } from '../../Layouts/Page/navModel';
import { withRouter } from 'react-router-dom';




const emptyListModel = {
  title: 'There are no data sources defined yet',
  buttonIcon: 'database' as IconName,
  buttonLink: '/datasources/new',
  buttonTitle: 'Add data source',
  proTip: 'You can also define data sources through configuration files.',
  proTipLink: 'http://docs.grafana.org/administration/provisioning/#datasources?utm_source=grafana_ds_list',
  proTipLinkTitle: 'Learn more',
  proTipTarget: '_blank',
};


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
            {!hasFetched && <div className="ub-right"><LinkButton onClick={() => gotoUrl()}>ADD DATASOURCE</LinkButton></div>}
            <div style={{marginTop: '40px'}}>
            {hasFetched && dataSourses.length === 0 && <EmptyListCTA {...emptyListModel} />}
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
