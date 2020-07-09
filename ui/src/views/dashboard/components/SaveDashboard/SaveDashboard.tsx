import React from 'react'
import { Modal, Form, Input, Button, message } from 'antd'
import { DashboardModel, PanelModel } from 'src/views/dashboard/model'
import { getBackendSrv } from 'src/core/services/backend';

import { locationUtil } from 'src/packages/datav-core/src';
import { useHistory } from 'react-router-dom';
import appEvents from 'src/core/library/utils/app_events';
import { CoreEvents } from 'src/types';
import globalEvents from 'src/views/App/globalEvents';

interface Props {
    setDashboard: any
    dashboard: any
}


const SaveDashboard = (props: Props) => {
    const dashboard = props.dashboard
    const history = useHistory()
    const isNew = dashboard.id === null

    const saveDashboard = async (val) => {
        const clone = getSaveAsDashboardClone(dashboard);
        clone.title = val.title
        const res = await  getBackendSrv().saveDashboard(clone)

        appEvents.emit(CoreEvents.dashboardSaved, dashboard);

       
        globalEvents.showMessage(() => message.success('Dashboard Saved'))

        const newUrl = locationUtil.stripBaseFromUrl(res.data.url);
        history.push(newUrl)
        props.setDashboard(null)
    }

    const defaultValues = {
        title: `${dashboard.title} Copy`,
    };

    const initialValues = !isNew ? {
        title: dashboard.title
    } : defaultValues
    
    return (
        <>
            <Modal
                title="Save Dashboard"
                visible={true}
                footer={null}
                onCancel={() => props.setDashboard(null)}
            >
                <Form
                    name="basic"
                    initialValues={initialValues}
                    onFinish={saveDashboard}
                >
                    <Form.Item
                        label="Dashboard Title"
                        name="title"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                        <Button htmlType="button" onClick={() => props.setDashboard(null)}>
                            Cancel
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}


export default SaveDashboard;


const getSaveAsDashboardClone = (dashboard: DashboardModel) => {
    const clone: any = dashboard.getSaveModelClone();
    if (clone.id == null) {
        clone.uid = '';
        clone.editable = true;
        clone.hideControls = false;
        // remove alerts if source dashboard is already persisted
        // do not want to create alert dupes
        if (dashboard.id > 0) {
            clone.panels.forEach((panel: PanelModel) => {
                if (panel.type === 'graph' && panel.alert) {
                    delete panel.thresholds;
                }
                delete panel.alert;
            });
        }
        delete clone.autoUpdate;
    }

    return clone;
};