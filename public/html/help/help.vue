<script>
Vue.createApp({
  setup: () => ({
    data: BOT_DATA
  })
}).mount('#app')
</script>

<template>
  <div id="app" class="help">
    <div style="height: 100px"></div>
    <div v-for="val of data" :key="val.group" class="cont-box">
      <div class="help-group">{{ val.group }}</div>
      <div class="help-table">
        <div class="tr">
          <div v-for="item in val.list" :key="item.title" class="td">
            <span :class="'help-icon help-icon-' + item.icon"></span>
            <strong class="help-title">{{ item.title }}</strong>
            <span class="help-desc">{{ item.desc }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="copyright">
      <span> WuzheGame @凡界武道 | 名字</span>
    </div>
    <div class="copyright">
      <span>框架</span>
      <span class="version">https://alemonjs.com/</span>
    </div>
  </div>
</template>
<head>
  <link rel="stylesheet" href="@/html/help/help.css">
</head>

<style>
.help {
  background: url('@/img/help/help.jpg');
}
.help-icon {
  background: url('@/img/help/icon.jpg') 0 0 no-repeat;
}
</style>
