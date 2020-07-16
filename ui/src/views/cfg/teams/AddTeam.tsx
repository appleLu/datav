import React, { useState } from 'react'
import { LinkButton,Form,FormField as Field,Input} from 'src/packages/datav-core/src'
import {Modal,Button, notification} from 'antd'
import {getBackendSrv} from 'src/core/services/backend'

interface Props {
    onAddTeam : any
}


const AddTeam = (props: Props) => {
    const [modalVisible,setModalVisible] = useState(false)

    const initialFormModel = {
        name: ''
    }

    const addTeam = async (team)  => {
        const res = await getBackendSrv().post('/api/admin/team/new',team)
        props.onAddTeam(res.data)
        notification['success']({
            message: "Success",
            description: `Tea, ${team.name} has been added`,
            duration: 5
          });
        setModalVisible(false)
    }

    const validateName = async (name) => {
        name = (name || '').trim();
        if (name.length === 0) {
            return 'Team name is required'
        }

        const res = await getBackendSrv().get('/api/teams/team',{name: name})
        if (res.data.id == 0) {
            return true
        }

        return 'team name already exists'
    }

    return (
        <>
            <LinkButton onClick={() => setModalVisible(true)}>Add Team</LinkButton>
            <Modal
                title="Add New Team"
                visible={modalVisible}
                footer={null}
                onCancel={() => setModalVisible(false)}
            >
                <Form 
                    //@ts-ignore
                    defaultValues={initialFormModel} 
                    onSubmit={addTeam}
                >
                    {({ register, errors }) => (
                        <>
                            <Field
                                label="Team Name"
                                invalid={!!errors.name}
                                //@ts-ignore
                                error={errors.name && errors.name.message}
                            >
                                <Input
                                    name="name"
                                    ref={register({
                                        required: 'Team name is required.',
                                        validate: async v => await validateName(v),
                                    })}
                                />
                            </Field>
                            <Button type="primary" htmlType="submit" style={{marginTop: '16px'}}>Submit</Button>
                        </>
                    )}
                </Form>
            </Modal>
        </>
    )
}

export default AddTeam