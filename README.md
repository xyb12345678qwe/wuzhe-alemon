# 武者文游-alemon

### 介绍

这是一个武者文游的插件

### Enghish document

[>>>Enghish document<<<](./README/Enghish.md)

### 访问量

<br><img src="https://count.getloli.com/get/@:xyb12345678qwe?theme=rule33" /><br>

### 安装教程

输入命令:<br>  
在机器人根目录输入以下命令

```
git clone https://gitee.com/xyb12345678qwe/wuzhe-plugn-alemon.git


npm i js-yaml node-cron

```

### 使用说明

请先配置数据库mysql,先在跟目录创建一个alemon.env文件,里配置mysql各项数据,配置完后导入提供的sql文件

```

ALEMONJS_REDIS_HOST = 'localhost'
ALEMONJS_REDIS_PORT = '6379'
ALEMONJS_REDIS_PASSWORD = ''
ALEMONJS_REDIS_DB = '3'
ALEMONJS_MYSQL_DATABASE = 'wuzhe' //数据库名
ALEMONJS_MYSQL_USER = 'wuzhe' //数据库用户名
ALEMONJS_MYSQL_PASSWORD = '12345678Qwe' //数据库密码
ALEMONJS_MYSQL_HOST = '' //ip
ALEMONJS_MYSQL_PROT = ''   //端口

```

注:mysql版本为8

然后创建一个alemon.login.ts文件，里面填写

```
import { ALoginOptions } from 'alemonjs'
export default ALoginOptions({
  test: {
    //配置信息
  }
})

```

信息如何配置请看 [alemonjs](https://alemonjs.com/);

配置完后使用 `npm run dev + 配置信息里面的名`
sql文件:
![输入图片说明](image2.png)

请安装插件后对机器人输入`#武者帮助`，查看可用功能

### 交流群

QQ群：869400987

### 作者相关

作者: 名字
个人博客: [戳我前往](https://boke.mzswebs.top/)

### 额外说明

本插件禁止用于盈利

觉得功能少的可以反馈给作者~

作者一个人写这个插件，且作者是学生，更新会比较慢

有想来自愿开发的可以来找作者

```

```
