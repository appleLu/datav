import React, { Suspense} from 'react'
import { Layout, BackTop } from 'antd'
import { Route,Redirect} from 'react-router-dom'

import './Content.less'
const { Content } = Layout

function ContentWrapper(porps:any){
    const { routers } = porps
    
    return(
        <>
            <Content className="datav-content">
                <Suspense fallback={<div>404</div>}>
                    {
                        routers.map((route, i) => {
                            return(
                                <Route key={i.toString()} path={route.url} render={(props) => <route.component routeID={route.id} parentRouteID={route.parentID}  {...props}/>} />
                            )
                        })
                    }
                    {/* <Redirect from="/*" to="/dashboard" /> */}
                </Suspense>
                <BackTop />
            </Content>
        </>
    )
}

export default ContentWrapper