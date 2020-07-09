import * as CoreEvents from './events';
export { CoreEvents };

export * from './store'
export * from './datasource'
export * from './dashboard'
export * from './folder'
export * from './templating'
export * from './search'
export * from './plugins'

export type KeyValuePair = {
    key: string;
    value: any;
};

