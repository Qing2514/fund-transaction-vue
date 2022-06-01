<template>
  <h-row name="flex">
    <h-col span="20">
      <h-card :bordered="false" dis-hover>
        <div class="current-work-day">
          <h-icon name="t-b-date" size="20"></h-icon>
          当前工作日：{{ workday.slice(0, 4) }} 年 {{ workday.slice(5, 7) }} 月
          {{ workday.slice(8, 10) }} 日
        </div>
        <div class="calendar">
          <h-calendar
            :monthViewNum="1"
            :current-year="year"
            :current-month="month"
            :cellHeight="50"
            :multiSelect="false"
            :dateCellRender="dateRender"
            ref="calendar"
          >
            <template slot="header">
              <h-date-picker
                type="month"
                v-model="date"
                @on-change="handleChange"
                :open="open"
              >
                <div class="date-input year" @click="togglePicker">
                  <span>{{ year + "年" }}</span>
                  <h-icon name="android-calendar"></h-icon>
                </div>
                <div class="date-input month" @click="togglePicker">
                  <span>{{ month + "月" }}</span>
                  <h-icon name="android-calendar"></h-icon>
                </div>
              </h-date-picker>
            </template>
          </h-calendar>
        </div>
        <h-form ref="initialize">
          <h-form-item>
            <h-button-group size="large" shape="circle" class="btn-group">
              <h-button type="error" icon="return" @click="rollback"
                ><span v-if="!backLoading">回滚</span>
                <span v-else>重算中...</span></h-button
              >
              <h-button type="success" @click="handleSubmit">
                <span v-if="!isLoading">更新到下一工作日</span>
                <span v-else>初始化中...</span>
                <h-icon name="android-time"></h-icon>
              </h-button>
            </h-button-group>
          </h-form-item>
        </h-form>
      </h-card>
    </h-col>
    <h-col span="4">
      <!--步骤条-->
      <stepbar v-if="refresh"></stepbar>
    </h-col>
  </h-row>
</template>

<script>
import core from "@hsui/core";
import stepbar from "../../components/stepbar.vue";
const dayjs = require("dayjs");
export default {
  components: {
    stepbar,
  },
  data() {
    return {
      open: false, // 日历左上角的选择框是否打开
      date: new Date(),
      isLoading: false,
      refresh: true,
      backLoading: false,
      checkLoading: false,
    };
  },
  computed: {
    workday() {
      return this.$store.state.workday;
    },
    day() {
      // 这里还没有设置工作日 后台传过来，然后显示
      return this.date.getDate();
    },
    month() {
      return this.date.getMonth() + 1;
    },
    year() {
      return this.date.getFullYear();
    },
  },
  mounted() {
    if (this.steps.stat[0] == 0) this.steps.stat[0] = 1; // 处理中状态
    // 刷新步骤条
    this.refreshStepBar();
  },
  destroyed() {
    // 如果没有处理完成，那么在切换页面时变回待处理状态
    if (this.steps.stat[0] == 1) this.steps.stat[0] = 0;
  },
  methods: {
    handleSubmit() {
      this.isLoading = true;
      this.postInit();
      // 日初始化完成
      if (this.steps.stat[0] == 1) this.steps.stat[0] = 2;
      // 刷新步骤条
      this.refreshStepBar();
    },
    togglePicker() {
      // 控制日历小窗口的开关
      this.open = !this.open;
    },
    handleChange() {
      this.open = false;
    },
    dateRender(h, data) {
      if (
        data &&
        dayjs(data.date).format("YYYY-MM-DD") == this.workday.slice(0, 10)
      ) {
        return h(
          "div",
          {
            class: { [`custom-style`]: true },
          },
          [data != null ? "" + data.date.getDate() : ""]
        );
      } else {
        return h("span", {}, [data != null ? "" + data.date.getDate() : ""]);
      }
    },
    refreshStepBar() {
      this.refresh = false;
      this.$nextTick(() => (this.refresh = true));
    },
    postInit() {
      core
        .fetch({
          method: "get",
          url: `/apiLiq/clearing/initializeDay/${this.$store.state.workday}/1`,
        })
        .then((res) => {
          if (res.code === 200) {
            this.isLoading = false;
            this.$store.commit("setWorkday", res.obj);
            this.$hMessage.success("初始化成功");
          }
        });
    },
    rollback() {
      this.backLoading = true;
      core
        .fetch({
          method: "get",
          url: `/apiLiq/clearing/initializeDay/${this.$store.state.workday}/-1`,
        })
        .then((res) => {
          if (res.code === 200) {
            this.backLoading = false;
            this.$store.commit("setWorkday", res.obj);
            this.$hMessage.success("回滚成功");
          }
        });
    },
  },
};
</script>
<style>
.current-work-day {
  margin-left: 50%;
  font-size: 150%;
}

form {
  text-align: center;
}

.calendar {
  margin-right: 10%;
  margin-left: 10%;
}

.date-input {
  display: inline-block;
  background: #5cb77b;
  font-size: 16px;
  color: #fff;
  padding: 5px 8px;
  border-radius: 3px;
  cursor: pointer;
}
.date-input.year {
  margin-left: 1.5%;
}
.date-input.month {
  margin-right: 1.5%;
}

.custom-style {
  position: relative;
  background: #5cb77b;
  color: #fff;
  width: 30px;
  height: 30px;
  border-radius: 15px;
  line-height: 30px;
}
</style>