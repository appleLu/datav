import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Page from 'src/views/Layouts/Page/Page';
import { getBackendSrv } from 'src/packages/datav-core';
import { getNavModel } from '../../Layouts/Page/navModel'
import TeamTable from './TeamTable'
import AddTeam from './AddTeam'
import { Team, isAdmin } from 'src/types';
import { getState } from 'src/store/store';

export interface Props {
    routeID: string;
    parentRouteID: string;
}

interface State {
    teams: Team[]
    hasFetched: boolean
}

export class TeamPage extends PureComponent<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            teams: null,
            hasFetched: true
        }

        this.onAddTeam = this.onAddTeam.bind(this)
        this.fetchData = this.fetchData.bind(this)
    }
    componentDidMount() {
        this.fetchData();
    }

    async fetchData() {
        const res = await getBackendSrv().get('/api/teams')
        if (res.data) {
            this.setState({
                teams: res.data,
                hasFetched: true
            })
        }
    }

    onAddTeam(team) {
        const newTeams = _.cloneDeep(this.state.teams)
        newTeams.unshift(team)
        console.log(newTeams)
        this.setState({
            ...this.state,
            teams: newTeams
        })
    }

    render() {
        const { routeID, parentRouteID } = this.props
        const navModel = getNavModel(routeID, parentRouteID)

        const { hasFetched, teams } = this.state

        return (
            <Page navModel={navModel}>
                <Page.Contents isLoading={!hasFetched}>
                    {isAdmin(getState().user.role) && <div style={{ float: 'right'}}>
                        <AddTeam onAddTeam={this.onAddTeam} />
                    </div>}
                    <div style={{ marginTop: isAdmin(getState().user.role) ? '40px' :'0' }}>
                        {hasFetched && <TeamTable teams={teams} reloadTeams={this.fetchData} />}
                    </div>
                </Page.Contents>
            </Page>
        );
    }
}




export default withRouter(TeamPage);
