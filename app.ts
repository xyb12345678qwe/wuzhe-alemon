import readline from 'readline';
import { spawn } from 'child_process';
import { DirPath } from './config';
const loadingBar = '加载中...';
const welcomeMessage = '欢迎使用独立控制台！';
const promptMessage = '是否启动所有需要独立启动的功能？(是/否)';

console.log(loadingBar);

setTimeout(() => {
  console.log('');
  console.log(welcomeMessage);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(promptMessage, (answer) => {
    if (answer.toLowerCase() === '是') {
      startFeatures();
    } else {
      console.log('未启动任何功能。');
    }
    rl.close();
  });
}, 3000);

async function startFeatures() {
  try {
    const app = DirPath+ "/apps"
    const features = [ app + '/backupo/backup.js'];

    const processes = features.map((feature) => spawn('node', [feature]));

    processes.forEach((process, index) => {
      process.stdout.on('data', (data) => {
        console.log(data.toString());
      });

      process.on('error', (error) => {
        console.log(`启动${features[index]}时出错：`, error);
      });
    });
  } catch (error) {
    console.log('启动功能时出错：', error);
  }
}