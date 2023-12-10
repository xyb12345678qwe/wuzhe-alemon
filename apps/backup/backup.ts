import fs from 'fs/promises';
import path from 'path';
import moment from 'moment';
import cron from 'node-cron';
import { DirPath } from '../../api';
interface SourceFolder {
  folderPath: string;
  backupFolderPath: string;
  backupFolderName: string;
}
console.log(`备份功能启动成功`);

const sourceFolders: SourceFolder[] = [
  {
    folderPath: DirPath + '/resources/data/player',
    backupFolderPath:DirPath +  '/resources/data/backup',
    backupFolderName:"player"
  },
];
async function backupFolders(): Promise<void> {
  const timestamp = moment().format('YYYYMMDD_HHmmss');
  for (const sourceFolder of sourceFolders) {
    const backupFolderPathWithTimestamp = path.join(sourceFolder.backupFolderPath, sourceFolder.backupFolderName, timestamp);
    fs.mkdir(backupFolderPathWithTimestamp, { recursive: true });
    await copyFolder(sourceFolder.folderPath, backupFolderPathWithTimestamp);
  }
  console.log('备份完成！');
}

async function copyFolder(sourcePath: string, destinationPath: string): Promise<void> {
  const files = await fs.readdir(sourcePath);
  for (const file of files) {
    const sourceFilePath = path.join(sourcePath, file);
    const destinationFilePath = path.join(destinationPath, file);
    const fileStat = await fs.stat(sourceFilePath);
    if (fileStat.isDirectory()) {
      const folderName = path.basename(sourceFilePath);
      const destFolder = path.join(destinationPath, folderName);
      fs.mkdir(destFolder, { recursive: true });
      await copyFolder(sourceFilePath, destFolder);
    } else {
      await copyFile(sourceFilePath, destinationFilePath);
    }
  }
}

async function copyFile(sourcePath: string, destinationPath: string): Promise<void> {
  fs.copyFile(sourcePath, destinationPath);
}

// 监听控制台输入
process.stdin.on('data', async (data) => {
  const input = data.toString().trim().toLowerCase();

  if (input === '启动') {
    await backupFolders();
  } else {
    console.log('无效的命令');
  }
});
// 设置定时任务，每天凌晨执行备份
// 每分钟执行一次：* * * * *
// 每5分钟执行一次：*/5 * * * *
// 每小时执行一次：0 * * * *
// 每天午夜执行一次：0 0 * * *
// 每周日午夜执行一次：0 0 * * 0
// 每月的第一天午夜执行一次：0 0 1 * *
cron.schedule('0 0 * * *', backupFolders);