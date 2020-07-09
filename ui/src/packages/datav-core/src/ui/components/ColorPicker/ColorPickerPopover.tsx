import React from 'react';
import { NamedColorsPalette } from './NamedColorsPalette';
import { PopoverContentProps } from '../Tooltip/Tooltip';
import SpectrumPalette from './SpectrumPalette';
import { warnAboutColorPickerPropsDeprecation } from './warnAboutColorPickerPropsDeprecation';
import { ThemeType, getColorName, getColorFromHexRgbOrName} from '../../../data';
import { currentTheme } from '../../../data';

export type ColorPickerChangeHandler = (color: string) => void;

export interface ColorPickerProps  {
  color: string;
  onChange: ColorPickerChangeHandler;
}

export interface Props<T> extends ColorPickerProps, PopoverContentProps {
  customPickers?: T;
}

type PickerType = 'palette' | 'spectrum';

export interface CustomPickersDescriptor {
  [key: string]: {
    tabComponent: React.ComponentType<ColorPickerProps>;
    name: string;
  };
}

interface State<T> {
  activePicker: PickerType | keyof T;
}

export class ColorPickerPopover<T extends CustomPickersDescriptor> extends React.Component<Props<T>, State<T>> {
  constructor(props: Props<T>) {
    super(props);
    this.state = {
      activePicker: 'palette',
    };
    warnAboutColorPickerPropsDeprecation('ColorPickerPopover', props);
  }

  getTabClassName = (tabName: PickerType | keyof T) => {
    const { activePicker } = this.state;
    return `ColorPickerPopover__tab ${activePicker === tabName && 'ColorPickerPopover__tab--active'}`;
  };

  handleChange = (color: any) => {
    const {  onChange } = this.props;
    const changeHandler =  onChange;

    changeHandler(getColorFromHexRgbOrName(color, currentTheme));
  };

  onTabChange = (tab: PickerType | keyof T) => {
    return () => this.setState({ activePicker: tab });
  };

  renderPicker = () => {
    const { activePicker } = this.state;
    const { color } = this.props;

    switch (activePicker) {
      case 'spectrum':
        return <SpectrumPalette color={color} onChange={this.handleChange}  />;
      case 'palette':
        return (
          <NamedColorsPalette color={getColorName(color, currentTheme)} onChange={this.handleChange}  />
        );
      default:
        return this.renderCustomPicker(activePicker);
    }
  };

  renderCustomPicker = (tabKey: keyof T) => {
    const { customPickers, color } = this.props;
    if (!customPickers) {
      return null;
    }

    return React.createElement(customPickers[tabKey].tabComponent, {
      color,
       //@ts-ignore
      theme,
      onChange: this.handleChange,
    });
  };

  renderCustomPickerTabs = () => {
    const { customPickers } = this.props;

    if (!customPickers) {
      return null;
    }

    return (
      <>
        {Object.keys(customPickers).map(key => {
          return (
            <div className={this.getTabClassName(key)} onClick={this.onTabChange(key)} key={key}>
              {customPickers[key].name}
            </div>
          );
        })}
      </>
    );
  };

  render() {
    const colorPickerTheme = currentTheme || ThemeType.Dark;
    return (
      <div className={`ColorPickerPopover ColorPickerPopover--${colorPickerTheme}`}>
        <div className="ColorPickerPopover__tabs">
          <div className={this.getTabClassName('palette')} onClick={this.onTabChange('palette')}>
            Colors
          </div>
          <div className={this.getTabClassName('spectrum')} onClick={this.onTabChange('spectrum')}>
            Custom
          </div>
          {this.renderCustomPickerTabs()}
        </div>

        <div className="ColorPickerPopover__content">{this.renderPicker()}</div>
      </div>
    );
  }
}
