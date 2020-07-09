import React, {  useState } from 'react'
import { Layout} from 'antd'
import classNames from 'classnames'

import {routers} from 'src/routes'
import {SideMenu} from './SideMenu/SideMenu'
import HeaderWrapper from './Header/Header'
import ContentWrapper from './Content/Content'
import { currentTheme, ThemeType} from 'src/packages/datav-core/src'
import appEvents from 'src/core/library/utils/app_events'
import OnRoute from './OnRoute'
import ModalService from 'src/core/services/modal'

import './Layouts.less'

const Layouts = () => {
  const [headerShow,setHeaderShow] = useState(true)
 

  appEvents.on('hide-layouts-header',() => {
    setHeaderShow(false)
  })

  appEvents.on('show-layouts-header',() => {
    setHeaderShow(true)
  })

  const appClasses = classNames({
    'datav-layouts' : true,
    'datav-layouts-dark': currentTheme === ThemeType.Dark
  })

  return (
    <Layout className={appClasses}>
      <SideMenu  />
      <Layout className="datav-layout" style={{position:"absolute",width:'calc(100% - 60px)',height:'100%',overflow:'auto'}}>
        {headerShow && <HeaderWrapper />}
        <ContentWrapper routers={routers} />
      </Layout>

      <ModalService />
      <OnRoute />
    </Layout>
  )
}

export default Layouts