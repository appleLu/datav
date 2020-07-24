import React, { PureComponent } from 'react';
import { getBootConfig, InlineFormLabel } from 'src/packages/datav-core';

import Page from 'src/views/Layouts/Page/Page';
import { getNavModel } from 'src/views/Layouts/Page/navModel';
import { Button, Input, notification,Select, Tooltip} from 'antd';

import { getBackendSrv } from 'src/core/services/backend';
import { getState } from 'src/store/store';
import { UserState } from 'src/store/reducers/user';
import isEmail from 'validator/lib/isEmail';
import {EyeTwoTone,EyeInvisibleOutlined} from '@ant-design/icons'
import { SideMenu } from 'src/types';

const {Option} = Select

interface Props {
    routeID: string;
    parentRouteID: string;
}

interface Password {
    old: string 
    new: string 
    confirm: string
}

interface State {
    isLoaded: boolean
    user: UserState
    password: Password
    sidemenus: SideMenu[]
}

class UserPreferencePage extends PureComponent<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            isLoaded: false,
            user: null,
            password: null,
            sidemenus: null
        }
    }

    async componentWillMount() {
        const res = await getBackendSrv().get("/api/users/user", { id: getState().user.id })
        const res0 = await getBackendSrv().get("/api/users/user/sidemenus")
        let exist = false 
        res0.data.forEach((sm:SideMenu) => {
            if (sm.id === res.data.sidemenu) {
                exist = true
            }
        }) 
        if(!exist) {
            notification['error']({
                message: "Error",
                description: `The sidemenu you are using is not exist any more,please choose another one instead`,
                duration: 10
            });
        }

        this.setState({
            ...this.state,
            isLoaded: true,
            user: res.data,
            sidemenus: res0.data
        })
    }

    onChangeUser(k, v) {
        this.setState({
            ...this.state,
            user: {
                ...this.state.user,
                [k]: v.currentTarget.value
            }
        })
    }

    async onUpdateUser() {
        if (this.state.user.email && !isEmail(this.state.user.email)) {
            notification['error']({
                message: "Error",
                description: `Invalid email format`,
                duration: 5
            });
            return
        }

        await getBackendSrv().put("/api/users/user/info",this.state.user)
        notification['success']({
            message: "Success",
            description: 'User info updated ',
            duration: 5
        });
    }

    onChangePassword(k,v) {
        this.setState({
            ...this.state,
            password: {
                ...this.state.password,
                [k] : v.currentTarget.value.trim()
            }
        })
    }
    
    async onUpdatePassword() {
        const {old,confirm} = this.state.password
        const newPW = this.state.password.new
        
        if (!old || !newPW || !confirm) {
            notification['error']({
                message: "Error",
                description: 'Password cannot be empaty',
                duration: 5
            });
            return
        }

        if (newPW != confirm) {
            notification['error']({
                message: "Error",
                description: 'The new password does not match the confirm one',
                duration: 5
            });
            return
        }
        
        await getBackendSrv().put('/api/users/user/password',this.state.password)
        notification['success']({
            message: "Success",
            description: 'Password updated!',
            duration: 5
        });
        
        // this.setState({
        //     ...this.state,
        //     password: null
        // })
    }

    onChangeSideMenu(v) {
        this.setState({
            ...this.state,
            user: {
                ...this.state.user,
                sidemenu: v
            }
        })
        console.log(v)
    }

    async onUpdateUserSidemenu() {
        await getBackendSrv().put("/api/users/user/sidemenu", {menuId: this.state.user.sidemenu})
        notification['success']({
            message: "Success",
            description: 'Sidemenu updated! Refresh page to see new menu',
            duration: 5
        });
    }

    render() {
        const { routeID, parentRouteID } = this.props
        const navModel = getNavModel(routeID, parentRouteID)
        const { isLoaded, user,sidemenus } = this.state
        return (
            <Page navModel={navModel}>
                <Page.Contents>
                    {isLoaded && <div>
                        <h3 className="page-sub-heading">User Information</h3>
                        <div className="gf-form max-width-30">
                            <InlineFormLabel>Name</InlineFormLabel>
                            <Input defaultValue={user.name} onChange={(v) => this.onChangeUser('name', v)} placeholder="enter your name or nickname" />
                        </div>

                        <div className="gf-form max-width-30">
                            <InlineFormLabel>Email</InlineFormLabel>
                            <Input defaultValue={user.email} onChange={(v) => this.onChangeUser('email', v)} placeholder="enter your email" />
                        </div>


                        <div className="gf-form-button-row">
                            <Button type="primary" onClick={() => this.onUpdateUser()} ghost>
                                Submit
                                </Button>
                        </div>


                        <h3 className="page-sub-heading ub-mt4" >Change Passowrd</h3>
                        <div className="gf-form max-width-30">
                            <InlineFormLabel>Old Password</InlineFormLabel>
                            <Input.Password
                                placeholder="******"
                                onBlur={(v) => this.onChangePassword('old',v)}
                                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </div>

                        <div className="gf-form max-width-30">
                            <InlineFormLabel>New Password</InlineFormLabel>
                            <Input.Password
                                placeholder="******"
                                onChange={(v) => this.onChangePassword('new',v)}
                                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </div>

                        <div className="gf-form max-width-30">
                            <InlineFormLabel>Confirm Password</InlineFormLabel>
                            <Input.Password
                                placeholder="******"
                                onChange={(v) => this.onChangePassword('confirm',v)}
                                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </div>

                        <div className="gf-form-button-row">
                            <Button type="primary" onClick={() => this.onUpdatePassword()} ghost>
                            Submit
                                </Button>
                        </div>

                        <h3 className="page-sub-heading ub-mt4">Advance Settings</h3>
                        <div className="gf-form max-width-30">
                            <InlineFormLabel>Side Menu</InlineFormLabel>
                            <Select
                                style={{ width: '100%' }}
                                placeholder="select a sidemenu from teams"
                                optionLabelProp="label"
                                value={user.sidemenu??1}
                                onChange={(v) => this.onChangeSideMenu(v)}
                            >
                                {
                                    sidemenus.map((sm) => {
                                        return <Option value={sm.id} label={sm.teamName} key={sm.id}>
                                            <Tooltip title={sm.desc} placement="left">
                                               <div>{sm.teamName}</div>
                                            </Tooltip>
                                        </Option>
                                    })
                                }
                            </Select>
                            <Button type="primary" className="ub-ml2" onClick={() => this.onUpdateUserSidemenu()} ghost>
                                Update
                                </Button>
                        </div>
                    </div>
                    }
                </Page.Contents>
            </Page>
        );
    }
}

export default UserPreferencePage
