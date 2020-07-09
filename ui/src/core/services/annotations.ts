// Libaries
import _ from 'lodash'
import flattenDeep from 'lodash/flattenDeep';
import cloneDeep from 'lodash/cloneDeep';

// Utils & Services
// Types
import {DashboardModel} from 'src/views/dashboard/model/DashboardModel'
import { PanelModel } from 'src/views/dashboard/model/PanelModel';

import { AnnotationEvent, AppEvents, DataSourceApi, PanelEvents, TimeRange ,getBackendSrv, getDataSourceService } from 'src/packages/datav-core';

import appEvents from '../library/utils/app_events';
import { getTimeSrv } from './time';


export class AnnotationsSrv {
    globalAnnotationsPromise: any;
    alertStatesPromise: any;
    datasourcePromises: any;

    init(dashboard: DashboardModel) {
        // always clearPromiseCaches when loading new dashboard
        this.clearPromiseCaches();
        // clear promises on refresh events
        dashboard.on(PanelEvents.refresh, this.clearPromiseCaches.bind(this));
    }

    clearPromiseCaches() {
        this.globalAnnotationsPromise = null;
        this.alertStatesPromise = null;
        this.datasourcePromises = null;
    }

    getAnnotations(options: { dashboard: DashboardModel; panel: PanelModel; range: TimeRange }) {
        return Promise.all([this.getGlobalAnnotations(options), this.getAlertStates(options)])
            .then(results => {
                // combine the annotations and flatten results
                let annotations: AnnotationEvent[] = flattenDeep(results[0]);
                // when in edit mode we need to use this function to get the saved id
                let panelFilterId = options.panel.getSavedId();

                // filter out annotations that do not belong to requesting panel
                annotations = annotations.filter(item => {
                    // if event has panel id and query is of type dashboard then panel and requesting panel id must match
                    if (item.panelId && item.source.type === 'dashboard') {
                        return item.panelId === panelFilterId;
                    }
                    return true;
                });

                annotations = this.dedupAnnotations(annotations);

                // look for alert state for this panel
                const alertState: any = results[1].find((res: any) => res.panelId === panelFilterId);

                return {
                    annotations: annotations,
                    alertState: alertState,
                };
            })
            .catch(err => {
                if (!err.message && err.data && err.data.message) {
                    err.message = err.data.message;
                }
                console.log('AnnotationSrv.query error', err);
                appEvents.emit(AppEvents.alertError, ['Annotation Query Failed', err.message || err]);
                return [];
            });
    }

    getAlertStates(options: any) {
        if (!options.dashboard.id) {
            return Promise.resolve([]);
        }

        // ignore if no alerts
        if (options.panel && !options.panel.alert) {
            return Promise.resolve([]);
        }

        if (options.range.raw.to !== 'now') {
            return Promise.resolve([]);
        }

        if (this.alertStatesPromise) {
            return this.alertStatesPromise;
        }

        this.alertStatesPromise = getBackendSrv().get(
            '/api/alerts/states-for-dashboard',
            {
                dashboardId: options.dashboard.id,
            },
            `get-alert-states-${options.dashboard.id}`
        );

        return this.alertStatesPromise;
    }

    getGlobalAnnotations(options: { dashboard: DashboardModel; panel: PanelModel; range: TimeRange }) {
        const dashboard = options.dashboard;

        if (this.globalAnnotationsPromise) {
            return this.globalAnnotationsPromise;
        }

        const range = getTimeSrv().timeRange();
        const promises = [];
        const dsPromises = [];

        for (const annotation of dashboard.annotations.list) {
            if (!annotation.enable) {
                continue;
            }

            if (annotation.snapshotData) {
                return this.translateQueryResult(annotation, annotation.snapshotData);
            }
            const datasourcePromise = getDataSourceService().get(annotation.datasource);
            dsPromises.push(datasourcePromise);
            promises.push(
                datasourcePromise
                    .then((datasource: DataSourceApi) => {
                        // issue query against data source
                        return datasource.annotationQuery({
                            range,
                            rangeRaw: range.raw,
                            annotation: annotation,
                            dashboard: dashboard,
                        });
                    })
                    .then(results => {
                        // store response in annotation object if this is a snapshot call
                        // if (dashboard.snapshot) {
                        //     annotation.snapshotData = cloneDeep(results);
                        // }
                        // translate result
                        return this.translateQueryResult(annotation, results);
                    })
            );
        }
        this.datasourcePromises = Promise.all(dsPromises);
        this.globalAnnotationsPromise = Promise.all(promises);
        return this.globalAnnotationsPromise;
    }

    saveAnnotationEvent(annotation: AnnotationEvent) {
        this.globalAnnotationsPromise = null;
        return getBackendSrv().post('/api/annotations', annotation);
    }

    updateAnnotationEvent(annotation: AnnotationEvent) {
        this.globalAnnotationsPromise = null;
        return getBackendSrv().put(`/api/annotations/${annotation.id}`, annotation);
    }

    deleteAnnotationEvent(annotation: AnnotationEvent) {
        this.globalAnnotationsPromise = null;
        const deleteUrl = `/api/annotations/${annotation.id}`;

        return getBackendSrv().delete(deleteUrl);
    }

    translateQueryResult(annotation: any, results: any) {
        // if annotation has snapshotData
        // make clone and remove it
        if (annotation.snapshotData) {
            annotation = cloneDeep(annotation);
            delete annotation.snapshotData;
        }

        for (const item of results) {
            item.source = annotation;
            item.isRegion = item.timeEnd && item.time !== item.timeEnd;
        }

        return results;
    }


    dedupAnnotations(annotations: any) {
        let dedup = [];

        // Split events by annotationId property existence
        const events = _.partition(annotations, 'id');

        const eventsById = _.groupBy(events[0], 'id');
        dedup = _.map(eventsById, eventGroup => {
            if (eventGroup.length > 1 && !_.every(eventGroup, this.isPanelAlert)) {
                // Get first non-panel alert
                return _.find(eventGroup, event => {
                    return event.eventType !== 'panel-alert';
                });
            } else {
                return _.head(eventGroup);
            }
        });

        dedup = _.concat(dedup, events[1]);
        return dedup;
    }

    isPanelAlert(event: { eventType: string }) {
        return event.eventType === 'panel-alert';
    }

}

export const annotationsSrv = new AnnotationsSrv()