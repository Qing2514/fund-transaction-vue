import Vue from 'vue';
import hCore, { store } from '@hsui/core';
import './reset.css';
import * as echarts from 'echarts';
import h_ui from 'h_ui';
import 'h_ui/dist/h_ui.min.css';
import axios from 'axios';

Vue.use(h_ui);
Vue.prototype.$echarts = echarts;
Vue.prototype.$axios = axios;
axios.defaults.baseURL = ''

const StepsInformation = Vue.extend({
  data() {
    return {
      stat: [0,0,0],
      cnList: ["待进行", "进行中", "已完成"],
      egList: ["wait", "process", "finish"]
    }
  }
})
Vue.prototype.steps = new StepsInformation();

const app = hCore({
  extraModelOptions: {
    store
  }
});

app.start();
