import React, { useState } from 'react'
import { Table, Space, Modal,Tag, Tooltip} from 'antd'
import { Team } from 'src/types';
import { Link } from 'react-router-dom';
import { getState } from 'src/store/store';

interface Props {
    teams: Team[]
    reloadTeams: any
}

const TeamTable = (props: Props) => {
    const [editTeamVisible, setEditTeamVisible] = useState(false)
    
    props.teams?.map((team) => {
        //@ts-ignore
        team.key = team.id
    })

    const columns = [    
        {
        title: 'Name',
        key: 'name',
        render: (_, team:Team) => (
            <>
            <span>{team.name}</span>
            {team.id == 1 && <Tooltip title="Every user in datav will be in global team,this team cannot be changed"><Tag className="ub-ml1">Main Team</Tag></Tooltip>}
            </>
        ),
        },
        ...rawColumns,
        {
            title: 'Created By',
            key: 'createdBy',
            render: (_, team:Team) => (
                <>
                <span>{team.createdBy}</span>
                {getState().user.id === team.createdById && <Tag className="ub-ml1">You</Tag>}
                </>
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, team) => (
                <Space size="middle">
                    <Link to={`/team/members/${team.id}`}  className="pointer">View</Link>
                </Space>
            ),
        }
    ]

    return (
        <>
            <Table
                columns={columns}
                dataSource={props.teams}
                pagination={false}
            />
            {editTeamVisible &&
                <Modal
                    title="Edit Team"
                    visible={true}
                    footer={null}
                    onCancel={() => setEditTeamVisible(false)}
                    maskClosable={false}
                >
                </Modal>}
        </>
    )

}

export default TeamTable

const rawColumns = [
    {
        title: 'Members',
        dataIndex: 'memberCount',
        key: 'memberCount',
    }
]