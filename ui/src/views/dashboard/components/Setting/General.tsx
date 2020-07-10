import React, { useState } from 'react'
import { DashboardModel } from '../../model';
import { Tooltip} from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { DynamicTagList } from 'src/packages/datav-core/src';

interface Props {
    dashboard: DashboardModel
}

const GeneralSetting = (props: Props) => {
    return (
        <>
            <h3 className="dashboard-settings__header">
                General
            </h3>

            <div className="gf-form-group">
                <div className="gf-form">
                    <label className="gf-form-label width-7">Name</label>
                    <input type="text" className="gf-form-input width-30" defaultValue={props.dashboard.title} onChange={(e) => {props.dashboard.title = e.currentTarget.value}}/>
                </div>
                <div className="gf-form">
                    <label className="gf-form-label width-7">Description</label>
                    <input type="text" className="gf-form-input width-30" defaultValue={props.dashboard.description} onChange={(e) => {props.dashboard.description = e.currentTarget.value}}/>
                </div>
                <div className="gf-form">
                    <label className="gf-form-label width-7">Tags<Tooltip title="Press enter to add a tag"><InfoCircleOutlined /></Tooltip></label>
                    <DynamicTagList color="#9933cc" tags={props.dashboard.tags} onConfirm={(tags) => {props.dashboard.tags = tags}} />
                </div>
            </div>
        </>
    )
}

export default GeneralSetting;