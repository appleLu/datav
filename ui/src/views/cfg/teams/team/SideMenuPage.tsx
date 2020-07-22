import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Page from 'src/views/Layouts/Page/Page';
import { getNavModel } from 'src/views/Layouts/Page/navModel'
import { Team, SideMenu } from 'src/types';
import { getBackendSrv } from 'src/core/services/backend';
import { InlineFormLabel,IconName } from 'src/packages/datav-core'
import { Button, Input,notification, Tree } from 'antd';
import EmptyListCTA from 'src/views/components/EmptyListCTA/EmptyListCTA';
import MenuManage from './MenuManage/MenuManage'

export interface Props {
    routeID: string;
    parentRouteID: string;
}

interface State {
    team: Team
    sidemenu: SideMenu
    hasFetched: boolean
    confirmVisible: boolean
    confirmContent: any
}


const emptyListModel = {
    title: 'There are no team scope menu for this team yet',
    buttonIcon: 'database' as IconName,
    buttonTitle: 'Add Team Menu',
    proTip: `By default, you are using global team's menu`,
    proTipLink: ''
  };

  
export class TeamSettingPage extends PureComponent<Props, State> {
    teamId;
    constructor(props) {
        super(props)
        this.state = {
            team: null,
            sidemenu:null,
            hasFetched: true,
            confirmVisible: false,
            confirmContent: {}
        }
        //@ts-ignore
        this.teamId = this.props.match.params['id'] 
    }

    componentDidMount() {
        this.fetchData();
    }

    async fetchData() {
        const res = await getBackendSrv().get('/api/teams/team', { id: this.teamId})
        const res1 = await getBackendSrv().get(`/api/sidemenu/${this.teamId}`)
        console.log(res1.data)
        if (res.data) {
            this.setState({
                team: res.data,
                sidemenu: res1.data,
                hasFetched: true
            })
        }
    }

    onChangeSideMenuDesc = (e) => {
        this.setState({
            ...this.state,
            sidemenu: {
                ...this.state.sidemenu,
                desc: e.currentTarget.value
            }
        })
    }

    async updateSideMenu()  {
        await getBackendSrv().put(`/api/sidemenu/${this.teamId}`,this.state.sidemenu)
        notification['success']({
            message: "Success",
            description: `Team SideMenu Updated!`,
            duration: 5
        });
        window.location.reload()
    }
    
    onChangeMenu(v) {
        this.setState({
            ...this.state,
            sidemenu : {
                ...this.state.sidemenu,
                data : v
            }
        })
    }
    
    render() {
        const { routeID, parentRouteID } = this.props

        const { sidemenu,team,hasFetched,confirmVisible,confirmContent} = this.state
        let navModel;
        if (team) {
            navModel = _.cloneDeep(getNavModel(routeID, parentRouteID))
            const { node, main } = navModel
            node.url = node.url.replace(":id", team.id)
            main.children.forEach((n) => {
                n.url = n.url.replace(":id", team.id)
            })

            navModel.main.title = navModel.main.title + ' / ' + team.name
        } else {
            navModel = _.cloneDeep(getNavModel(routeID, parentRouteID))
        }


        return (
            <Page navModel={navModel}>
                <Page.Contents isLoading={!hasFetched}>
                    {
                        sidemenu ?
                        <div>
                            <h3 className="page-sub-heading">Basic Settings</h3>
                            <form name="teamDetailsForm" className="gf-form-group">
                                <div className="gf-form max-width-30">
                                    <InlineFormLabel>Description</InlineFormLabel>
                                    <Input
                                        type="text"
                                        required
                                        value={sidemenu.desc}
                                        className="gf-form-input max-width-14"
                                        onChange={this.onChangeSideMenuDesc}
                                    />
                                </div>
                            </form>
                            <h3 className="page-sub-heading">Menu Manage</h3>
                            <MenuManage value={sidemenu.data} onChange={(v) => this.onChangeMenu(v)}/>
                            <div className="gf-form-button-row">
                                <Button  type="primary" onClick={() => this.updateSideMenu()}>
                                    Update
                                </Button>
                            </div>

                        </div> :
                        <EmptyListCTA {...emptyListModel}  onClick={() => alert(1)} />
                    }
                </Page.Contents>
            </Page>
        );
    }
}




export default withRouter(TeamSettingPage);
