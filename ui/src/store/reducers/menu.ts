import React from 'react'
import { createAction } from '@reduxjs/toolkit';
import {MenuItem,MenuPosition} from 'src/types'


const Test = React.lazy(() => import('src/views/Test'))
const TraceSearch = React.lazy(() => import('src/views/TraceSearch'))

export interface MenuState {
    items: MenuItem[]
}



export const updateMenuItems = createAction<MenuItem[]>('routes/updateMenuItems');


export const menuReducer = (state = initialState, action: any) => {
  if (updateMenuItems.match(action)) {
    return {...state, menu: action.payload}
  }

  return state;
};



export default {
  menu: menuReducer,
};



export const initialState: MenuState = {
    items: [
        {
            id: 'dashboard',
            url: '/dashboard',
            text: 'Home Dashboard',
            icon: 'home-alt',
            title: 'DataV Home Page',
            showPosition: MenuPosition.Top,
            sortWeight: 0,
            component: React.lazy(() => import('src/views/dashboard/DashboardPage'))
        },
        {
            id: 'd',
            url: '/d/:uid',
            text: 'Dashboard Page',
            icon: 'home-alt',
            title: 'Dashboard Page',
            showPosition: null,
            sortWeight: 0,
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
            sortWeight: 0,
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
            sortWeight: 0,
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
            sortWeight: 0,
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
            sortWeight: -100
        },

        // these two are core menu items, be careful to modify
        {
            id: 'new',
            url: null,
            text: 'New',
            title: 'Add something new',
            icon: 'plus',
            showPosition: MenuPosition.Bottom,
            redirectTo: null,
            children: [
                {
                    icon: 'database',
                    id: 'create-dashboard',
                    url: '/new/dashboard',
                    text: 'Dashboard',
                    component: React.lazy(() => import('src/views/dashboard/DashboardPage'))
                },
                {
                    icon: 'database',
                    id: 'import-dashboard',
                    url: '/import/dashboard',
                    text: 'Import',
                    component: React.lazy(() => import('src/views/dashboard/ImportPage'))
                },
                {
                    icon: 'database',
                    id: 'new-folder',
                    text: 'Folder',
                    url: '/cfg/folders',
                    component: React.lazy(() => import('src/views/search/components/DashboardListPage'))
                },
            ],
            sortWeight: -100
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
                    icon: "folder",
                    id: "folders",
                    text: "Folders",
                    url: "/folders",
                    component: React.lazy(() => import('src/views/search/components/DashboardListPage'))
                },
                {
                    icon: "users-alt",
                    id: "users",
                    text: "Users",
                    url: "/users",
                    component: React.lazy(() => import('src/views/cfg/users/UserPage'))
                },
                {
                    icon: "users-alt",
                    id: "teams",
                    text: "Teams",
                    url: "/teams",
                    component: React.lazy(() => import('src/views/cfg/teams/TeamsPage'))
                },
            ]
        },
        {
            id: 'team-manage',
            url: null,
            text: 'Team',
            icon: 'users-alt',
            title: 'Manage team members & settings',
            showPosition: null,
            redirectTo: null,
            children: [
                {
                    icon: "users-alt",
                    id: "team-members",
                    text: "Members",
                    url: "/team/members/:id",
                    component: React.lazy(() => import('src/views/cfg/teams/team/MemberPage'))
                },
                {
                    icon: "cog",
                    id: "team-setting",
                    text: "Setting",
                    url: "/team/setting/:id",
                    component: React.lazy(() => import('src/views/cfg/teams/team/SettingPage'))
                },
            ]
        },
        {
            id: 'manage-folder',
            url: null,
            text: 'Folder',
            icon: 'folder-open',
            title: 'Manage folder dashboards & permissions',
            showPosition: null,
            redirectTo: null,
            children: [
                {
                    icon: "th-large",
                    id: "folder-dashboard",
                    text: "Dashboards",
                    url: "/f/:uid/dashboards",
                    component: React.lazy(() => import('src/views/search/components/DashboardListPage'))
                },
                {
                    icon: "cog",
                    id: "folder-settings",
                    text: "Settings",
                    url: "/f/:uid/settings",
                    component: React.lazy(() => import('src/views/search/components/DashboardListPage'))
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
}