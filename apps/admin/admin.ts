import { AppName } from '../../app-config.js'
import { exec } from 'child_process'
import {plugin,AMessage,Show,puppeteer,Help,DirPath} from '../../app-config'
// console.log(`${process.cwd()}/application/${AppName}/`);
// console.log(DirPath);
export class admin extends plugin {
  constructor() {
    super({
      name: '管理|更新插件',
      dsc: '管理和更新代码',
      event: 'message',
      priority: 400,
      rule: [
        {
          reg: '^(#|/)武者更新',
          fnc: 'checkout'
        }
      ]
    })
  }

  async checkout(e:AMessage):Promise<boolean> {
    if (!e.isMaster) return false
    exec(
      'git  pull',
    //   { cwd: `${process.cwd()}/application/${AppName}/` },
    { cwd: `${DirPath}/` },
      function (error, stdout, stderr) {
        if (/(Already up[ -]to[ -]date|已经是最新的)/.test(stdout)) {
          e.reply('目前已经是最新版武者文游了~')
          return false
        }
        if (error) {
          e.reply('武者文游更新失败！\nError code: ' +error.code + '\n' +error.stack +'\n 请稍后重试。'
          )
          return false
        }
        e.reply('更新成功,请[#重启]')
      }
    )
    return false
  }
}
