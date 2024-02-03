# wuzhe-alemon

### Introduction

This is a plugin for the wuzhe-alemon.

### English Documentation

[>>>Enghish document<<<](./README/Enghish.md)

### Visit Count

<br><img src="https://count.getloli.com/get/@:xyb12345678qwe?theme=rule33" /><br>

### Installation Guide

To install, follow these steps:

```
git clone https://gitee.com/xyb12345678qwe/wuzhe-plugn-alemon.git

git clone https://github.com/xyb12345678qwe/wuzhe-alemon.git

npm i js-yaml node-cron

```

### Usage Instructions

Please configure the MySQL database first. Create a file named alemon.env in the root directory and configure the MySQL settings. After configuring, import the provided SQL file.

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

Note: The MySQL version should be 8.

Then create a file named alemon.login.ts and fill in the following information:

```
import { ALoginOptions } from 'alemonjs'
export default ALoginOptions({
  test: {
    //配置信息
  }
})

```

For how to configure the information, please refer to the alemonjs documentation.

After configuring, use npm run dev + the name in the configuration information to start the development server.
SQL file:
![输入图片说明](../image2.png)

After installing the plugin, enter`#武者帮助`,to the bot to view available functionalities.

### Community Group

QQ Group: 869400987

### Author Information

Author: MingZi
Personal Blog: [Click here to visit](https://boke.mzswebs.top/)

### Additional Information

This plugin is not allowed to be used for profit.

If you feel there are insufficient features, please provide feedback to the author.

The author is a student and updates may be slow.

If you are interested in voluntary development, please contact the author.
