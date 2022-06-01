<template>
  <div slot="demo">
    <h-card :bordered="false">
      <p slot="title">产品购买</p>
      <h-form
        ref="purchaseFormData"
        :model="purchaseFormData"
        :rules="ruleValidate"
        :label-width="80"
        cols="4"
        errorFocus
      >
        <h-form-item label="委托方式" prop="method" cols="2">
          <h-select
            v-model="purchaseFormData.method"
            setDefSelect
            placeholder="请选择委托方式"
          >
            <h-option
              v-for="(method, index) in methods"
              :key="index"
              :value="method"
            >
              {{ method }}
            </h-option>
          </h-select>
        </h-form-item>
        <h-form-item label="客户账号" prop="user_id" cols="2">
          <h-select
            v-model="purchaseFormData.user_id"
            placeholder="请选择客户"
            @on-change="displayUserInformation"
            remote
            remoteIcon="search"
            filterable
            :remote-method="remoteSearchUser"
          >
            <h-option
              v-for="user in searchResultUsers"
              :key="user.id"
              :value="user.id"
              :label="user.id.slice(-10)"
            >
              <span>{{ user.id.slice(-10) }}</span>
              <span
                style="
                  float: right;
                  color: #ccc;
                  position: absolute;
                  right: 15px;
                "
                >{{ user.name }}</span
              >
            </h-option>
          </h-select>
        </h-form-item>

        <h-form-item label="客户信息" cols="4">
          <h-table
            :columns="columns"
            :data="currentInformation"
            ref="userTable"
          ></h-table>
        </h-form-item>

        <h-form-item
          label=""
          :label-width="10"
          cols="4"
          class="business-information"
        >
          <header class="business-header">业务信息</header>
        </h-form-item>
        <h-form-item label="产品代码" prop="product_id" cols="4">
          <h-select
            v-model="purchaseFormData.product_id"
            placeholder="请选择产品代码"
            ref="product_id"
            :maxlength="6"
            remote
            remoteIcon="search"
            filterable
            :remote-method="remoteSearchProduct"
          >
            <h-option
              v-for="product in searchResultProducts"
              :key="product.id"
              :value="product.id"
              :label="product.id.slice(-10)"
            >
              <span>{{ product.id.slice(-10) }}</span>
              <span
                style="
                  float: right;
                  color: #ccc;
                  position: absolute;
                  right: 15px;
                "
                >{{ product.name }}</span
              >
            </h-option>
          </h-select>
        </h-form-item>
        <h-form-item label="银行卡" prop="card_id" cols="2">
          <h-select
            v-model="purchaseFormData.card_id"
            placeholder="请选择银行卡"
            setDefSelect
          >
            <h-option
              v-for="card in cards"
              :key="card.card_id"
              :value="card.card_id"
            >
              {{ card.card_id }}
            </h-option>
          </h-select>
        </h-form-item>
        <!-- 余额显示 -->
        <h-form-item label="可用余额" cols="2">
          <span style="font-size: large">{{ account }} 元</span>
        </h-form-item>
        <!-- 申购金额输入 -->
        <h-form-item label="申购金额" prop="amount" cols="4">
          <h-typefield
            v-model="purchaseFormData.amount"
            integerNum="8"
            suffixNum="2"
            placeholder="最低买入10.00元"
          ></h-typefield>
        </h-form-item>
        <h-form-item class="submit">
          <h-button type="primary" @click="handleSubmit('purchaseFormData')">
            提交
          </h-button>
          <!-- 提交成功后的弹窗 -->
          <h-msg-box
            v-model="isSuccess"
            :escClose="true"
            @on-ok="resetData"
            :beforeEscClose="resetData"
            @on-close="resetData"
          >
            <p slot="header" class="pop-up-header" v-if="postSuccess">
              <h-icon name="android-done"></h-icon>提交成功！
            </p>
            <p slot="header" class="pop-up-header" v-else>
              <h-icon name="android-done"></h-icon>提交失败！
            </p>
            <div class="pop-up-body">
              <h3 style="margin-bottom: 10px">订单信息如下：</h3>
              <h-table :columns="popUpTitle" size="large" :data="popUpBody">
              </h-table>
            </div>
          </h-msg-box>
        </h-form-item>
      </h-form>
    </h-card>
  </div>
</template>

<script>
import core from "@hsui/core";
const dayjs = require("dayjs");
import { USER_TYPE_ORM, MIN_MONEY } from "../../constant";
export default {
  data() {
    this.userTypeOrm = USER_TYPE_ORM;
    const validateAmount = (rule, value, callback) => {
      // 验证申购金额
      if (value == "") {
        callback(new Error("金额不能为空"));
      } else if (Number(value) > Number(this.account)) {
        callback(new Error("申购金额超过了当前银行卡可用余额"));
      } else if (Number(value) < Number(MIN_MONEY)) {
        callback(new Error("金额不能小于最小申购金额"));
      } else {
        callback();
      }
    };
    return {
      time: "",
      postSuccess: true,
      purchaseFormData: {
        // 表单要提交的项
        method: "", //交易方式
        user_id: "", // 客户账号
        product_id: "", // 产品id
        card_id: "", // 银行卡号
        amount: "", // 申购金额
        predictTime: `0`,
      },
      ruleValidate: {
        // 表单提交的验证规则
        method: [
          { required: true, message: "请选择委托方式", trigger: "blur" },
        ],
        amount: [
          {
            required: true,
            trigger: "blur",
            validator: validateAmount,
          },
        ],
        product_id: [
          {
            required: true,
            message: "请输入产品代码",
            trigger: "blur",
          },
        ],
        user_id: [
          { required: true, message: "请输入客户账号", trigger: "blur" },
        ],
        card_id: [
          {
            required: true,
            message: "请选择银行卡号",
            trigger: "blur",
          },
        ],
      },
      columns: [
        // 客户信息列表的表头
        {
          title: "客户姓名",
          key: "name",
        },
        {
          title: "客户类型",
          key: "type",
        },
        {
          title: "联系方式",
          key: "phone",
        },
        {
          title: "证件号码",
          key: "cid",
        },
      ],
      methods: [
        //委托方式
        "柜台委托",
        "电话委托",
        "传真委托",
      ],

      //远程搜索的用户
      searchResultUsers: [],
      currentInformation: [
        // 当前选中客户的信息 以及 当前选中基金的最小金额，便于调用
        {
          name: "---",
          type: "---",
          phone: "---",
          cid: "---",
        },
      ],
      searchResultProducts: [],
      cards: [],
      isSuccess: false, // 弹框是否显示
      popUpTitle: [
        { title: "选项", key: "item" },
        { title: "信息", key: "value" },
      ],
    };
  },
  computed: {
    account() {
      //当前选中银行卡余额;
      let card = this.cards.find(
        (card) => card.card_id === this.purchaseFormData.card_id
      );
      if (typeof card == "undefined") return "------";
      else return card.account;
    },
    popUpBody() {
      if (this.purchaseFormData.user_id) {
        return [
          { item: "交易时间：", value: this.time },
          { item: "预计确认时间：", value: this.purchaseFormData.predictTime },
          { item: "交易方式：", value: this.purchaseFormData.method },
          {
            item: "交易账号：",
            value: this.purchaseFormData.user_id.slice(-10),
          },
          {
            item: "产品代码：",
            value: this.purchaseFormData.product_id.slice(-10),
          },
          { item: "交易卡号：", value: this.purchaseFormData.card_id },
          { item: "申购金额：", value: this.purchaseFormData.amount },
        ];
      } else return [];
    },
  },
  methods: {
    handleSubmit(name) {
      // 提交表单
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.postRecord();
          this.isSuccess = valid; // 弹窗是否显示
        } else {
          this.$hMessage.error("提交失败，请检查申购信息!");
        }
      });
    },
    postRecord() {
      let current = this.getCurrentTime(); // 当前时间
      this.time = this.formatOf(current); // 时间格式化
      let predict = this.getPredictTime(current); // 预计确认时间
      this.purchaseFormData.predictTime = this.formatOf(predict);
      // 发送请求
      core
        .fetch({
          method: "post",
          url: `/apiPtrans/ptrans/addPtrans/${dayjs().format(
            "YYYY-MM-DD HH:mm:ss"
          )}`,
          data: { ...this.purchaseFormData },
        })
        .then((res) => {
          if (res.code === 200) {
            this.postSuccess = true;
            this.$hMessage.success("提交成功!");
          } else {
            this.postSuccess = false;
            this.$hMessage.error(`提交失败，${res.message}!`);
          }
        });
    },
    resetData() {
      //重置表单
      this.purchaseFormData = {};
      this.$refs.userTable.handleModifyData(0, {
        name: "---",
        type: "---",
        phone: "---",
        cid: "---",
      });
      this.$router.go(0);
    },
    formatOf(time) {
      return `${time.year}-${time.month}-${time.day} ${time.hours}:${time.minutes}:${time.seconds}`;
    },
    getCurrentTime() {
      let nowDate = new Date();
      const date = {
        year: nowDate.getFullYear(),
        month: nowDate.getMonth() + 1,
        day: nowDate.getDate(),
        hours: nowDate.getHours(),
        minutes: nowDate.getMinutes(),
        seconds: nowDate.getSeconds(),
        week: nowDate.getDay(),
      };
      date.hours = date.hours < 10 ? `0${date.hours}` : `${date.hours}`;
      date.minutes = date.minutes < 10 ? `0${date.minutes}` : `${date.minutes}`;
      date.seconds = date.seconds < 10 ? `0${date.seconds}` : `${date.seconds}`;
      return date;
    },
    getPredictTime(currentTime) {
      let predict = { ...currentTime };
      predict.hours = `09`;
      predict.minutes = `30`;
      predict.seconds = `00`;
      for (let i = 0; i < 2; ++i) {
        // T + 2
        do {
          this.getNextDay(predict);
        } while (!this.isWeekDay(predict));
      }
      return predict;
    },
    isWeekDay({ year, month, day, week }) {
      return week != 0 && week != 6;
    },
    getNextDay(date) {
      let days = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      date.day += 1;
      date.week = (date.week + 1) % 7;
      if (days[date.month - 1] + 1 == date.day) {
        date.month += 1;
        date.day = 1;
      }
      if (date.month > 12) {
        date.year += 1;
        date.month = 1;
      }
    },

    displayUserInformation(value) {
      // 选中账号后展示客户信息
      if (value != "") {
        let currentUser = this.searchResultUsers.find(
          (user) => user.id === value
        );
        //银行卡
        core
          .fetch({
            method: "get",
            url: `/apiBusiness/card/getAllCard`,
            data: {
              user_id: value,
            },
          })
          .then((res) => {
            this.cards = res.obj;
          });

        this.$refs.userTable.handleModifyData(0, currentUser);
      }
    },
    remoteSearchUser(query) {
      //长度大于8时发起请求
      // if (query !== "" && query.length >= 8) {
      if (query !== "") {
        this.isLoading = true;
        setTimeout(() => {
          core
            .fetch({
              method: "post",
              url: "/apiUser/user/findByIdBubble",
              data: { id: query },
            })
            .then((res) => {
              const { code, obj } = res;
              if (code === 200) {
                this.isLoading = false;
                this.searchResultUsers = obj;
              }
            });
        }, 200);
      } else {
        this.searchResultUsers = [];
      }
    },
    remoteSearchProduct(query) {
      if (query !== "") {
        this.isLoading = true;
        setTimeout(() => {
          core
            .fetch({
              method: "get",
              url: `/apiProduct/product/findProductByIdBubble/${query}`,
            })
            .then((res) => {
              const { code, obj } = res;
              if (code === 200) {
                this.isLoading = false;
                this.searchResultProducts = obj;
              }
            });
        }, 200);
      } else {
        this.searchResultProducts = [];
      }
    },
  },
};
</script>


<style scoped>
.box {
  position: relative;
  width: 800px;
  height: 300px;
  margin: 100px auto;
}

.business-header {
  font-size: 110%;
  font-weight: bold;
}

.submit {
  width: 100%;
  text-align: center;
}

.user-information {
  background-color: grey;
}

/* 弹出框的样式 */
.pop-up-header {
  color: #1cb77b;
  text-align: center;
}
.pop-up-body p {
  margin-left: auto;
  font-size: 125%;
}
</style>