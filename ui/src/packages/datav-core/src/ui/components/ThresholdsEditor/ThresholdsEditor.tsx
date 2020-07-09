import React, { PureComponent, ChangeEvent } from 'react';
import { css } from 'emotion';
import {
    Threshold,
    sortThresholds,
    ThresholdsConfig,
    ThresholdsMode,
    SelectableValue,
} from '../../../data';
import { colors } from '../../utils';
import { Input } from '../Form/Legacy/Input/Input';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import { Icon } from '../Icon/Icon';
import { Radio, Button } from 'antd';
import { FullWidthButtonContainer } from '../Container/FullWidthButtonContainer';
import { Label } from '../Form/Label';
import { PlusOutlined } from '@ant-design/icons';
import { RadioChangeEvent } from 'antd/lib/radio';
import './ThresholdsEditor.less'

const modes: Array<SelectableValue<ThresholdsMode>> = [
    { value: ThresholdsMode.Absolute, label: 'Absolute', description: 'Pick thresholds based on the absolute values' },
    {
        value: ThresholdsMode.Percentage,
        label: 'Percentage',
        description: 'Pick threshold based on the percent between min/max',
    },
];

export interface Props {
    thresholds: ThresholdsConfig;
    onChange: (thresholds: ThresholdsConfig) => void;
}

interface State {
    steps: ThresholdWithKey[];
}

export class ThresholdsEditor extends PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        const steps = toThresholdsWithKey(props.thresholds!.steps);
        steps[0].value = -Infinity;

        this.state = { steps };
    }

    onAddThreshold = () => {
        const { steps } = this.state;

        let nextValue = 0;

        if (steps.length > 1) {
            nextValue = steps[steps.length - 1].value + 10;
        }

        const color = colors.filter(c => !steps.some(t => t.color === c))[1];

        const add = {
            value: nextValue,
            color: color,
            key: counter++,
        };

        const newThresholds = [...steps, add];
        sortThresholds(newThresholds);

        this.setState({ steps: newThresholds }, this.onChange);
    };

    onRemoveThreshold = (threshold: ThresholdWithKey) => {
        const { steps } = this.state;

        if (!steps.length) {
            return;
        }

        // Don't remove index 0
        if (threshold.key === steps[0].key) {
            return;
        }

        this.setState({ steps: steps.filter(t => t.key !== threshold.key) }, this.onChange);
    };

    onChangeThresholdValue = (event: ChangeEvent<HTMLInputElement>, threshold: ThresholdWithKey) => {
        const cleanValue = event.target.value.replace(/,/g, '.');
        const parsedValue = parseFloat(cleanValue);
        const value = isNaN(parsedValue) ? '' : parsedValue;

        const steps = this.state.steps.map(t => {
            if (t.key === threshold.key) {
                t = { ...t, value: value as number };
            }
            return t;
        });

        if (steps.length) {
            steps[0].value = -Infinity;
        }

        sortThresholds(steps);
        this.setState({ steps });
    };

    onChangeThresholdColor = (threshold: ThresholdWithKey, color: string) => {
        const { steps } = this.state;

        const newThresholds = steps.map(t => {
            if (t.key === threshold.key) {
                t = { ...t, color: color };
            }

            return t;
        });

        this.setState({ steps: newThresholds }, this.onChange);
    };

    onBlur = () => {
        const steps = [...this.state.steps];
        sortThresholds(steps);
        this.setState({ steps }, this.onChange);
    };

    onChange = () => {
        this.props.onChange(thresholdsWithoutKey(this.props.thresholds, this.state.steps));
    };

    onModeChanged = (e:RadioChangeEvent) => {
        this.props.onChange({
            ...this.props.thresholds,
            mode: e.target.value,
        });
    };

    renderInput(threshold: ThresholdWithKey) {
        const isPercent = this.props.thresholds.mode === ThresholdsMode.Percentage;

        if (!isFinite(threshold.value)) {
            return (
                <Input
                    type="text"
                    value={'Base'}
                    disabled
                    prefix={
                        threshold.color && (
                            <div className={'thresholds-editor-colorPicker'}>
                                <ColorPicker
                                    color={threshold.color}
                                    onChange={color => this.onChangeThresholdColor(threshold, color)}
                                />
                            </div>
                        ) as any
                    }
                />
            );
        }

        return (
            <Input
                type="number"
                step="0.0001"
                key={isPercent.toString()}
                onChange={(event: ChangeEvent<HTMLInputElement>) => this.onChangeThresholdValue(event, threshold)}
                value={threshold.value}
                onBlur={this.onBlur}
                prefix={
                    <div className={'thresholds-editor-inputPrefix'}>
                        {threshold.color && (
                            <div className={'thresholds-editor-ColorPicker'}>
                                <ColorPicker
                                    color={threshold.color}
                                    onChange={color => this.onChangeThresholdColor(threshold, color)}
                                />
                            </div>
                        )}
                        {isPercent && <div className={'thresholds-editor-percentIcon'}>%</div>}
                    </div> as any
                }
                //@ts-ignore
                suffix={
                    <Icon className={'thresholds-editor-trashIcon'} name="trash-alt" onClick={() => this.onRemoveThreshold(threshold)} />
                }
            />
        );
    }

    render() {
        const { thresholds } = this.props;
        const { steps } = this.state;
        return (
            <>
                {
                    <div className={'thresholds-editor-wrapper'}>
                        <FullWidthButtonContainer className={'thresholds-editor-addButton'}>
                            <Button icon={<PlusOutlined />} onClick={() => this.onAddThreshold()} >
                                Add threshold
                            </Button>
                        </FullWidthButtonContainer>
                        <div className={'thresholds-editor-thresholds'}>
                            {steps
                                .slice(0)
                                .reverse()
                                .map(threshold => {
                                    return (
                                        <div className={'thresholds-editor-tem'} key={`${threshold.key}`}>
                                            {this.renderInput(threshold)}
                                        </div>
                                    );
                                })}
                        </div>

                        <div>
                            <Label description="Percentage means thresholds relative to min & max">Thresholds mode</Label>
                            <FullWidthButtonContainer>
                                <Radio.Group  options={modes as any} onChange={this.onModeChanged} value={thresholds.mode} />
                            </FullWidthButtonContainer>
                        </div>
                    </div>
                }
            </>
        );
    }
}

interface ThresholdWithKey extends Threshold {
    key: number;
}

let counter = 100;

function toThresholdsWithKey(steps?: Threshold[]): ThresholdWithKey[] {
    if (!steps || steps.length === 0) {
        steps = [{ value: -Infinity, color: 'green' }];
    }

    return steps.map(t => {
        return {
            color: t.color,
            value: t.value === null ? -Infinity : t.value,
            key: counter++,
        };
    });
}

export function thresholdsWithoutKey(thresholds: ThresholdsConfig, steps: ThresholdWithKey[]): ThresholdsConfig {
    const mode = thresholds.mode ?? ThresholdsMode.Absolute;
    return {
        mode,
        steps: steps.map(t => {
            const { key, ...rest } = t;
            return rest; // everything except key
        }),
    };
}
