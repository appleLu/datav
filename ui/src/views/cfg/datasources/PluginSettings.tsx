import React, { PureComponent } from 'react';
import _ from 'lodash';
import {
  DataSourceSettings,
  DataSourcePlugin,
  DataSourceApi,
  DataQuery,
  DataSourceJsonData,
} from 'src/packages/datav-core';
export type GenericDataSourcePlugin = DataSourcePlugin<DataSourceApi<DataQuery, DataSourceJsonData>>;

export interface Props {
  plugin: GenericDataSourcePlugin;
  dataSource: DataSourceSettings;
}

export class PluginSettings extends PureComponent<Props> {
  element: any;

  render() {
    const { plugin, dataSource } = this.props;

    if (!plugin) {
      return null;
    }

    return ( 
      <div ref={element => (this.element = element)}>
        {plugin.components.ConfigEditor &&
          React.createElement(plugin.components.ConfigEditor, {
            options: dataSource
          })}
      </div>
    );
  }
}

export default PluginSettings;
