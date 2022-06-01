<template>
  <div class="user-detail">
    <div class="detail-items">
      <h2>客户详情</h2>
      <h-row style="padding: 10px 0">
        <h-col span="8">客户姓名：{{ data.name }}</h-col>
        <h-col span="8">客户性别：{{ data.sex }}</h-col>
        <h-col span="8">客户年龄：{{ data.age }}</h-col>
      </h-row>

      <h-row style="padding: 10px 0">
        <h-col span="8">证件类型：{{ data.ctype }}</h-col>
        <h-col span="16">证件号：{{ data.cid }}</h-col>
      </h-row>
      <h-row style="padding: 10px 0">
        <h-col span="8">客户类型：{{ data.type }}</h-col>
      </h-row>
      <h-row style="padding: 10px 0">
        <h-col span="3">银行卡号：</h-col>
        <h-col span="13"
          ><div v-for="card in bankCard" :key="card.card_id">
            <h-poptip
              confirm
              title="您确认要解绑吗？"
              @on-ok="handleDeleteCard(card.card_id)"
            >
              <h-button type="text" icon="delete"></h-button>
            </h-poptip>
            {{ card.card_id }}-----{{ card.account }}元
            <!-- 换行 -->
            <br />
          </div>
        </h-col>
        <h-button
          type="primary"
          shape="circle"
          @click="addBankCard"
          icon="add"
          size="small"
        ></h-button>
        <h-button type="success" shape="circle" @click="recharge"
          ><h-icon name="social-yen"></h-icon>充值</h-button
        >
      </h-row>
      <h-row style="padding: 10px 0">
        <h-col span="8">联系方式：{{ data.phone }}</h-col>
      </h-row>
      <ul>
        <li>客户职业：{{ data.job }}</li>
        <li>客户地址：{{ data.address }}</li>
        <li>
          风险等级：{{ data.security }}
          <router-link :to="{ name: 'user-riskAssess', query: { user: data } }">
            点我去评估
          </router-link>
        </li>
      </ul>
    </div>
    <div id="lineEchart" class="line-echart"></div>
    <!-- 充值 box -->
    <h-msg-box
      v-model="rechargeVisible"
      :escClose="true"
      title="充值"
      @on-ok="rechargeOk"
    >
      <h-form
        ref="rechargeForm"
        :model="rechargeFormData"
        :rules="rechargeValidate"
        :label-width="160"
      >
        <h-form-item label="选择银行卡：" prop="card_id">
          <h-icon name="card"></h-icon>
          <h-select
            v-model="rechargeFormData.card_id"
            placeholder="请选择银行卡"
            style="width: 200px"
            setDefSelect
          >
            <h-option
              v-for="card in bankCard"
              :key="card.card_id"
              :value="card.card_id"
            >
              {{ card.card_id }}
            </h-option>
          </h-select>
        </h-form-item>
        <h-form-item label="充值金额：" prop="amount">
          <h-icon name="social-yen"></h-icon>
          <h-input
            v-model="rechargeFormData.amount"
            placeholder="请输入充值金额"
            style="width: 200px"
          >
          </h-input>
        </h-form-item>
      </h-form>
    </h-msg-box>
    <!-- 添加银行卡 box -->
    <h-msg-box
      v-model="addCardVisible"
      :escClose="true"
      title="添加银行卡"
      @on-ok="addCardOk"
      :beforeEscClose="addMsgBoxBeforeEscClose"
      @on-close="addMsgBoxClose"
    >
      <h-form
        ref="addCardForm"
        :model="addCardData"
        :rules="addCardValidate"
        :label-width="160"
      >
        <h-form-item label="银行卡号：" prop="card_id">
          <h-icon name="card"></h-icon>
          <h-input
            v-model="addCardData.card_id"
            placeholder="请输入银行卡号"
            style="width: 200px"
          >
          </h-input>
        </h-form-item>
        <h-form-item prop="repeatCard">
          <h-icon name="android-checkbox-outline"></h-icon>
          <h-input
            v-model="addCardData.repeatCard"
            placeholder="请再次输入银行卡号"
            style="width: 200px"
          >
          </h-input>
        </h-form-item>
      </h-form>
    </h-msg-box>
  </div>
</template>

<script>
import core from "@hsui/core";
import {
  USER_TYPE_ORM,
  USER_SECURITY_ORM,
  USER_GENDER_ORM,
  USER_C_TYPE_ORM,
} from "../../constant";

export default {
  data() {
    this.userTypeOrm = USER_TYPE_ORM;
    this.userSecurityOrm = USER_SECURITY_ORM;
    this.userGenderOrm = USER_GENDER_ORM;
    this.userCtypeOrm = USER_C_TYPE_ORM;
    return {
      rechargeFormData: {},
      addCardData: {},
      rechargeVisible: false,
      addCardVisible: false,
      rechargeValidate: {
        card_id: [{ required: true, message: "请选择银行卡", trigger: "blur" }],
        amount: [
          {
            required: true,
            pattern: /^(([1-9]\d{0,9}))(\.\d{1,2})?$/,
            message: "请输入正确的充值金额",
            trigger: "blur",
          },
        ],
      },
      addCardValidate: {
        card_id: [
          { required: true, message: "请输入银行卡号", trigger: "blur" },
        ],
        repeatCard: [
          { message: "请再次输入银行卡号", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if (value !== this.addCardData.card_id) {
                callback(new Error("两次输入的银行卡号不一致"));
              } else {
                callback();
              }
            },
          },
        ],
      },
      data: {},
      bankCard: [],
      share: [],
    };
  },
  created() {
    const { params: { id } = {} } = this.$route;
    // 获取用户信息
    core
      .fetch({
        method: "post",
        url: `/apiUser/user/findByIdBubble/`,
        data: {
          id,
        },
      })
      .then((res) => {
        this.data = {
          ...this.data,
          ...res.obj[0],
        };
      });
    this.getAllCard();
    this.getAllShare();
  },
  mounted() {
    this.drawLineEchart();
  },
  methods: {
    getAllCard() {
      //银行卡信息
      core
        .fetch({
          method: "get",
          url: `/apiBusiness/card/getAllCard`,
          data: {
            user_id: this.$route.params.id,
          },
        })
        .then((res) => {
          this.bankCard = res.obj;
        });
    },
    getAllShare() {
      //份额信息
      core
        .fetch({
          method: "post",
          url: `/apiBusiness/share/findProductIdByUserId`,
          data: {
            user_id: this.$route.params.id,
          },
        })
        .then((res) => {
          const { obj } = res;
          this.share = obj.map((item) => {
            return {
              name: item["name"],
              value: item["value"],
            };
          });
          this.drawLineEchart();
        });
    },
    drawLineEchart() {
      // 基于准备好的dom，初始化echarts实例
      const echart = this.$echarts.init(document.getElementById("lineEchart"));

      // 指定图表的配置项和数据
      const option = {
        title: {
          text: "持有分析",
        },
        tooltip: {
          trigger: "item",
        },
        legend: {
          top: "10%",
          left: "center",
        },
        series: [
          {
            name: "份额",
            type: "pie",
            top: "15%",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              show: false,
              position: "center",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: "40",
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: false,
            },
            data: this.share,
          },
        ],
      };

      // 使用刚指定的配置项和数据显示图表。
      echart.setOption(option);
    },
    recharge() {
      this.rechargeVisible = true;
    },
    rechargeOk() {
      this.$refs["rechargeForm"].validate((valid) => {
        if (valid) {
          this.postRecharge();
        } else {
          this.$hMessage.error("表单验证失败!");
          return;
        }
      });
    },
    postRecharge() {
      this.$axios
        .put("/apiBusiness/card/topUp", {
          ...this.rechargeFormData,
          user_id: this.$route.params.id,
        })
        .then((res) => {
          if (res.status === 200) {
            this.$hMessage.success("充值成功");
            this.rechargeVisible = false;
            this.rechargeFormData["amount"] = "";
            this.getAllCard();
          } else {
            this.$hMessage.error("充值失败");
          }
          this.rechargeVisible = false;
        });
    },
    addBankCard() {
      this.addCardVisible = true;
    },
    addCardOk() {
      this.$refs["addCardForm"].validate((valid) => {
        if (valid) {
          this.postBankCard();
        } else {
          this.$hMessage.error("表单验证失败!");
          return;
        }
      });
    },
    postBankCard() {
      core
        .fetch({
          method: "post",
          url: "/apiBusiness/card/bind",
          data: {
            user_id: this.$route.params.id,
            card_id: this.addCardData.card_id,
          },
        })
        .then((res) => {
          const { code } = res;
          if (code === 200) {
            this.getAllCard();
            this.$hMessage.success("添加成功");
          } else {
            this.$$hMessage.error("添加失败");
          }
        });
    },
    handleDeleteCard(card_id) {
      const { params: { id } = {} } = this.$route;
      this.$axios
        .delete(`/apiBusiness/card/unbind`, {
          params: {
            user_id: id,
            card_id: card_id,
          },
        })
        .then((res) => {
          const { status } = res;
          if (status === 200) {
            this.getAllCard();
            this.$hMessage.success("解绑成功");
          } else {
            this.$$hMessage.error("解绑失败");
          }
        });
    },
    addMsgBoxBeforeEscClose() {
      this.addCardData = {};
    },
    addMsgBoxClose() {
      this.addCardData = {};
    },
  },
};
</script>

<style lang="less" scoped>
.user-detail {
  display: flex;
  justify-content: space-evenly;

  .detail-items {
    padding: 30px;
    width: 50%;
  }

  h2 {
    font-size: 20px;
    margin-bottom: 24px;
  }

  ul {
    margin-bottom: 24px;
  }

  li {
    line-height: 40px;
  }
}

.line-echart {
  width: 30vw;
  height: 50vh;
  margin-top: 30px;
}
</style>
