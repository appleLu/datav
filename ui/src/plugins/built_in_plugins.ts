/* Datasource Plugins*/
import * as singlestatPanel2 from 'src/plugins/panel/stat/module';
import * as GraphPanel from 'src/plugins/panel/graph/module';

const prometheusPlugin = async () =>
    await import(/* webpackChunkName: "prometheusPlugin" */ 'src/plugins/datasource/prometheus/module');


export const builtInPlugins = {
    'src/plugins/datasource/prometheus/module': prometheusPlugin,

    'src/plugins/panel/stat/module': singlestatPanel2,
    'src/plugins/panel/graph/module': GraphPanel
}
