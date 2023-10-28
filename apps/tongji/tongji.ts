import { plugin, AMessage, getPluginHelp } from 'alemonjs'
import { AppName, DirPath } from '../../app-config'
import fs from 'fs'
import axios from 'axios'
import fetch from 'node-fetch';
const apiUrl = 'http://tj.mzswebs.top';
export class wuzhe_tongji extends plugin {
  constructor() {
    super({
      rule: [
        {
          reg: /^(#|\/)武者统计$/,
          fnc: 'tongji',
        },
        {
          reg: /^(#|\/)刷新统计$/,
          fnc: 'adduser',
        }
      ]
    })
  }

  async tongji(e: AMessage) {
     await axios.get(`${apiUrl}/userList`).then(response => {
        const obj = response.data;
        if (obj.code == 200) {
          const list = {}
          obj.data.forEach((el: any) => {
            if(el.plugin.includes(AppName)){
              list[el.bot] = list[el.bot] ? list[el.bot] + 1 : 1
              }
          })
          const botsname = Object.keys(list)
          let a = ''
          botsname.forEach((el: string) => {
            a += `\n${el}：${list[el]}人`
          })
          e.reply(`用户列表(机器人：数量)：${a}`)
        }
      })
    return false
  }


  async adduser(e: AMessage) {
    const botname = JSON.parse(fs.readFileSync(`./package.json`, 'utf-8'))
    const data = JSON.stringify({
      userid: e.user_id,
      nickname: e.user_name,
      plugin: AppName,
      bot: botname.name
    })
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${apiUrl}/adduser`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    }
    axios.request(config).catch(error => {
      console.log(error)
    })
  }
}