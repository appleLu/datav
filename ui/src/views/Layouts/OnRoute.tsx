import React,{ReactNode,useEffect} from 'react'
import { useHistory } from 'react-router-dom'
import {store} from 'src/store/store'
import { updateLocation } from 'src/store/reducers/location'
import { getUrlParams } from 'src/core/library/utils/url'
import { getToken } from 'src/core/library/utils/auth'
import { isEmpty } from 'src/core/library/utils/validate'
import { setHistory} from 'src/packages/datav-core'
import { getTimeSrv } from 'src/core/services/time'
import appEvents from 'src/core/library/utils/app_events'
import { CoreEvents } from 'src/types'


const OnRoute = () =>{
    const history = useHistory()

    // set global history
    setHistory(history)
    
    // redirect root path to home url
    if (history.location.pathname === '/') {
      history.push('/dashboard')
    }
  
    useEffect(() => {
      // is login in
      if (isEmpty(getToken()) || !store.getState().user.id) {
        history.push('/login')
      }
      
      // when browser page goes back, we need adjust time range
      if (history.action === 'POP') {
        setTimeout(() => {
          getTimeSrv().init()
          getTimeSrv().setTime(getTimeSrv().time,false)
          appEvents.emit(CoreEvents.timeRangeUpdated)
        },100)
      }
  
      store.dispatch(
        updateLocation({
          path: history.location.pathname,
          query: getUrlParams(),
          keepUrl: true
        })
      )
  
      return () => { }
    })

    return (
        <></>
    )
}

export default OnRoute