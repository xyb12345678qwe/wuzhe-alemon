import { getAppPath } from 'alemonjs'
import { basename } from 'path'
import { plugin, AMessage } from 'alemonjs'
import Show from './model/shou.js'
import puppeteer from './lib/puppeteer/puppeteer.js'
import Help from './model/help.js';

export const DirPath= getAppPath(import.meta.url)
export const AppName = basename(DirPath)

export {plugin,AMessage,Show,puppeteer,Help}
