import React, { FC, useState } from 'react';
import { css } from 'emotion';
import { Button, HorizontalGroup, Modal, stylesFactory, useTheme } from 'src/packages/datav-core';
import { AppEvents, DatavTheme } from 'src/packages/datav-core';
import { FolderInfo } from 'src/types';
import { FolderPicker } from 'src/views/components/Pickers/FolderPicker';

import { backendSrv } from 'src/core/services/backend';
import { DashboardSection, OnMoveItems } from '../types';
import { getCheckedDashboards } from '../utils';
import appEvents from 'src/core/library/utils/app_events';
import { notification } from 'antd';

interface Props {
  onMoveItems: OnMoveItems;
  results: DashboardSection[];
  isOpen: boolean;
  onDismiss: () => void;
}

export const MoveToFolderModal: FC<Props> = ({ results, onMoveItems, isOpen, onDismiss }) => {
  const [folder, setFolder] = useState<FolderInfo | null>(null);
  const theme = useTheme();
  const styles = getStyles(theme);
  const selectedDashboards = getCheckedDashboards(results);

  const moveTo = () => {
    if (folder && selectedDashboards.length) {
      const folderTitle = folder.title ?? 'General';
      backendSrv.moveDashboards(selectedDashboards.map(d => d.uid) as string[], folder).then((result: any) => {
        if (result.successCount > 0) {
          const ending = result.successCount === 1 ? '' : 's';
          const header = `Dashboard${ending} Moved`;
          const msg = `${result.successCount} dashboard${ending} moved to ${folderTitle}`;
          notification['success']({
            message: header,
            description: msg,
            duration: 5
          });
        }

        if (result.totalCount === result.alreadyInFolderCount) {
          notification['error']({
            message: 'Error',
            description: `Dashboard already belongs to folder ${folderTitle}`,
            duration: 5
          });

        } else {
          onMoveItems(selectedDashboards, folder);
        }

        onDismiss();
      });
    }
  };

  return isOpen ? (
    <Modal
      className={styles.modal}
      title="Choose Dashboard Folder"
      icon="folder-plus"
      isOpen={isOpen}
      onDismiss={onDismiss}
    >
      <>
        <div className={styles.content}>
          <p>
            Move the {selectedDashboards.length} selected dashboard{selectedDashboards.length === 1 ? '' : 's'} to the
            following folder:
          </p>
          <FolderPicker onChange={f => setFolder(f as FolderInfo)} useNewForms />
        </div>

        <HorizontalGroup justify="center">
          <Button variant="primary" onClick={moveTo}>
            Move
          </Button>
          <Button variant="secondary" onClick={onDismiss}>
            Cancel
          </Button>
        </HorizontalGroup>
      </>
    </Modal>
  ) : null;
};

const getStyles = stylesFactory((theme: DatavTheme) => {
  return {
    modal: css`
      width: 500px;
    `,
    content: css`
      margin-bottom: ${theme.spacing.lg};
    `,
  };
});
