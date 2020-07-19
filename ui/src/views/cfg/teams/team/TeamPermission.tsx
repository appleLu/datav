import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import { InlineFormLabel} from 'src/packages/datav-core/src'
import { Select, notification } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { getBackendSrv } from 'src/core/services/backend'
import { Role } from 'src/types'
const {Option} = Select

interface Props {
    teamId: number
}

// CanView, CanAdd, CanEdit, CanSave, CanDelete, CanMangePermission

const PermissionPicker = (props) => {
    return (
        <Select 
            value={props.value} 
            onChange={props.onChange} 
            mode="multiple"
            style={{maxWidth: '100%',minWidth: '100px'}}
            disabled={props.disabled}
        >     
            <Option value={1}>View</Option>
            <Option value={2}>Add</Option>
            <Option value={3}>Edit</Option>
            <Option value={4}>Save</Option>
            <Option value={5}>Delete</Option>
            <Option value={6}>Permission</Option>
        </Select>
    )
}
const TeamPermission = (props:Props) =>{      
    const [permissions,setPermissions] = useState(null)
    useEffect(() => {
        loadPermissions()
    },[])

    const loadPermissions = async() => {
        const res = await getBackendSrv().get(`/api/teams/permissions/${props.teamId}`)
        setPermissions(res.data)
        console.log(res.data)
    }

    const changePermission = async (role, newPermission) => {
        await getBackendSrv().post(`/api/teams/permissions/${props.teamId}`,{"role" : role,"permission":newPermission})
        const newPermissions = _.cloneDeep(permissions)
        newPermissions[role] = newPermission
        setPermissions(newPermissions)
        notification['success']({
            message: "Success",
            description: `Permission updated`,
            duration: 5
          });
    }
    return (
        <>
             {
                permissions && <form name="teamDetailsForm" className="gf-form-group" onSubmit={(e) => this.updateSetting(e)}>
                    <div className="gf-form max-width-50">
                        <InlineFormLabel>Admin(Role)</InlineFormLabel>
                        <span className="color-primary ub-mr2">Can</span><PermissionPicker value={permissions[Role.Admin]}  disabled/>
                        <LockOutlined />
                    </div>
                    <div className="gf-form max-width-50 ub-mt2">
                        <InlineFormLabel>Editor(Role)</InlineFormLabel>
                        <span className="color-primary ub-mr2">Can</span><PermissionPicker value={permissions[Role.Editor]} onChange={(v) => changePermission(Role.Editor,v)}/>
                    </div>
                    <div className="gf-form max-width-50 ub-mt2">
                        <InlineFormLabel>Viewer(Role)</InlineFormLabel>
                        <span className="color-primary ub-mr2">Can</span><PermissionPicker value={permissions[Role.Viewer]} onChange={(v) => changePermission(Role.Viewer,v)}/>
                    </div>
                </form>
            }
        </>
    )
}

export default TeamPermission