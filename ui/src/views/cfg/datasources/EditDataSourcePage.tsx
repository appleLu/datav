import React, { PureComponent } from 'react';
import _ from 'lodash';
import { NavModel, DataSourcePluginMeta, getBootConfig, DataSourcePlugin, DataSourceApi, DataQuery, DataSourceJsonData, DataSourceSettings, getBackendSrv, setBootConfig } from 'src/packages/datav-core'
import { withRouter } from 'react-router-dom';
import { Form, Input, Button, Switch, Row, Col, Card, Alert, Popconfirm, message } from 'antd';

import Page from 'src/views/Layouts/Page/Page';
import { loadDataSourcePlugin, testDataSource } from 'src/plugins/loader';
import { PluginSettings } from './PluginSettings'
import globalEvents from 'src/views/App/globalEvents';

type GenericDataSourcePlugin = DataSourcePlugin<DataSourceApi<DataQuery, DataSourceJsonData>>;
interface Props {

}

interface State {
    mode: string
    dataSource: DataSourceSettings;
    datasourceMeta: DataSourcePluginMeta
    navModel: NavModel
    plugin?: GenericDataSourcePlugin
    hasFetched: boolean
    testingStatus?: {
        status: boolean
        message?: any
    }
}

enum DatasourceMode {
    New = "new",
    Edit = "edit"
}

const layout = {
    wrapperCol: { span: 16 },
    labelCol: { span: 16 }
};

export class EditDataSourcePage extends PureComponent<Props & any, State> {
    constructor(props) {
        super(props)
        const datasourceId = _.toNumber(this.props.match.params.datasourceID)
        let mode = DatasourceMode.Edit
        if (!datasourceId) {
            // not number, new datasource mode, otherwise, edit datasource mode
            mode = DatasourceMode.New
        }


        let ds;
        if (mode === DatasourceMode.New) {
            ds = {
                isDefault: Object.keys(getBootConfig().datasources).length === 0,
                name: '',
                url: '',
                jsonData: {
                }
            }
        }

        let meta: DataSourcePluginMeta;
        let node = {} as any
        let hasFetched = false
        if (mode === DatasourceMode.New) {
            meta = getBootConfig().datasourceMetas[this.props.match.params.datasourceID]
            ds.type = meta.id
            node = {
                img: meta.info.logos.small,
                id: 'datasource-new',
                text: 'Add Data Source',
                href: 'datasources/new',
                title: 'Type: ' + meta.name,
            }
            hasFetched = true
        }


        this.state = {
            mode: mode,
            datasourceMeta: meta,
            navModel: {
                main: node,
                node: node,
            },
            dataSource: ds,
            hasFetched: hasFetched
        }

        this.onFinish = this.onFinish.bind(this)
    }

    async componentWillMount() {
        if (this.state.mode === DatasourceMode.Edit) {
            const res = await getBackendSrv().get(`/api/datasources/${this.props.match.params.datasourceID}`)
            const ds: DataSourceSettings = res.data
            const meta = getBootConfig().datasourceMetas[ds.type]
            const node = {
                img: meta.info.logos.small,
                id: 'datasource-new',
                text: 'Edit Data Source',
                href: 'datasources/new',
                title: 'Type: ' + meta.name,
            }

            this.setState({
                ...this.state,
                dataSource: ds,
                datasourceMeta: meta,
                hasFetched: true,
                navModel: {
                    main: node,
                    node: node,
                },
            })
        }

        const plugin = await loadDataSourcePlugin(this.state.datasourceMeta.id)
        this.setState({
            ...this.state,
            plugin
        })

    }

    async delDataSource() {
        const res = await getBackendSrv().delete(`/api/datasources/${this.state.dataSource.id}`)

        const res1 = await getBackendSrv().get('/api/bootConfig');
        setBootConfig(res1.data)

        if (res.status === 'success') {
            globalEvents.showMessage(() => message.success('Data source Deleted!'))


            this.props.history.push('/cfg/datasources')
        }
    }

    async onFinish() {
        // save options to backend
        if (this.state.mode === DatasourceMode.New) {
            const res = await getBackendSrv().post('/api/datasources/new', this.state.dataSource)
            this.setState({
                ...this.state,
                dataSource: res.data
            })
            const res1 = await getBackendSrv().get('/api/bootConfig');
            setBootConfig(res1.data)
            // replace url with datasource id
            this.props.history.replace('/datasources/edit/' + this.state.dataSource.id)
        } else {
            getBackendSrv().put('/api/datasources/edit', this.state.dataSource)
        }


        testDataSource(this.state.dataSource.name).then(() => {
            this.setState({
                ...this.state,
                testingStatus: {
                    status: true
                }
            })
        }).catch((err) => {
            this.setState({
                ...this.state,
                testingStatus: {
                    status: true,
                    message: err.message
                }
            })
        })
    };

    onFinishFailed(errorInfo) {
        console.log('Failed:', errorInfo);
    };

    render() {
        return (
            <Page navModel={this.state.navModel}>
                <Page.Contents isLoading={!this.state.hasFetched}>
                    {
                        this.state.hasFetched &&
                        <Form
                            {...layout}
                            // layout="vertical"
                            name="basic"
                            onFinish={this.onFinish}
                            onFinishFailed={this.onFinishFailed}
                        >
                            <Card title="Basic Settings" style={{ width: '80%' }}>
                                <Form.Item>
                                    <Row>
                                        <Col span="14">
                                            <Form.Item
                                                label="Name"
                                            >   
                                                <Input placeholder="Name" defaultValue={this.state.dataSource.name} onChange={(e) => { this.setState({...this.state,dataSource: {...this.state.dataSource,name: e.currentTarget.value }})}} />
                                            </Form.Item>
                                        </Col>

                                        <Col span="8" offset="1">
                                            <Form.Item
                                                label={<span>Default</span>}
                                                valuePropName="checked"
                                            >
                                                <Switch defaultChecked={this.state.dataSource.isDefault} onChange={(v) => {this.setState({...this.state,dataSource: {...this.state.dataSource,isDefault: v }})}} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form.Item>
                            </Card>


                            <Card title="HTTP Settings" style={{ width: '80%', marginTop: '4px' }}>
                                <Form.Item>
                                    <Row>
                                        <Col span="14">
                                            <Form.Item
                                                label="URL"
                                            >
                                                <Input placeholder="http://10.77.64.59:9090" defaultValue={this.state.dataSource.url} onChange={(e) => { this.setState({...this.state,dataSource: {...this.state.dataSource,url: e.currentTarget.value }})}} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Form.Item>
                            </Card>

                            <Card title={`${this.state.datasourceMeta.name} Plugin Settings`} style={{ width: '80%', marginTop: '4px' }}>
                                {this.state.plugin && (
                                    <PluginSettings
                                        plugin={this.state.plugin}
                                        dataSource={this.state.dataSource}
                                    />
                                )}
                                {
                                    this.state.testingStatus && this.state.testingStatus.status && !this.state.testingStatus.message && <Alert
                                        message="Congratulations"
                                        description="Data source is working"
                                        type="success"
                                        showIcon
                                    />
                                }
                                {
                                    this.state.testingStatus && this.state.testingStatus.status && this.state.testingStatus.message && <Alert
                                        message="Test Failed"
                                        description={this.state.testingStatus.message}
                                        type="error"
                                        showIcon
                                    />
                                }

                            </Card>

                            <Form.Item style={{ marginTop: '8px', marginLeft: '4px' }} >
                                <Button type="primary" htmlType="submit">
                                    Save & Test
                                </Button>
                                <Popconfirm
                                    title="Are you sure you want to delete this data source?"
                                    onConfirm={() => this.delDataSource()}
                                    okText="Delete"
                                    cancelText="Cancel"
                                >
                                    <Button type="primary" danger className="ub-ml2">
                                        Delete
                                </Button>
                                </Popconfirm>

                            </Form.Item>
                        </Form>
                    }
                </Page.Contents>
            </Page>
        );
    }
}



export default withRouter(EditDataSourcePage);