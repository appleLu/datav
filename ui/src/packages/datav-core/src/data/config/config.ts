import { DatavConfig, DataSourceInstanceSettings, ThemeType,DataSourcePluginMeta} from '../types'
import { History as RouterHistory } from 'history';
import _ from 'lodash'

// boot configs ,loaded from backend 
export interface BootConfig {
    datasourceMetas: {string:DataSourcePluginMeta}
    datasources: {string:DataSourceInstanceSettings}
    panels:{string: any}
    sidemenu: any[]
}
let bootConfig:BootConfig = null
export const setBootConfig = (config:BootConfig) => {
    bootConfig = config
}
export const getBootConfig = () => {
    return bootConfig
}
export const getDefaultDatasourceName = () => {
    let name = null
    _.forEach(bootConfig.datasources, (ds,n) => {
        if (ds.isDefault) {
            name = n
        }
    })
    
    return name
}

// colors for dynamic theme, used in inline css styles
// @todo : need to be loaded from backend
export const colorConfig = {
    light: {
        test1: 'green'
    },
    dark: {
        test1: 'red'
    }
}
export const getColorFromConfig = (theme: ThemeType, name:string) => {
    return colorConfig[theme][name]
}


// global react router used to goto a url
// sometimes we cant get withRouter props
let history:RouterHistory;
export const setHistory = (h) => {
    history = h
}
export const getHistory = () => {
    return history
}

export let currentTheme : ThemeType = ThemeType.Light

export const setCurrentTheme = (tt: ThemeType) => {
    currentTheme = tt
}




//@legacy
// config examples, remove in future
export const config = {
    baseUrl: 'http://localhost:9085/',
    appSubUrl: '/',
    minRefreshInterval: '5s',
    exploreEnabled: true,
    viewersCanEdit: false,
    defaultDatasource: 'Prometheus',
    disableSanitizeHtml: false,
    alertingEnabled: true,
    rootFolderName: 'General',
    panel: { newTitle: 'Panel Title' },
    dashboard: { newTitle: 'New Dashboard Copy' },
    defaultAdminName: 'admin',
    
    application: {
        startDate: () => 'now-3h',
        endDate: () => 'now',
        theme: ThemeType.Light,
        locale: 'en_US'
    },
    user: {
        lightTheme: true
    },
    timePicker: {
        time : {from: "now-1h", to: "now"},
        refresh: '',
        timezone: 'browser'
    },
    featureToggles:  {
        transformations: false,
        expressions: false,
        newEdit: false,
        meta: false,
        newVariables: true,
    },
    buildInfo: {
        buildstamp: 1592571942,
        commit: "unknown-dev",
        edition: "Open Source",
        env: "development",
        hasUpdate: false,
        isEnterprise: false,
        latestVersion: "0.1.0",
        version: "0.1.0",
    },
    licenseInfo: {
        expiry: 0,
        hasLicense: false,
        licenseUrl: "/admin/upgrading",
        stateInfo: "",
    },
    datasources: {
        "Prometheus": {
            "id": 1,
            "jsonData": {
                "directUrl": "http://10.77.64.59:9090",
                "disableMetricsLookup": false,
                "httpHeaderName1": "testHeader",
                "httpHeaderName2": "",
                "httpMethod": "GET",
                "keepCookies": [
                    "testCookie"
                ],
                "queryTimeout": "60s",
                "timeInterval": "15s"
            },
            "meta": {
                "type": "datasource",
                "name": "Prometheus",
                "id": "prometheus",
                "info": {
                    "author": {
                        "name": "Datav Labs",
                        "url": "https://grafana.com"
                    },
                    "description": "Open source time series database & alerting",
                    "links": [
                        {
                            "name": "Learn more",
                            "url": "https://prometheus.io/"
                        }
                    ],
                    "logos": {
                        "small": "src/plugins/datasource/prometheus/img/prometheus_logo.svg",
                        "large": "src/plugins/datasource/prometheus/img/prometheus_logo.svg"
                    },
                    "build": {
                    },
                    "screenshots": null,
                    "version": "",
                    "updated": ""
                },
                "dependencies": {
                    "grafanaVersion": "*",
                    "plugins": [
                    ]
                },
                "includes": [
                    {
                        "name": "Prometheus Stats",
                        "path": "dashboards/prometheus_stats.json",
                        "type": "dashboard",
                        "component": "",
                        "role": "Viewer",
                        "addToNav": false
                    },
                    {
                        "name": "Prometheus 2.0 Stats",
                        "path": "dashboards/prometheus_2_stats.json",
                        "type": "dashboard",
                        "component": "",
                        "role": "Viewer",
                        "addToNav": false
                    },
                    {
                        "name": "Grafana Stats",
                        "path": "dashboards/grafana_stats.json",
                        "type": "dashboard",
                        "component": "",
                        "role": "Viewer",
                        "addToNav": false
                    }
                ],
                "module": "src/plugins/datasource/prometheus/module",
                "baseUrl": "src/plugins/datasource/prometheus",
                "category": "tsdb",
                "preload": false,
                "signature": "internal",
                "annotations": true,
                "metrics": true,
                "alerting": true,
                "explore": false,
                "tables": false,
                "logs": false,
                "tracing": false,
                "queryOptions": {
                    "minInterval": true
                },
                "routes": null,
                "streaming": false
            },
            "name": "Prometheus",
            "type": "prometheus",
            "uid": "1q-s0hiGk",
            "url": "/api/proxy"
        } as DataSourceInstanceSettings
    } 
}