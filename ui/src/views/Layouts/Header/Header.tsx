import React, {useState} from 'react'

import { connect } from 'react-redux';
import { Prompt} from "react-router-dom";

import { Layout } from 'antd'

import BreadcrumbWrapper from '../Breadcrumb/Breadcrumb'

import {StoreState} from 'src/types'  
import {TimePickerWrapper} from 'src/views/components/TimePicker/TimePickerWrapper'
import SaveDashboard from 'src/views/dashboard/components/SaveDashboard/SaveDashboard';
import appEvents from 'src/core/library/utils/app_events';
import tracker from 'src/core/services/changeTracker';

import './Header.less'

interface Props {
    breadcrumbText: string
}

const { Header } = Layout

function HeaderWrapper(props: Props) { 
   const [dashboard,setDashboard] = useState(null)
   const [dashboardComponent, setDashboardComponent] = useState(null)
   appEvents.on('open-dashboard-save-modal', (dash) => {
       setDashboard(dash)
   })

   appEvents.on('set-dashboard-page-header',(component) => {
       if (!dashboardComponent) {
        setDashboardComponent(component)
       }
   })

    return (
        <Header className="datav-header">
            <div className='datav-header-inner'>
                <div>
                    <BreadcrumbWrapper text={props.breadcrumbText}/>
                </div>
                <div>
                    <div className="ub-mr1">{dashboardComponent}</div>
                    <TimePickerWrapper />
                </div>
            </div>

            { dashboard  && <SaveDashboard dashboard={dashboard}  setDashboard={setDashboard}/>}

            <Prompt message={
                        location =>
                            tracker.canLeave()
                            ? true
                            : 'Changes not saved, do you want to leave?'
                    }
                />
        </Header>
    )
}

export const mapStateToProps = (state: StoreState) => ({
    breadcrumbText: state.application.breadcrumbText,
});

export default connect(mapStateToProps)(HeaderWrapper);