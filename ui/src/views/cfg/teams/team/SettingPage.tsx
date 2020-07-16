import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom'
import _ from 'lodash'

import Page from 'src/views/Layouts/Page/Page';
import { getNavModel } from 'src/views/Layouts/Page/navModel'
import { Team } from 'src/types';
import { getBackendSrv } from 'src/core/services/backend';
import { InlineFormLabel } from 'src/packages/datav-core'
import { Button, Input,notification } from 'antd';

export interface Props {
    routeID: string;
    parentRouteID: string;
}

interface State {
    team: Team
    hasFetched: boolean
}

export class TeamSettingPage extends PureComponent<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            team: null,
            hasFetched: true
        }
    }

    componentDidMount() {
        this.fetchData();
    }

    async fetchData() {
        //@ts-ignore
        const res = await getBackendSrv().get('/api/teams/team', { id: this.props.match.params['id'] })
        if (res.data) {
            this.setState({
                team: res.data,
                hasFetched: true
            })
        }
    }

    updateSetting(e) {
        e.preventDefault();
        getBackendSrv().put(`/api/teams/team/${this.state.team.id}`,this.state.team).then(() => {
            notification['success']({
                message: "Success",
                description: `Team Updated!`,
                duration: 5
              });
        })
    }

    onChangeName = (event: any) => {
        this.setState({
            ...this.state,
            team: {
                ...this.state.team,
                name: event.target.value
            }
        });
    };

    render() {
        const { routeID, parentRouteID } = this.props

        const { team } = this.state
        let navModel;
        if (team) {
            navModel = _.cloneDeep(getNavModel(routeID, parentRouteID))
            const { node, main } = navModel
            node.url = node.url.replace(":id", team.id)
            main.children.forEach((n) => {
                n.url = n.url.replace(":id", team.id)
            })

            navModel.main.text = navModel.main.text + ' / ' + team.name
        } else {
            navModel = _.cloneDeep(getNavModel(routeID, parentRouteID))
        }

        const { hasFetched } = this.state

        return (
            <Page navModel={navModel}>
                <Page.Contents isLoading={!hasFetched}>
                    {
                        team && <div>
                            <h3 className="page-sub-heading">Team Settings</h3>
                            <form name="teamDetailsForm" className="gf-form-group" onSubmit={(e) => this.updateSetting(e)}>
                                <div className="gf-form max-width-30">
                                    <InlineFormLabel>Name</InlineFormLabel>
                                    <Input
                                        type="text"
                                        required
                                        value={team.name}
                                        className="gf-form-input max-width-14"
                                        onChange={this.onChangeName}
                                    />
                                </div>
                                <div className="gf-form-button-row">
                                    <Button htmlType="submit" type="primary">
                                        Update
                                 </Button>
                                </div>
                            </form>
                        </div>
                    }

                </Page.Contents>
            </Page>
        );
    }
}




export default withRouter(TeamSettingPage);
