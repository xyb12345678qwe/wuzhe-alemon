import Redis from "ioredis";
import { APlugin ,AMessage,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject,oImages,axios,fetchData,apiUrl2,fs,DirPath} 
    from "../../api";
import {getLingqi,getTizhi} from '../../model/gameapi'
// const redis = new Redis({
//     port: 6379,          
//     host: '127.0.0.1',  
//     password: '', 
// });

const playerdata = {}; 

export class 测试 extends APlugin  {
    constructor() {
        super({
            dsc: '基础模块',
            event: 'message',
            /** 优先级，数字越小等级越高 */
            priority: 600,
            rule: [
                // {
                //     reg: /^(#|\/)?定时器.*$/,
                //     fnc: 'dingshiqi',
                // },
                {
                    reg: /^(#|\/)?一言api$/,
                    fnc: 'yiyan',
                },
                {
                    reg: /^(#|\/)?测试$/,
                    fnc: 'y',
                },
               
            ],
            });
        }
    async dingshiqi(e:AMessage){
        const usr_qq = e.user_id;
        const name = e.msg.replace(/(\/|#)?定时器/, "").trim();
        playerdata[usr_qq] = e;
        const jishi = setTimeout(async () => {
            console.log(usr_qq);
            console.log(playerdata[usr_qq]);
            playerdata[usr_qq].reply(`计时完成`)
            e.reply(`${playerdata[usr_qq].segment.at(usr_qq)}计时完成`)
            clearTimeout(jishi)
            delete playerdata[usr_qq];
          }, Number(name)*1000)
        e.reply(`${e}`)
        playerdata[usr_qq].reply(`开始计时${name}`)
        e.reply(`开始计时${name}`)
    }
    async yiyan(e:AMessage){
        // await redis.set("1",JSON.stringify({1:1}))
        // await redis.get("1")
        await fetchData(apiUrl2)
        .then((data) => {
            console.log(data);
            e.reply(data)
        })}
   async y(e:AMessage){
    let x = axios.post('127.0.0.1:3000/plugin/start/1',{e})
   }
    }

    