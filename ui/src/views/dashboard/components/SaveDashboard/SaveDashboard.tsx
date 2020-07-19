import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, message,Select,notification} from 'antd'
import {  DashboardModel,PanelModel } from 'src/views/dashboard/model'
import { getBackendSrv } from 'src/core/services/backend';

import { locationUtil } from 'src/packages/datav-core/src';
import { useHistory } from 'react-router-dom';
import appEvents from 'src/core/library/utils/app_events';
import { CoreEvents, FolderDTO } from 'src/types';
import globalEvents from 'src/views/App/globalEvents';

const {Option} = Select

interface Props {
    setDashboard: any
    dashboard: DashboardModel
}


const SaveDashboard = (props: Props) => {
    const [folders,setFolders] = useState([])

    
    const dashboard = props.dashboard
    const history = useHistory()
    const isNew = dashboard.id === null


    const getFolders= async () => {
        const res = await getBackendSrv().get('/api/folder/all')
        const folders:FolderDTO[]  = res.data
        setFolders(folders)
    }

    useEffect(() => {
        getFolders()
    },[])


    const saveDashboard = async (val) => {
        if (!dashboard.meta.canSave) {
            notification['error']({
                message: "Error",
                description: `You dont have permission to save`,
                duration: 5
              });
              return 
           }

        dashboard.title = val.title 
        dashboard.meta.folderId = val.folderId
        const clone = getSaveAsDashboardClone(dashboard);

        
        const res = await  getBackendSrv().saveDashboard(clone,{folderId:val.folderId})

        appEvents.emit(CoreEvents.dashboardSaved, dashboard);

       
        globalEvents.showMessage(() => message.success('Dashboard Saved'))

        const newUrl = locationUtil.stripBaseFromUrl(res.data.url);
        history.push(newUrl)
        props.setDashboard(null)
    }

    const defaultValues = {
        title: `${dashboard.title} Copy`,
        folderId: 0
    };
    const initialValues = !isNew ? {
        title: dashboard.title,
        folderId: dashboard.meta.folderId
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
                        label="Title"
                        name="title"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Folder"
                        name="folderId"
                    >
                        <Select>
                            {
                                folders.map((f:FolderDTO) => {
                                return  <Option value={f.id} key={f.id}>{f.title}</Option>
                                })
                            }
                        </Select>
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