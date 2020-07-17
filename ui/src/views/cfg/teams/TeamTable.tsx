import React, { useState } from 'react'
import { Table, Space, Modal,Tag} from 'antd'
import { Team } from 'src/types';
import { Link } from 'react-router-dom';
import { getState } from 'src/store/store';

interface Props {
    teams: Team[]
    reloadTeams: any
}

const TeamTable = (props: Props) => {
    const [editTeamVisible, setEditTeamVisible] = useState(false)
    const [teamEdit, setTeamEdit] = useState(null)

    props.teams?.map((team) => {
        //@ts-ignore
        team.key = team.id
    })

    const columns = [
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
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Members',
        dataIndex: 'memberCount',
        key: 'memberCount',
    }
]