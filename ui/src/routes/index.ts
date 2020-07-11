/*eslint-disable*/

import React from 'react'
import _ from 'lodash'



const Test = React.lazy(() => import('src/views/Test'))
const TraceSearch = React.lazy(() => import('src/views/TraceSearch'))


export interface MenuItem {
    id?: string;
    parentID?: string;
    text: string;
    url?: string; // when url set to null, children will have their own direct url to accsess
    title?: string;
    icon?: string;
    img?: string;
    showPosition?: MenuPosition;
    redirectTo?:string; //can be 3 types,  1. undefined: access MenuItem's url 2. null: MenuItem can't be clicked 3. a real url string, click MenuItem ,will access this url
    children?: MenuItem[];
    breadcrumbs?: any[];
    sortWeight?: number;
    component?: any;
    active?:boolean;
    hideFromTabs?: boolean;    
}

export enum MenuPosition {
    Top = 'top',
    Bottom = 'bottom',
}

export const menuItems: MenuItem[] = [
    {
        id: 'dashboard',
        url: '/dashboard',
        text: 'Home Dashboard',
        icon: 'home-alt',
        title: 'DataV Home Page',
        showPosition: MenuPosition.Top,
        sortWeight:0,
        component: React.lazy(() => import('src/views/dashboard/DashboardPage'))
    },
    {
        id: 'd',
        url: '/d/:uid',
        text: 'Dashboard Page',
        icon: 'home-alt',
        title: 'Dashboard Page',
        showPosition: null,
        sortWeight:0,
        component: React.lazy(() => import('src/views/dashboard/DashboardPage'))
    },
    
    {
        id: 'plugin',
        url: '/plugin/:pluginID',
        text: 'Plugin Info',
        icon: 'home-alt',
        component: React.lazy(() => import('src/views/cfg/plugins/PluginPage')),
        title: 'Plugin Info',
        showPosition: null,
        sortWeight:0,
        parentID: null
    },
    {
        id: 'newDataSource',
        url: '/datasources/new',
        text: 'New Datasource',
        icon: 'home-alt',
        component: React.lazy(() => import('src/views/cfg/datasources/NewDataSourcePage')),
        title: 'New Datasource',
        showPosition: null,
        sortWeight:0,
        parentID: null
    },
    {
        id: 'editDataSource',
        url: '/datasources/edit/:datasourceID',
        text: 'Edit DataSource',
        icon: 'home-alt',
        component: React.lazy(() => import('src/views/cfg/datasources/EditDataSourcePage')),
        title: 'Edit DataSource',
        showPosition: null,
        sortWeight:0,
        parentID: null
    },
    {
        id: 'trace',
        url: '/trace',
        text: 'trace',
        title: 'Distributed trcacing',
        icon: 'compass',
        showPosition: MenuPosition.Top,
        redirectTo: '/trace/1',
        children: [
            {
                id: '1',
                url: '/1',
                text: 'Trace Search',
                component: TraceSearch
            },
            {
                id: '2',
                url: '/2',
                text: 'Trace Search',
                component: TraceSearch
            }
        ],
        sortWeight:-100
    },

    // these two are core menu items, be careful to modify
    {
        id: 'new',
        url: '/new',
        text: 'New',
        title: 'Add something new',
        icon: 'plus',
        showPosition: MenuPosition.Bottom,
        redirectTo: '/new/dashboard',
        children: [
            {
                icon: 'database',
                id: 'create-dashboard',
                url: '/dashboard',
                text: 'New Dashboard',
                component: React.lazy(() => import('src/views/dashboard/DashboardPage'))
            },
            {
                icon: 'database',
                id: 'import',
                url: '/import',
                text: 'Import Dashboard',
                component: React.lazy(() => import('src/views/dashboard/ImportPage'))
            },
        ],
        sortWeight:-100
    },
    {
        id: 'cfg',
        url: '/cfg',
        text: 'Configuration',
        icon: 'cog',
        title: 'Settings for datav',
        showPosition: MenuPosition.Bottom,
        redirectTo: null,
        children: [
            {
                icon: "database",
                id: "datasources",
                text: "Data Sources",
                url: "/datasources",
                component: React.lazy(() => import('src/views/cfg/datasources/DataSourceListPage'))
            },
            {
                icon: "plug",
                id: "plugins",
                text: "Plugins",
                url: "/plugins",
                component: React.lazy(() => import('src/views/cfg/plugins/Plugins'))
            },
            {
                icon: "users-alt",
                id: "users",
                text: "Users",
                url: "/users",
                component: Test
            },
            {
                icon: "users-alt",
                id: "teams",
                text: "Teams",
                url: "/teams",
                component: Test
            },
        ]
    },
    {
        id: 'user',
        url: '/user',
        text: 'User Profile',
        icon: 'user',
        showPosition: MenuPosition.Bottom,
        redirectTo: '/user/preferences',
        children: [
            {
                icon: "sliders-v-alt",
                id: "preferences",
                text: "Preferences",
                url: "/preferences",
                component: Test
            }
        ]
    },
    {
        id: 'help',
        url: '/help',
        text: 'Help',
        icon: 'question-circle',
        redirectTo: null,
        showPosition: MenuPosition.Bottom,
    }
]

const items = []
menuItems.map((route:any) => {
    if(!_.isEmpty(route.children)){
        route.children.map(r => {
            r.url = route.url != null ?  route.url + r.url : r.url
            r.parentID = route.id
            // concat route.path and its child's path
            items.push(r)
        })
    }else{
        items.push(route)
    }
})


export const routers= items