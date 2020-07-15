import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Page from 'src/views/Layouts/Page/Page';
import { getBackendSrv } from 'src/packages/datav-core';
import { getNavModel } from '../../Layouts/Page/navModel'
import { UserState } from 'src/store/reducers/user';
import UserTable from './UserTable'
import AddUser from './AddUser'

export interface Props {
    routeID: string;
    parentRouteID: string;
}

interface State {
    users: UserState[]
    hasFetched: boolean
}

export class UserPage extends PureComponent<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            users: null,
            hasFetched: true
        }

        this.onAddUser = this.onAddUser.bind(this)
        this.fetchData = this.fetchData.bind(this)
    }
    componentDidMount() {
        this.fetchData();
    }

    async fetchData() {
        const res = await getBackendSrv().get('/api/users')
        if (res.data) {
            this.setState({
                users: res.data,
                hasFetched: true
            })
        }
    }

    onAddUser(user) {
        const newUsers = _.cloneDeep(this.state.users)
        newUsers.unshift(user)
        console.log(newUsers)
        this.setState({
            ...this.state,
            users: newUsers
        })
    }

    render() {
        const { routeID, parentRouteID } = this.props
        const navModel = getNavModel(routeID, parentRouteID)

        const { hasFetched, users } = this.state

        return (
            <Page navModel={navModel}>
                <Page.Contents isLoading={!hasFetched}>
                    <div style={{ float: 'right' }}>
                        <AddUser onAddUser={this.onAddUser} />
                    </div>
                    <div style={{ marginTop: '42px' }}>
                        {hasFetched && <UserTable users={users} reloadUsers={this.fetchData}/>}
                    </div>
                </Page.Contents>
            </Page>
        );
    }
}




export default withRouter(UserPage);
