// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom';
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons'
import Login from '../Login/Login'


import './App.less';

import Layouts from 'src/views/Layouts/Layouts'


import Intl from './Intl'
import ConfigProvider from './ConfigProvider'

import darkVars from 'src/styles/dark.json';
import lightVars from 'src/styles/light.json';
import { StoreState } from 'src/types'

import { LocationUpdate, setDataSourceService, setBackendSrv, ThemeType, setCurrentTheme, setMarkdownOptions, getBackendSrv, setBootConfig, ThemeContext, getTheme, setLocationSrv } from 'src/packages/datav-core'
import { DatasourceSrv } from 'src/core/services/datasource'
import { backendSrv } from 'src/core/services/backend'

import { TimeSrv, setTimeSrv } from 'src/core/services/time';
import { KeybindingSrv, setKeybindingSrv } from 'src/core/services/keybinding'
import { store } from 'src/store/store'
import { updateLocation } from 'src/store/reducers/location';
import { setContextSrv } from 'src/core/services/context';
import { standardEditorsRegistry, getStandardOptionEditors } from 'src/packages/datav-core/src';
import globalEvents from './globalEvents'
import { getDefaultVariableAdapters, variableAdapters } from 'src/views/variables/adapters';
import { initRoutes} from 'src/routes';
interface Props {
  theme: string
}

const UIApp = (props: Props) => {
  const [bootConfigInited, setBootConfigInited] = useState(false)
  const { theme } = props
  setCurrentTheme(theme as ThemeType)

  useEffect(() => {
    let vars = theme === ThemeType.Light ? lightVars : darkVars;
    const newVars = { ...vars, "a": "b" }
    window.less.modifyVars(newVars)
  }, [theme])

  // only call in initial phase
  useEffect(() => {
    variableAdapters.setInit(getDefaultVariableAdapters);

    globalEvents.init()

    standardEditorsRegistry.setInit(getStandardOptionEditors);

    // init menu items
    initRoutes(store.getState())

    // init datasource service
    initDatasourceService()

    // init backend service
    initBackendService()

    // init time service
    initTimeService()

    // init keybinding service
    initKeybindingService()

    // set markdown options
    setMarkdownOptions({ sanitize: true })

    // load boot config
    initBootConfig()

    // init location service
    setLocationSrv({
      update: (opt: LocationUpdate) => {
        store.dispatch(updateLocation(opt));
      },
    });


    // init context service
    setContextSrv(store.getState().user.id, store.getState().user.role)

    // init location service
    setLocationSrv({
      update: (opt: LocationUpdate) => {
        store.dispatch(updateLocation(opt));
      },
    });

    async function initBootConfig() {
        const res = await getBackendSrv().get('/api/bootConfig');
        setBootConfig(res.data)
        setBootConfigInited(true)
    }

    function initDatasourceService() {
      const ds = new DatasourceSrv()
      setDataSourceService(ds);
    }


    function initBackendService() {
      setBackendSrv(backendSrv)
    }


    function initTimeService() {
      const ds = new TimeSrv()
      setTimeSrv(ds);
    }

    function initKeybindingService() {
      const kb = new KeybindingSrv()
      setKeybindingSrv(kb)
    }

  }, [])




  const customConfirm = (message, callback) => {
    Modal.confirm({
      title: message,
      icon: <ExclamationCircleOutlined />,
      onCancel: () => {
        callback(false);
      },
      onOk: () => {
        callback(true);
      }
    })
  }

  const render =
    bootConfigInited === true
      ?
      <ThemeContext.Provider value={getTheme(props.theme)}>
        <Intl >
          <ConfigProvider>
            <Router getUserConfirmation={customConfirm}>
              <Switch>
                <Route path="/login" exact component={Login} />
                <Route path="/" component={Layouts} />
              </Switch>
            </Router>
          </ConfigProvider>
        </Intl>
      </ThemeContext.Provider>
      :
      <></>
  return render
}

export const mapStateToProps = (state: StoreState) => ({
  theme: state.application.theme
});

export default connect(mapStateToProps)(UIApp);