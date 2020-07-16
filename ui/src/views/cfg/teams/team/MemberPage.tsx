import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Page from 'src/views/Layouts/Page/Page';
import { getNavModel } from 'src/views/Layouts/Page/navModel'
import { Team } from 'src/types';
import { getBackendSrv } from 'src/core/services/backend';
import MemberTable from './Member/MemberTable'
import AddMember from './Member/AddMember'
import { TeamMember } from 'src/types';
import appEvents from 'src/core/library/utils/app_events';

export interface Props {
    routeID: string;
    parentRouteID: string;
}

interface State {
    team: Team
    hasFetched: boolean
    members: TeamMember[]
}

export class TeamMemberPage extends PureComponent<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            team: null,
            hasFetched: true,
            members: []
        }

        appEvents.on('update-team-member', () => {
            this.loadMembers()
        })
    }
        
    
    loadMembers = async () => {
        const res =  await getBackendSrv().get(`/api/teams/members/${this.state.team.id}`)
        const members = res.data 
        members.map((member) => {
            //@ts-ignore
            member.key = member.id
        })

        this.setState({
            ...this.state,
            members
        })
    }

    
    componentDidMount() {
        this.fetchData();
    }

    async fetchData() {
        // @ts-ignore
        const res = await getBackendSrv().get('/api/teams/team',{id : this.props.match.params['id']})
        const team:Team = res.data
        if (team) {
            this.setState({
                team: team,
                hasFetched: true
            })
        }
        this.loadMembers()
    }

    render() {
        const { routeID, parentRouteID } = this.props

        const {team,hasFetched,members} = this.state
        let navModel;
        if (team) {
            navModel = _.cloneDeep(getNavModel(routeID,parentRouteID))
            const {node,main} = navModel
              node.url = node.url.replace(":id",team.id)
              main.children.forEach((n) => {
                  n.url = n.url.replace(":id",team.id)
              })
    
            navModel.main.text = navModel.main.text + ' / ' + team.name
        } else {
            navModel = _.cloneDeep(getNavModel(routeID,parentRouteID))
        }

        const teamMemberIds = {}
        if (members.length > 0) {
            members.forEach((member) => {
                teamMemberIds[member.id] = true
            })
        } 

        return (
            <Page navModel={navModel}>
                <Page.Contents isLoading={!hasFetched}>
                    <div style={{float: 'right'}}>{team && <AddMember teamId={team.id} inTeamMembers={teamMemberIds}/>}</div>
                    <div style={{ marginTop: '42px' }} >{ team && <MemberTable teamCreatedBy={team.createdById} teamId={team.id} members={members}/>}</div>
                </Page.Contents>
            </Page>
        );
    }
}




export default withRouter(TeamMemberPage);
