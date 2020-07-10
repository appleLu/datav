import React, { PureComponent } from 'react';
import { Cascader } from 'antd';
import { getValueFormats, SelectableValue } from '../../../data';

interface Props {
  onChange: (item?: string) => void;
  value?: string;
  width?: number;
}

export class UnitPicker extends PureComponent<Props> {
  onChange = (value) => {
    this.props.onChange(value);
  };

  render() {
    const { value, width } = this.props;

    // Set the current selection
    let current: SelectableValue<string> | undefined = undefined;

    // All units
    const unitGroups = getValueFormats();

    // Need to transform the data structure to work well with Select
    const groupOptions = unitGroups.map(group => {
      const options = group.submenu.map(unit => {
        const sel = {
          label: unit.text,
          value: unit.value,
        };
        if (unit.value === value) {
          current = sel;
        }
        return sel;
      });

      return {
        label: group.text,
        value: group.text,
        items: options,
      };
    });

    // Show the custom unit
    if (value && !current) {
      current = { value, label: value };
    }

    return (
      <Cascader
        style={{width: width}}
        defaultValue={current && current.label as any}
        // formatCreateLabel={formatCreateLabel}
        options={groupOptions as any}
        placeholder="Choose"
        onChange={this.props.onChange as any}
      />
    );
  }
}
