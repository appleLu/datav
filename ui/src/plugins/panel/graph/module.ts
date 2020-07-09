import { PanelPlugin } from 'src/packages/datav-core';
import { GraphPanelOptions } from './types';
import { GraphPanel } from './GraphPanel';

export const plugin = new PanelPlugin<GraphPanelOptions>(GraphPanel)
  .useFieldConfig()
  .setPanelOptions(builder => {
    builder
    .addBooleanSwitch({
      path: 'lines',
      name: 'Lines',
      description:'show/hide lines',
      defaultValue: true
    })
    .addSelect({
      path: 'linewidth',
      name: 'Line Width',
      description:'show/hide lines',
      defaultValue: '1',
      settings: {
        options: poitsRadiusOptions()
      },
      showIf: options => options.lines === true
    })
    .addSelect({
      path: 'fill',
      name: 'Area Fill',
      description:'fill factor of the graph area',
      defaultValue: '1',
      settings: {
        options: poitsRadiusOptions()
      },
      showIf: options => options.lines === true
    })
    .addSelect({
      path: 'fillGradient',
      name: 'Fill Gradient',
      description:'fill gradient of the graph area',
      defaultValue: '0',
      settings: {
        options: poitsRadiusOptions()
      },
      showIf: options => options.lines === true
    })
    .addBooleanSwitch({
      path: 'steppedLine',
      name: 'Staircase',
      description: 'line width in pixels',
      defaultValue:false,
      showIf: options => options.lines === true
    })
    .addBooleanSwitch({
      path: 'bars',
      name: 'Bars',
      description: 'show/hide bars',
      defaultValue:false
    })
    .addBooleanSwitch({
      path: 'points',
      name: 'Points',
      description:'show/hide points',
      defaultValue: false
    }) 
    .addSelect({
      path: 'pointradius',
      name: 'Point Radius',
      description: 'point radius in pixels',
      defaultValue: '1',
      settings: {
        options: poitsRadiusOptions()
      },
      showIf: options => options.points === true
    })
    .addBooleanSwitch({
      path: 'stack',
      name: 'Stack',
      defaultValue: false
    }) 
    .addBooleanSwitch({
      path: 'percentage',
      name: 'Stack Percentage',
      description: 'stack percentage mode',
      defaultValue: false,
      showIf: options => options.stack === true
    }) 
    .addSelect({
      path: 'nullPointMode',
      name: 'Null Value',
      description: 'how null points should be handled',
      defaultValue: 'null',
      settings: {
        options: [
          {value: 'null', label:'null'},
          {value: 'connected',label:'connected'},
          {value: 'null as zero',label:'null as zero'},
        ]
      }
    })
    .addRadio({
      path: 'tooltip.shared',
      name: 'Hover Tooltip Mode',
      defaultValue: true,
      settings: {
        options: [
          //@ts-ignore
          {value: true, label:'All series'},
          //@ts-ignore
          {value: false,label:'Single'}
        ]
      }
    })
    .addRadio({
      path: 'tooltip.sort',
      name: 'Hover Tooltip Sort Order',
      defaultValue: 2,
      settings: {
        options: [
          {value: 0, label:'None'},
          {value: 1,label:'Increasing'},
          {value: 2,label:'Decreasing'}
        ]
      }
    })
    .addRadio({
      path: 'tooltip.value_type',
      name: 'Hover Tooltip Stacked Value',
      defaultValue: 'individual',
      settings: {
        options: [
          {value: 'individual', label:'individual'},
          {value: 'cumulative',label:'cumulative'},
        ]
      },
      showIf: options => options.stack === true
    })
  })

const poitsRadiusOptions = () => {
  let r = []
  for (var i=1;i<=10;i++) {
    r.push({value:i,label:i.toString()})
  }

  return r
}