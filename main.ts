import {refresh_all_cache} from './api.js'
import { createApp} from 'alemonjs'
import chalk from 'chalk';
import * as apps from './apps.js'
createApp(import.meta.url)
  .use(apps)
  .mount()
  
console.log(chalk.cyan('------------------------------------'));
console.log(`~\t${chalk.yellow('武者文游')}\t~`);
console.log(`~\t${chalk.yellow('作者：名字')}\t~`);
console.log(chalk.cyan('------------------------------------'));

await refresh_all_cache()