import { getAppPath } from 'alemonjs'
import { basename } from 'path'
export const DirPath= getAppPath(import.meta.url)
export const AppName = basename(DirPath)


