import { createApp} from 'alemonjs'
import chalk from 'chalk';
import * as apps from './apps.js'
createApp(import.meta.url)
  .use(apps)
  .mount()
  .on('GUILD_MEMBERS', e=> {
    if(e.typing == 'CREATE'){
      if(e.platform == "ntqq"){
          e.reply(e.segment(e.user_id), `${e.user_name}[${e.user_id}]加入${e.guild_name}`)
        }
        console.log('成员', e.user_name, '加入')
    }else if(e.tying == "DELETE"){
      if(e.platform == "ntqq"){
        e.reply(`${e.user_name}[${e.user_id}]退出${e.guild_name}`)
      }
    }
  })
  
console.log(chalk.cyan('------------------------------------'));
console.log(`~\t${chalk.yellow('武者文游')}\t~`);
console.log(`~\t${chalk.yellow('作者：名字')}\t~`);
console.log(chalk.cyan('------------------------------------'));

 