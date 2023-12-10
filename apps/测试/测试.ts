import Redis from "ioredis";
import { plugin,AMessage,existplayer,Read_player,Write_player,Write_playerData,getlingqi,isNotNull,pic ,findIndexByName,Strand,getNonZeroKeys,startstatus,stopstatus,gettupo,getstring,checkZeroValue,checkAllZeroValues,
    checkNameExists,player_zhanli,Add_bag_thing, player_zhandou,determineWinner,getB_qq,createPlayerObject,_item,Read_json_path,oImages,getidlist,Read_player2,allzongmen,puppeteer,axios,fetchData,apiUrl2,fs,DirPath} 
    from "../../api";
const redis = new Redis({
    port: 6379,          
    host: '127.0.0.1',  
    password: '', 
});

const playerdata = {}; 

export class 测试 extends plugin {
    constructor() {
        super({
            /** 功能名称 */
            name: '测试',
            /** 功能描述 */
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
   
    }

    