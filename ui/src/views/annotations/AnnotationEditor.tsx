import React,{useState } from 'react'
import _ from 'lodash'

import { dateTime } from 'src/packages/datav-core'
import { AnnotationEvent } from 'src/packages/datav-core'
import { DashboardModel } from 'src/views/dashboard/model/DashboardModel'
import { annotationsSrv } from 'src/core/services/annotations'

interface Props {
    rawEvent: AnnotationEvent
    close: any
    onSaved : any
    onDel: any
}


const AnnotationEditor = (props: Props) => {
    const [text, setText] = useState(props.rawEvent.text)

    let event: AnnotationEvent = {};
    
    event.panelId = props.rawEvent.panelId
    event.dashboardId = props.rawEvent.dashboardId
    event.time = tryEpochToMoment(props.rawEvent.time)
    if (event.isRegion) {
        event.timeEnd = tryEpochToMoment(event.timeEnd);
    }

    const saveAnnotation = () => {
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
            annotationsSrv
                .updateAnnotationEvent(saveModel)
                .then(() => {
                    props.close();
                })
                .catch(() => {
                    props.close();
                });
        } else {
            annotationsSrv
                .saveAnnotationEvent(saveModel)
                .then(() => {
                    props.close();
                })
                .catch(() => {
                    props.close();
                });
        }

        props.onSaved(saveModel)
    }

    const deleteAnnotation = () => {
        props.onDel(props.rawEvent)
        return annotationsSrv
            .deleteAnnotationEvent(props.rawEvent)
            .then(() => {
                props.close();
            })
            .catch(() => {
                props.close();
            });
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
                        <textarea className="gf-form-input width-20" value={text} onChange={handelChange} rows={3} ></textarea>
                    </div>



                    <div className="gf-form-button-row">
                        <button className="btn btn-primary" onClick={saveAnnotation}>Save</button>
                        {props.rawEvent.id  !== undefined  && <button className="btn btn-danger" onClick={deleteAnnotation}>Delete</button>}
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