// Libaries
import React, { PureComponent } from 'react';
import _ from 'lodash'

// Types
import { DashboardModel } from '../../model/DashboardModel';
import { BackButton } from 'src/views/components/BackButton/BackButton';

import { CustomScrollbar, Icon } from 'src/packages/datav-core';
import { updateLocation } from 'src/store/reducers/location';
import './Setting.less'
import { store } from 'src/store/store';

import { getUrlParams } from 'src/core/library/utils/url';
import { cx } from 'emotion'
import { VariableEditorContainer } from 'src/views/variables/editor/VariableEditorContainer';
import GeneralSetting from './General'
import JsonSetting from './JsonSetting'
export interface Props {
  dashboard: DashboardModel | null;
  viewId: string
}

export class DashboardSettings extends PureComponent<Props> {
  element: HTMLElement;
  sections: any[];
  constructor(props) {
    super(props)
    this.buildSectionList()
  }
  componentDidMount() {
  }

  componentWillUnmount() {
  }

  buildSectionList() {
    this.sections = [];

    if (this.props.dashboard.meta.canEdit) {
      this.sections.push({
        title: 'General',
        id: 'general',
        icon: 'sliders-v-alt',
      });
      //   this.sections.push({
      //     title: 'Annotations',
      //     id: 'annotations',
      //     icon: 'comment-alt',
      //   });
      this.sections.push({
        title: 'Variables',
        id: 'variables',
        icon: 'calculator-alt',
      });
      //   this.sections.push({
      //     title: 'Links',
      //     id: 'links',
      //     icon: 'link',
      //   });
    }

    // if (this.props.dashboard.id && this.props.dashboard.meta.canSave) {
    //   this.sections.push({
    //     title: 'Versions',
    //     id: 'versions',
    //     icon: 'history',
    //   });
    // }

    // if (this.props.dashboard.id && this.props.dashboard.meta.canAdmin) {
    //   this.sections.push({
    //     title: 'Permissions',
    //     id: 'permissions',
    //     icon: 'lock',
    //   });
    // }

    // if (this.props.dashboard.meta.canMakeEditable) {
    //   this.sections.push({
    //     title: 'General',
    //     icon: 'sliders-v-alt',
    //     id: 'make_editable',
    //   });
    // }

    this.sections.push({
      title: 'JSON Model',
      id: 'dashboard_json',
      icon: 'arrow',
    });

    const params = getUrlParams();
    const url = window.location.pathname;

    for (const section of this.sections) {
      const sectionParams = _.defaults({ settingTab: section.id }, params);
      section.url = url + '?' + $.param(sectionParams);
    }
  }

  onClose = () => {
    store.dispatch(updateLocation({
      query: { settingTab: null },
      partial: true,
    }));
  };

  render() {
    const { dashboard } = this.props;
    const folderTitle = dashboard.meta.folderTitle;
    const haveFolder = dashboard.meta.folderId > 0;

    return (
      <div className="dashboard-settings">
        <div className="navbar navbar--edit">
          <div className="navbar-edit">
            <BackButton surface="panel" onClick={this.onClose} />
          </div>
          <div className="navbar-page-btn">
            {haveFolder && <div className="navbar-page-btn__folder">{folderTitle} / </div>}
            <span>{dashboard.title} / Settings</span>
          </div>
        </div>
        <CustomScrollbar>
          <div className="dashboard-settings__body1" ref={element => (this.element = element)} >
            <div className="dashboard-settings__body2">
              <aside className="dashboard-settings__aside">
                {
                  this.sections.map((item) => {
                    return (
                      <span
                        key={item.id}
                        onClick={() => store.dispatch(updateLocation({ query: { settingTab: item.id }, partial: true }))}
                        className={cx("pointer","dashboard-settings__nav-item", (this.props.viewId === item.id) && 'active')}
                      >
                        <Icon name={item.icon} style={{ marginRight: '4px' }} />
                        {item.title}
                      </span>
                    )
                  })
                }
              </aside>
                <div className="dashboard-settings__content">
                {
                  this.props.viewId === 'variables' && <VariableEditorContainer />
                }
                {
                  this.props.viewId === 'general' && <GeneralSetting dashboard={this.props.dashboard} />
                }
                {
                  this.props.viewId === 'dashboard_json' && <JsonSetting dashboard={this.props.dashboard} />
                }
                </div>
            </div>
          </div>
        </CustomScrollbar>
      </div>
    );
  }
}
