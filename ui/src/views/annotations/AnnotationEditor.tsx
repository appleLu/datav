import React,{useState } from 'react'
import _ from 'lodash'

import { dateTime } from 'src/packages/datav-core'
import { AnnotationEvent } from 'src/packages/datav-core'
import { DashboardModel } from 'src/views/dashboard/model/DashboardModel'
import { annotationsSrv } from 'src/core/services/annotations'
import { Button,notification } from 'antd'

interface Props {
    rawEvent: AnnotationEvent
    close: any
    onChange: any
} 


const AnnotationEditor = (props: Props) => {
    const [text, setText] = useState(props.rawEvent.text)

    let event: AnnotationEvent = {};
    
    event.id = props.rawEvent.id
    event.panelId = props.rawEvent.panelId
    event.dashboardId = props.rawEvent.dashboardId
    event.time = tryEpochToMoment(props.rawEvent.time)
    event.isRegion = props.rawEvent.isRegion
    if (event.isRegion ) {
        event.timeEnd = tryEpochToMoment(props.rawEvent.timeEnd);
    }


    const saveAnnotation = async () => {
        event.text = text
        const saveModel = _.cloneDeep(event);
        saveModel.time = saveModel.time.valueOf();
        saveModel.timeEnd = 0;

        if (saveModel.isRegion) {
            saveModel.timeEnd = event.timeEnd.valueOf();

            if (saveModel.timeEnd < saveModel.time) {
                console.log('invalid time');
                return;
            }
        }

        if (saveModel.id) {
           await annotationsSrv.updateAnnotationEvent(saveModel)
           notification['success']({
            message: "Success",
            description: 'Annotation updated',
            duration: 5
          });
        } else {
           await annotationsSrv.saveAnnotationEvent(saveModel)
           notification['success']({
            message: "Success",
            description: 'Annotation created',
            duration: 5
          });
        }

        props.close()
        // update annotations and re-render this panel
        await annotationsSrv.getAnnotations()
        props.onChange()
    }

    const deleteAnnotation = async () => {
        await annotationsSrv.deleteAnnotationEvent(props.rawEvent)     
        // update annotations and re-render this panel
        await annotationsSrv.getAnnotations()
        notification['success']({
            message: "Success",
            description: 'Annotation deleted',
            duration: 5
          });

        props.close()
        props.onChange(props.rawEvent)
    }

    const handelChange = (e) => {
		setText(e.target.value)
    }
    
    const timeFormated = new DashboardModel({}).formatDate(props.rawEvent.time)
    return (
        <div className="graph-annotation">
            <div className="graph-annotation__header">
                <div className="graph-annotation__user">
                </div>

                <div className="graph-annotation__title">
                    {props.rawEvent.id === undefined ? <span>Add Annotation</span> : <span>Edit Annotation</span>}
                </div>

                <div className="graph-annotation__time">{timeFormated}</div>
            </div>

            <div className="graph-annotation__body text-center gf-form">
                <div style={{ display: "inline-block" }}>
                    <div className="gf-form gf-form--v-stretch">
                        <span className="gf-form-label width-7">Description</span>
                        <textarea className="gf-form-input width-17" value={text} onChange={handelChange} rows={3} ></textarea>
                    </div>



                    <div className="gf-form-button-row">
                        <Button type="primary" onClick={saveAnnotation} ghost size="middle">Save</Button>
                        {props.rawEvent.id  !== undefined  && <Button  onClick={deleteAnnotation} danger ghost>Delete</Button>}
                        {/* eslint-disable-next-line  */}
                        <a className="btn-text" onClick={props.close}>Cancel</a>
                    </div>
                </div>
            </div>
        </div>
    )
}


function tryEpochToMoment(timestamp: any) {
    if (timestamp && _.isNumber(timestamp)) {
        const epoch = Number(timestamp);
        return dateTime(epoch);
    } else {
        return timestamp;
    }
}

export default AnnotationEditor;