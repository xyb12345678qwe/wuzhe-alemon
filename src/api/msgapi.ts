import { AEvent, urlHelpCache } from "../../api"

/**
 * 帮助图发送
 * @param e
 * @param name 缓存名
 * @param data 数据
 * @returns
 */
export async function postHelp(e: AEvent, name: string,data:any) {
    await e.reply(
      await urlHelpCache(name,data).catch((err: any) => {
        console.error(err)
        return '图片缓存错误'
      })
    )
    return false
}