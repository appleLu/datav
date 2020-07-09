
import zhCN from './zh_CN'     // 中文
import enUS from './en_US'     // 英文

export enum Langs  {
    Chinese = 'zh_CN',
    English = 'en_US'
}

export type localeData = {
    [key:string]:string
}

type localeAll = {
    [key:string]:localeData
}

const localeAllData:localeAll =  {
    [Langs.English]: enUS,
    [Langs.Chinese]: zhCN
}

export default localeAllData
