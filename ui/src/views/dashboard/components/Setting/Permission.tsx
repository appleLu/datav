import React, { useState, useEffect } from 'react'
import { DashboardModel } from '../../model';
import { notification, Button, Tooltip } from 'antd';
import TeamPicker from 'src/views/components/Pickers/TeamPicker'
import { getBackendSrv } from 'src/core/services/backend';
import { ConfirmModal } from 'src/packages/datav-core/src';
import AddExtraPermission from './components/AddExtraPermission'
import UserPermissions from './components/UserPermissions'
import { InfoCircleOutlined } from '@ant-design/icons';

interface Props {
    dashboard: DashboardModel
}

const Permission = (props: Props) => {
    const [ownedBy, setOwnedBy] = useState(null)
    const [teamsCanView, setTeamsCanView] = useState(null)
    const [confirmVisible, setConfirmVisible] = useState(false)
    const [addPermissionVisible,setAddPermissionVisible] = useState(false)
    const [userPermissions,setUserPermissions] = useState([])
    useEffect(() => {
        // get dashboard acls
        loadAcl()
    }, [])

    const loadAcl = async () => {
        const res = await getBackendSrv().get(`/api/dashboard/acl/team/${props.dashboard.id}`)
        setTeamsCanView(res.data)
        setOwnedBy(props.dashboard.meta.ownedBy)

        const res1 = await getBackendSrv().get(`/api/dashboard/acl/user/${props.dashboard.id}`)
        setUserPermissions(res1.data)
    }

    const onChangeTeamCanView = async (v) => {
        // set dashboard acls
        setTeamsCanView(v)
    }

    const onChangeOwnedBy = (v) => {
        setOwnedBy(v)
    }

    const updateOwnedBy = async () => {
        await getBackendSrv().put(`/api/dashboard/ownedBy`, { dashId: props.dashboard.id, ownedBy: ownedBy })
        notification['success']({
            message: "Success",
            description: `Permission updated`,
            duration: 5
        });
        window.location.reload()
    }

    const updateTeamCanView = async () => {
        await getBackendSrv().post(`/api/dashboard/acl/team`, { dashId: props.dashboard.id, teamIds: teamsCanView })

        notification['success']({
            message: "Success",
            description: `Permission updated`,
            duration: 5
        });
    }

    const onSubmitExtraPermission = async (user,permission) => {
        await getBackendSrv().post(`/api/dashboard/acl/user`, { dashId: props.dashboard.id, userId: user,permission: permission })

        notification['success']({
            message: "Success",
            description: `Permission updated`,
            duration: 5
        });

        loadAcl()
    }
    
    const onChangeUserPermission = async (userId,permission) => {
        await getBackendSrv().put(`/api/dashboard/acl/user`, { dashId: props.dashboard.id, userId: userId,permission: permission })

        notification['success']({
            message: "Success",
            description: `Permission updated`,
            duration: 5
        });

        loadAcl()
    }

    const onDeleteUserPermission = async (userId) => {
        await getBackendSrv().delete(`/api/dashboard/acl/user/${props.dashboard.id}/${userId}`)

        notification['success']({
            message: "Success",
            description: `Permission updated`,
            duration: 5
        });

        loadAcl()
    }

    return (
        <>
            <div className="gf-form-group">
                {
                    teamsCanView && <>
                        <div>
                            <h3 className="dashboard-settings__header">
                                Team Permissions
                            </h3>
                            <div className="gf-form">
                                <label className="gf-form-label width-12">Owned By Team</label>
                                <TeamPicker value={[ownedBy]} onChange={(v) => onChangeOwnedBy(v)} />
                                <Button className="ub-ml2" type="primary" ghost danger onClick={() => setConfirmVisible(true)}>Update</Button>
                            </div>
                            <div className="gf-form">
                                <label className="gf-form-label width-12">Teams Can View</label>
                                <TeamPicker value={teamsCanView} onChange={(v) => onChangeTeamCanView(v)} mutiple />
                                <Button className="ub-ml2" type="primary" onClick={() => updateTeamCanView()} ghost>Update</Button>
                            </div>
                        </div>

                        <div>
                            <div className="ub-mt4" style={{display:'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
                                <div>
                                    <h3 style={{display: 'inline-block'}} className="dashboard-settings__header ub-mr1">User Permissions</h3>
                                    <Tooltip title="If user permissions has been set, this user's team permissions will have no effect"><InfoCircleOutlined /></Tooltip>
                                </div>
                                <Button type="primary" onClick={() => setAddPermissionVisible(true)}>Add Permission</Button>
                            </div>
                            <UserPermissions permissions={userPermissions} onChange={(userId,permission) => onChangeUserPermission(userId,permission)} onDelete={(userId) => onDeleteUserPermission(userId)}/>
                            <AddExtraPermission visible={addPermissionVisible} setVisible={setAddPermissionVisible} onSubmit={(user,permission) => onSubmitExtraPermission(user,permission)}/>
                        </div>
                      
                    </>
                }
            </div>

            <ConfirmModal
                isOpen={confirmVisible}
                title="Change Dashboar Owner"
                body="Are you sure you want to change owner to another team? You will lost control to this dashboard"
                confirmText="Change"
                onConfirm={() => updateOwnedBy()}
                onDismiss={() => setConfirmVisible(false)}
            />
        </>
    )
}

export default Permission;