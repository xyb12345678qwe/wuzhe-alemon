import { defineAfloat } from 'afloat'
export default defineAfloat({
  nodemon: {
    watch: ['alemon.*.{ts,js}', 'src', 'apps']
    // env 自动识别 .env文件
  }
})
