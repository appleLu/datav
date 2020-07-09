import React, { FC, PureComponent } from 'react';
import { DataSourcePluginMeta, NavModel, getBackendSrv } from 'src/packages/datav-core';
import { List } from 'src/packages/datav-core';
import Page from '../../Layouts/Page/Page';
import { DataSourcePluginCategory } from 'src/types';
import { Card } from '../../components/Card/Card';
import Button from 'antd/es/button';
import {buildCategories} from './build_categories'
import './NewDataSourcePage.less'
import { withRouter } from 'react-router-dom';

export interface Props {
  history: any;
}

interface State {
  plugins: DataSourcePluginMeta[];
  categories: DataSourcePluginCategory[];
}

const navModel = getNavModel()
class NewDataSourcePage extends PureComponent<Props,State> {
  constructor(props) {
    super(props)
    this.state = {
      plugins: [],
      categories: []
    }
  }
  componentDidMount() {
    this.loadDataSourcePlugins();
  }

  async loadDataSourcePlugins() {
    const res = await getBackendSrv().get('/api/plugins', {type: 'datasource' });
    const plugins = res.data
    const categories = buildCategories(plugins);
    this.setState({
      plugins,categories
    })
  }

  onDataSourceTypeClicked = (plugin: DataSourcePluginMeta) => {
     this.props.history.push('/datasources/edit/' + plugin.id)
  };


  renderPlugins(plugins: DataSourcePluginMeta[]) {
    if (!plugins || !plugins.length) {
      return null;
    }

    return (
      <List
        items={plugins}
        getItemKey={item => item.id.toString()}
        renderItem={item => (
          <DataSourceTypeCard
            plugin={item}
            onClick={() => this.onDataSourceTypeClicked(item)}
            onLearnMoreClick={this.onLearnMoreClick}
          />
        )}
      />
    );
  }

  onLearnMoreClick = (evt: React.SyntheticEvent<HTMLElement>) => {
    evt.stopPropagation();
  };

  renderCategories() {
    const { categories } = this.state;

    return (
      <>
        {categories.map(category => (
          category.plugins.length > 0 &&
          <div className="add-data-source-category" key={category.id}>
            <div className="add-data-source-category__header">{category.title}</div>
            {this.renderPlugins(category.plugins)}
          </div>
        ))}
        {/* <div className="add-data-source-more">
          <a
            href="https://grafana.com/plugins?type=datasource&utm_source=grafana_add_ds"
            target="_blank"
            rel="noopener"
          >
            Find more data source plugins on grafana.com
          </a>
        </div> */}
      </>
    );
  }

  render() {
    return (
      <Page navModel={navModel}>
        <Page.Contents isLoading={this.state.plugins.length <= 0}>
          <div>
            {this.renderCategories()}
          </div>
        </Page.Contents>
      </Page>
    );
  }
}

interface DataSourceTypeCardProps {
  plugin: DataSourcePluginMeta;
  onClick: () => void;
  onLearnMoreClick: (evt: React.SyntheticEvent<HTMLElement>) => void;
}

const DataSourceTypeCard: FC<DataSourceTypeCardProps> = props => {
  const { plugin, onLearnMoreClick } = props;
  const isPhantom = plugin.module === 'phantom';
  const onClick = !isPhantom ? props.onClick : () => {};

  // find first plugin info link
  const learnMoreLink = plugin.info.links && plugin.info.links.length > 0 ? plugin.info.links[0] : null;

  return (
    <Card
      title={plugin.name}
      description={plugin.info.description}
      logoUrl={plugin.info.logos.small}
      actions={
        <>
          {learnMoreLink && (
            <a
              href={`${learnMoreLink.url}?utm_source=grafana_add_ds`}
              target="_blank"
              rel="noopener"
              onClick={onLearnMoreClick}
            >
              {learnMoreLink.name}
            </a>
          )}
          {!isPhantom && <Button>Select</Button>}
        </>
      }
      className={isPhantom ? 'add-data-source-item--phantom' : ''}
      onClick={onClick}
    />
  );
};

export function getNavModel(): NavModel {
  const main = {
    icon: 'database',
    id: 'datasource-new',
    text: 'Add data source',
    href: 'datasources/new',
    title: 'Choose a data source type',
  };

  return {
    main: main,
    node: main,
  };
}

export default withRouter(NewDataSourcePage);
