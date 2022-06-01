<template>
  <div slot="demo">
    <h-card :bordered="false">
      <p slot="title">产品赎回</p>
      <h-form
        ref="redemptionForm"
        :model="redemptionForm"
        :rules="ruleValidate"
        :label-width="100"
        cols="4"
        errorFocus
      >
        <h-form-item label="委托方式" prop="method" cols="2">
          <h-select
            v-model="redemptionForm.method"
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
            v-model="redemptionForm.user_id"
            placeholder="请选择客户"
            @on-change="displayCustomerInformation"
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
            :columns="customerInformationTitle"
            :data="[currentUser]"
            ref="customerTable"
          >
          </h-table>
        </h-form-item>

        <h-form-item
          label=""
          :label-width="10"
          cols="4"
          class="business-information"
        >
          <header class="business-header">业务信息</header>
        </h-form-item>
        <h-form-item label="持有产品代码" prop="product_id" cols="4">
          <h-select
            v-model="redemptionForm.product_id"
            placeholder="请选择持有产品"
            ref="product_id"
            :maxlength="6"
            filterable
          >
            <h-option
              v-for="product in currentHoldProducts"
              :key="product.product_id"
              :value="product.product_id"
              :label="product.product_id"
            >
              <span>{{ product.product_id }}</span>
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
            v-model="redemptionForm.card_id"
            placeholder="请选择银行卡"
            ref="card_id"
            setDefSelect
            filterable
          >
            <h-option
              v-for="card in currentCards"
              :key="card.card_id"
              :value="card.card_id"
            >
              {{ card.card_id }}
            </h-option>
          </h-select>
        </h-form-item>
        <!-- 可用份额显示 -->
        <h-form-item label="持有份额" cols="2">
          <span style="font-size: large">{{ availableShare }}</span>
        </h-form-item>
        <!-- 赎回份额输入 -->
        <h-form-item label="赎回份额" prop="count" cols="4">
          <h-typefield
            v-model="redemptionForm.count"
            integerNum="8"
            suffixNum="2"
            type="money"
          ></h-typefield>
        </h-form-item>
        <h-form-item class="submit" cols="2">
          <h-button type="primary" @click="handleSubmit('redemptionForm')">
            <span>提交</span>
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
        <h-form-item class="reset" cols="2">
          <h-button type="ghost" @click="resetInterface">
            <span>重置</span>
          </h-button>
        </h-form-item>
      </h-form>
    </h-card>
  </div>
</template>

<script>
import core from "@hsui/core";
const dayjs = require("dayjs");
export default {
  data() {
    const validateShare = (rule, value, callback) => {
      // 验证赎回份额
      if (value == "") {
        callback(new Error("份额不能为空"));
      } else if (Number(value) == 0) {
        callback(new Error("份额不能为零"));
      } else if (Number(value) > Number(this.availableShare)) {
        callback(new Error("申购金额超过了当前银行卡可用份额"));
      } else {
        callback();
      }
    };
    return {
      postSuccess: true,
      redemptionForm: {
        // 表单要提交的项
        time: "", // 交易时间
        method: "", //交易方式
        user_id: "", // 客户账号
        product_id: "", // 产品id
        card_id: "", // 银行卡号
        count: "", // 赎回份额
        predictTime: `0`,
      },
      ruleValidate: {
        // 表单提交的验证规则
        method: [
          { required: true, message: "请选择委托方式", trigger: "blur" },
        ],
        count: [{ required: true, trigger: "blur", validator: validateShare }],
        product_id: [
          { required: true, message: "请选择持有的产品", trigger: "blur" },
        ],
        user_id: [
          { required: true, message: "请输入客户账号", trigger: "blur" },
        ],
        card_id: [
          { required: true, message: "请选择银行卡号", trigger: "blur" },
        ],
      },

      isLoading: false,
      formItem: {
        // 表单中的元素格式
        input: "",
        select: "",
        radio: "male",
        checkbox: [],
        switch: true,
        date: "",
        time: "",
        slider: [20, 50],
        textarea: "",
      },
      customerInformationTitle: [
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
      users: [],
      searchResultUsers: [], // 远程搜索客户展示列表
      ownProducts: [], // 持有产品列表
      isSuccess: false, // 弹框是否显示
      popUpTitle: [
        // 弹框表头
        { title: "选项", key: "item" },
        { title: "信息", key: "value" },
      ],
      backLoading: false,
      currentUserProducts: [], // 当前客户的产品列表
    };
  },
  computed: {
    currentUser() {
      // 选中的客户
      let currentCustomer = this.searchResultUsers.find(
        (customer) => customer.id == this.redemptionForm.user_id
      );
      if (typeof currentCustomer == "undefined")
        return {
          id: "---",
          name: "---",
          type: "---",
          phone: "---",
          cid: "---",
        };
      else return currentCustomer;
    },
    currentHoldProducts() {
      // 当前客户所持有的所有产品
      if (this.currentUser.id == "---") return [];
      else return this.ownProducts;
    },
    currentCards() {
      // 当前选择的产品可赎回的银行卡
      let currentProduct = this.currentUserProducts;
      let bankCards = [];
      for (var i = 0; i < currentProduct.length; i++) {
        if (currentProduct[i].product_id == this.redemptionForm.product_id) {
          bankCards.push({
            card_id: currentProduct[i].card_id,
            value: currentProduct[i].value,
          });
        }
      }
      // let currentProduct = this.currentHoldProducts.find(
      //   (product) => product.product_id == this.redemptionForm.product_id
      // );
      // if (typeof currentProduct == "undefined") return [];
      // else return bankCards;
      return bankCards;
    },
    availableShare() {
      // 当前选择的银行卡中该产品的可用份额
      let currentCard = this.currentCards.find(
        (card) => card.card_id == this.redemptionForm.card_id
      );
      if (typeof currentCard == "undefined") return "------";
      else return currentCard.value;
    },
    popUpBody() {
      // 弹窗信息
      if (this.redemptionForm.user_id) {
        return [
          { item: "交易时间：", value: this.time },
          { item: "预计确认时间：", value: this.redemptionForm.predictTime },
          { item: "交易方式：", value: this.redemptionForm.method },
          { item: "交易账号：", value: this.redemptionForm.user_id.slice(-10) },
          {
            item: "产品代码：",
            value: this.redemptionForm.product_id.slice(-10),
          },
          { item: "交易卡号：", value: this.redemptionForm.card_id },
          { item: "赎回份额：", value: this.redemptionForm.count },
        ];
      } else return [];
    },
  },
  methods: {
    handleSubmit(name) {
      // let currentProduct = this.currentHoldProducts.find(
      //   (product) => product.product_id == this.redemptionForm.product_id
      // );
      // this.redemptionForm.name = currentProduct.name;
      // 提交
      this.$refs[name].validate((valid) => {
        this.isSuccess = valid; // 弹窗是否显示
        if (valid) {
          this.postRecord();
        } else {
          this.$hMessage.error("提交失败，请检查赎回信息!");
        }
      });
    },
    postRecord() {
      let current = this.getCurrentTime(); // 当前时间
      this.time = this.formatOf(current); // 时间格式化
      let predict = this.getPredictTime(current); // 预计确认时间
      this.redemptionForm.predictTime = this.formatOf(predict);
      // 发送请求
      core
        .fetch({
          method: "post",
          url: `/apiRtrans/rtrans/addRtrans/${dayjs().format(
            "YYYY-MM-DD HH:mm:ss"
          )}`,
          data: { ...this.redemptionForm },
        })
        .then((res) => {
          if (res.code === 200) {
            this.$hMessage.success("提交成功!");
            this.postSuccess = true;
          } else {
            this.postSuccess = false;
            this.$hMessage.error(`提交失败，${res.message}!`);
          }
        });
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
    displayCustomerInformation(value) {
      // 选中账号后展示客户信息
      let currentUser = this.searchResultUsers.find(
        (customer) => customer.id === this.redemptionForm.user_id
      );
      this.$set(this.currentUser, currentUser);
      this.$refs.customerTable.handleModifyData(0, currentUser);
      //得到产品信息
      this.getUniqueProduct(value);
      core
        .fetch({
          method: "get",
          url: `/apiBusiness/share/findByAll`,
          data: {
            user_id: value,
          },
        })
        .then((res) => {
          const { obj } = res;
          if (obj.length === 0) {
            this.$hMessage.warning("该用户没有产品！");
          }
          this.currentUserProducts = obj;
        });
    },
    getUniqueProduct(id) {
      core
        .fetch({
          method: "post",
          url: `/apiBusiness/share/findProductIdByUserId`,
          data: {
            user_id: id,
          },
        })
        .then((res) => {
          const { obj } = res;
          for (var i = 0; i < obj.length; i++) {
            this.ownProducts.push({
              product_id: obj[i].product_id,
              name: obj[i].name,
            });
          }
        });
    },
    remoteSearchUser(query) {
      //大于8位
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
    resetData() {
      //重置表单
      this.$router.go(0);
    },
    resetInterface() {
      this.redemptionForm.transNumber = "";
      this.redemptionForm.time = "";
      this.redemptionForm.method = "";
      this.redemptionForm.user_id = "";
      this.redemptionForm.product_id = "";
      this.redemptionForm.card_id = "";
      this.redemptionForm.count = "";
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
  text-align: right;
}

.reset {
  text-align: left;
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