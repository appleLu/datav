import React, { FC, useState } from 'react';
import { HorizontalGroup, LinkButton, Form ,FormField as Field,Input, config, getHistory} from 'src/packages/datav-core';
import { Modal,Button, message } from 'antd';
import { getBackendSrv } from 'src/core/services/backend';
import globalEvents from 'src/views/App/globalEvents';

export interface Props {
  folderId?: number;
  isEditor: boolean;
  canEdit?: boolean;
}
interface FormModel {
  folderName: string;
}

export const DashboardActions: FC<Props> = ({ folderId, isEditor, canEdit }) => {
  const [newFolderVisible,setNewFolderVisible] = useState(false)
  const actionUrl = (type: string) => {
    let url = `dashboard/${type}`;

    if (folderId) {
      url += `?folderId=${folderId}`;
    }

    return url;
  };

  const newFolder = (formData: FormModel) => {
    getBackendSrv().post('/api/folder/new',{title: formData.folderName}).then((res) => {
      globalEvents.showMessage(() => message.success(`Folder ${formData.folderName} created!`))
      getHistory().push(res.data.url)
    })
  }

  
  const initialFormModel:FormModel = { folderName: '' };
  const validateFolderName = async (name: string) => {
    name = (name || '').trim();
    if (name.length === 0) {
       return 'Folder name is required'
    }

    if (name.toLowerCase() === config.rootFolderName.toLowerCase()) {
      return `Cannot use 'General' as folder name`
    }

    const res = await getBackendSrv().get('/api/folder/byName',{name: name})
    if (res.data == -1) {
      return true
    }
  };
  return (
    <>
    <HorizontalGroup spacing="md" align="center">
      {/* {canEdit && <LinkButton href={actionUrl('new')}>New Dashboard</LinkButton>} */}
      {!folderId && isEditor && <LinkButton onClick={() => setNewFolderVisible(true)}>New Folder</LinkButton>}
      {/* {canEdit && <LinkButton href={actionUrl('import')}>Import</LinkButton>} */}
    </HorizontalGroup>

    <Modal
          title="New Dashboard Folder"
          visible={newFolderVisible}
          footer={null}
          onCancel={() => setNewFolderVisible(false)}
        >
          <Form defaultValues={initialFormModel} onSubmit={newFolder}>
            {({ register, errors }) => (
              <>
                <Field
                  label="Folder name"
                  invalid={!!errors.folderName}
                  //@ts-ignore
                  error={errors.folderName && errors.folderName.message}
                >
                  <Input
                    name="folderName"
                    ref={register({
                      required: 'Folder name is required.',
                      validate: async v => await validateFolderName(v),
                    })}
                  />
                </Field>
                <Button htmlType="submit">Create</Button>
              </>
            )}
          </Form>
        </Modal>
    </>
  );
};
