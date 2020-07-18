import React, { useState, useEffect } from 'react'
import { DashboardModel } from '../../model';
import { notification, Button } from 'antd';
import TeamPicker from 'src/views/components/Pickers/TeamPicker'
import { getBackendSrv } from 'src/core/services/backend';
import { ConfirmModal } from 'src/packages/datav-core/src';

interface Props {
    dashboard: DashboardModel
}

const Permission = (props: Props) => {
    const [ownedBy, setOwnedBy] = useState(null)
    const [teamsCanView, setTeamsCanView] = useState(null)
    const [confirmVisible, setConfirmVisible] = useState(false)

    useEffect(() => {
        // get dashboard acls
        loadAcl()
    }, [])

    const loadAcl = async () => {
        const res = await getBackendSrv().get(`/api/dashboard/acl/${props.dashboard.id}`)
        setTeamsCanView(res.data)
        console.log(props.dashboard.meta.ownedBy)
        setOwnedBy(props.dashboard.meta.ownedBy)
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
        await getBackendSrv().post(`/api/dashboard/acl`, { dashId: props.dashboard.id, teamIds: teamsCanView })

        notification['success']({
            message: "Success",
            description: `Permission updated`,
            duration: 5
        });
    }

    return (
        <>
            <h3 className="dashboard-settings__header">
                Permissions
            </h3>

            <div className="gf-form-group">
                {
                    teamsCanView && <>
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