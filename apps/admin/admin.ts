import { APlugin ,AMessage,AppName, DirPath } from '../../api'
import { exec } from 'child_process'

export class admin extends APlugin  {
  constructor() {
    super({
      dsc: '管理和更新代码',
      event: 'message',
      priority: 400,
      rule: [
        {
          reg: /^(#|\/)?武者更新$/,
          fnc: 'checkout'
        }
      ]
    })
  }

  async checkout(e:AMessage):Promise<boolean> {
    if (!e.isMaster) return false
    exec(
      'git  pull',
    { cwd: `${DirPath}/` },
      function (error, stdout, stderr) {
        if (/(Already up[ -]to[ -]date|已经是最新的)/.test(stdout)) return e.reply('目前已经是最新版武者文游了~');
        if (error) return e.reply('武者文游更新失败！\nError code: ' +error.code + '\n' +error.stack +'\n 请稍后重试。');
        e.reply('更新成功,请[#重启]')
      }
    )
    return false
  }
}
