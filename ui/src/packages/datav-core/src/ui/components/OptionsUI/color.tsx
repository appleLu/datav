import React from 'react';
import {
  FieldConfigEditorProps,
  ColorFieldConfigSettings,
} from '../../../data';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import { Icon } from '../Icon/Icon';
import { ColorPickerTrigger } from '../ColorPicker/ColorPickerTrigger';
import './color.less'

export const ColorValueEditor: React.FC<FieldConfigEditorProps<string, ColorFieldConfigSettings>> = ({
  value,
  onChange,
  item,
}) => {
  const { settings } = item;


  return (
    <ColorPicker color={undefined} onChange={onChange}>
      {({ ref, showColorPicker, hideColorPicker }) => {
        return (
          <div className={'options-ui-spot'} onBlur={hideColorPicker}>
            <div className={'options-ui-colorPicker'}>
              <ColorPickerTrigger
                ref={ref}
                onClick={showColorPicker}
                onMouseLeave={hideColorPicker}
              />
            </div>
            <div className={'options-ui-colorText'} onClick={showColorPicker}>
              {value ?? settings.textWhenUndefined ?? 'Pick Color'}
            </div>
            {value && settings.allowUndefined && (
              <Icon className={'options-ui-trashIcon'} name="trash-alt" onClick={() => onChange(undefined)} />
            )}
          </div>
        );
      }}
    </ColorPicker>
  );
};

