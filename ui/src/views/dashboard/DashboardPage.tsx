import React from 'react';
import _ from 'lodash'
import classNames from 'classnames'

import { DashboardModel } from './model/DashboardModel'
import { Button } from 'antd'
import { DashboardGrid } from './DashGrid'
import { getTimeSrv } from 'src/core/services/time'
import { TimeRange, CustomScrollbar, Icon,config} from 'src/packages/datav-core'

import './DashboardPage.less'
import { initDashboard } from './model/initDashboard';
import { withRouter } from 'react-router-dom';
import { PanelModel } from './model';
import { PanelEditor } from './components/PanelEditor/PanelEditor'
import { store } from 'src/store/store';
import { isInDashboardPage, cleanUpDashboard } from 'src/store/reducers/dashboard';
import { StoreState, CoreEvents } from 'src/types'
import { connect } from 'react-redux';
import appEvents from 'src/core/library/utils/app_events';
import { updateBreadcrumbText } from 'src/store/reducers/application';
import { SaveOutlined, SettingOutlined } from '@ant-design/icons';
import tracker from 'src/core/services/changeTracker'
import { DashboardSettings } from './components/Setting/Setting'
import { updateLocation } from 'src/store/reducers/location';
import { SubMenu } from './components/SubMenu/SubMenu';

interface DashboardPageProps {
    dashboard: DashboardModel | null;
    editPanelId?: string
    viewPanelId?: string
    settingTab?: string | null
    initDashboard: typeof initDashboard
}

interface State {
    uid: string;
    scrollTop: number;
    updateScrollTop?: number;
    rememberScrollTop: number;

    editPanel: PanelModel | null
    viewPanel: PanelModel | null
}

const pathToUID = {
    '/dashboard': 'eQfaaPMGz',
}

class DashboardPage extends React.PureComponent<DashboardPageProps & any, State> {
    // first init dashboard or just saved dashboard
    originDash: DashboardModel;

    constructor(props) {
        super(props)
        this.state = {
            uid: this.getUID(),
            scrollTop: 0,
            rememberScrollTop: 0,

            editPanel: null,
            viewPanel: null
        };


    }

    // uid有两种方式传入：路径名的一部分或者通过路径名去查询uid
    getUID() {
        return this.props.match.params.uid || pathToUID[this.props.location.pathname] || null
    }

    async componentDidMount() {
        // register to changeTracker
        //@todo : 为了方便测试，暂时屏蔽
        // tracker.register(this.hasChanges.bind(this))

        this.init = this.init.bind(this)
        this.props.initDashboard(this.state.uid, (ds) => this.init(ds))

        // register time service notifier
        getTimeSrv().notifyTimeUpdate = this.timeRangeUpdated


        this.saveDashboard = this.saveDashboard.bind(this)
        appEvents.on(CoreEvents.keybindingSaveDashboard, this.saveDashboard)


        appEvents.on(CoreEvents.dashboardSaved, () => {
            this.originDash = _.cloneDeep(this.props.dashboard.getSaveModelClone());
        });


        // because appEvents.off has no effect , so we introduce a state
        store.dispatch(isInDashboardPage(true))
    }

    init(ds) {
        this.originDash = _.cloneDeep(ds)

        store.dispatch(updateBreadcrumbText(ds.title))

        // when dashboard page loaded, we need show setting and save buttons in header nav
        appEvents.emit('set-dashboard-page-header',
            <>
                <Button icon={<Icon name="panel-add" />} onClick={() => this.onAddPanel()} />
                <Button icon={<SaveOutlined onClick={() => this.saveDashboard()} />} />
                <Button icon={<SettingOutlined />} onClick={
                    () => store.dispatch(updateLocation({ query: { settingTab: 'variables' }, partial: true }))
                } />
            </>)

    }
    componentWillUnmount() {
        // unregister from changeTracker
        tracker.unregister()

        appEvents.off(CoreEvents.keybindingSaveDashboard, this.saveDashboard)

        appEvents.emit('set-dashboard-page-header', null)


        // unregister time service notifier
        getTimeSrv().notifyTimeUpdate = null

        store.dispatch(isInDashboardPage(false))

        store.dispatch(cleanUpDashboard())
    }

    componentDidUpdate() {
        const { dashboard } = this.props

        const { editPanel } = this.state
        if (!dashboard) {
            return
        }

        const { editPanelId } = this.props
        if (!editPanel && editPanelId) {
            const panel = this.getPanelByIdFromUrlParam(editPanelId)
            this.setState({
                ...this.state,
                editPanel: panel
            });
        }

        // leaving edit mode
        if (editPanel && !editPanelId) {
            this.setState({
                ...this.state,
                editPanel: null
            });
        }

    }


    hasChanges() {
        const current = cleanDashboardFromIgnoredChanges(this.props.dashboard.getSaveModelClone());
        const original = cleanDashboardFromIgnoredChanges(this.originDash);

        const currentJson = JSON.stringify(current)
        const originalJson = JSON.stringify(original)


        return currentJson !== originalJson;
    }

    triggerForceUpdate = () => {
        this.forceUpdate();
    };

    onAddPanel = () => {
        const { dashboard } = this.props;

        // Return if the "Add panel" exists already
        if (dashboard.panels.length > 0 && dashboard.panels[0].type === 'add-panel') {
            return;
        }

        dashboard.addPanel({
            type: 'add-panel',
            gridPos: { x: 0, y: 0, w: 12, h: 8 },
            title: 'Panel Title',
        });

        // scroll to top after adding panel
        this.setState({ updateScrollTop: 0 });
    };

    saveDashboard() {
        appEvents.emit('open-dashboard-save-modal', this.props.dashboard)
    }

    getPanelByIdFromUrlParam(rawPanelId: string): PanelModel {
        const { dashboard } = this.props;

        const panelId = parseInt(rawPanelId!, 10);
        dashboard!.expandParentRowFor(panelId);
        const panel = dashboard!.getPanelById(panelId);

        if (!panel) {
            return
        }

        return panel
    }

    timeRangeUpdated = (_: TimeRange) => {
        this.props.dashboard?.startRefresh()
    }

    setScrollTop = (e: React.MouseEvent<HTMLElement>): void => {
        const target = e.target as HTMLElement;
        this.setState({ scrollTop: target.scrollTop, updateScrollTop: null });
    };

    render() {
        const { dashboard, settingTab } = this.props
        const { updateScrollTop, scrollTop, editPanel } = this.state
        if (!dashboard) {
            return null
        }
        const approximateScrollTop = Math.round(scrollTop / 25) * 25;
        const gridWrapperClasses = classNames({
            'dashboard-container': true,
            'dashboard-container--has-submenu': dashboard.meta.submenuEnabled,
          });
          
        return (
            <div>
                <div className="scroll-canvas scroll-canvas--dashboard">
                    <CustomScrollbar
                        autoHeightMin="100%"
                        setScrollTop={this.setScrollTop}
                        scrollTop={updateScrollTop}
                        updateAfterMountMs={500}
                        className="custom-scrollbar--page"
                    >
                        <div className={gridWrapperClasses}>
                            {!editPanel && config.featureToggles.newVariables && <SubMenu dashboard={dashboard} />}
                            <DashboardGrid
                                dashboard={dashboard}
                                viewPanel={null}
                                scrollTop={approximateScrollTop}
                            />
                        </div>
                    </CustomScrollbar>
                </div>

                {editPanel && <PanelEditor dashboard={dashboard} sourcePanel={editPanel} />}
                {settingTab && <DashboardSettings dashboard={dashboard} viewId={this.props.settingTab}/>}
            </div>
        )
    }
}


export const mapStateToProps = (state: StoreState) => {
    return {
        initPhase: state.dashboard.initPhase,
        isInitSlow: state.dashboard.isInitSlow,
        editPanelId: state.location.query.editPanel,
        viewPanelId: state.location.query.viewPanel,
        settingTab: state.location.query.settingTab,
        dashboard: state.dashboard.dashboard,
        isPanelEditorOpen: state.panelEditor.isOpen,
    }
}

const mapDispatchToProps = {
    initDashboard,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DashboardPage))



// remove stuff that should not count in diff
function cleanDashboardFromIgnoredChanges(dashData: any) {
    // need to new up the domain model class to get access to expand / collapse row logic
    const model = new DashboardModel(dashData);

    // Expand all rows before making comparison. This is required because row expand / collapse
    // change order of panel array and panel positions.
    model.expandRows();

    const dash = model.getSaveModelClone();

    dash.schemaVersion = 0;

    // ignore iteration property
    delete dash.iteration;

    dash.panels = _.filter(dash.panels, panel => {
        if (panel.repeatPanelId) {
            return false;
        }


        // ignore panel legend sort
        if (panel.options.legend) {
            delete panel.options.legend.sort;
            delete panel.options.legend.sortDesc;
        }

        return true;
    });

    // ignore template variable values
    _.each(dash.getVariables(), variable => {
        variable.current = null;
        variable.options = null;
        variable.filters = null;
    });

    return dash;
}