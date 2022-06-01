<template>
  <div>
    <div class="content">
      <!-- 表格操作 -->
      <div class="content-left">
        <div class="user-search">
          <div class="search-content">
            <h-select
              placeholder="请选择客户"
              @on-change="getCertainUser"
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
          </div>
        </div>
        <!-- 表格 -->
        <h-table
          :loading="userLoading"
          :columns="userColumns"
          :highlight-row="true"
          :data="userList"
          @on-current-change="handleCurrentChange"
        ></h-table>
        <!-- 分页 -->
        <div v-show="pagination.total > 0" class="pagination-wrap">
          <h-page v-bind="pagination" @on-change="changePagination"></h-page>
        </div>
      </div>
      <div class="content-right">
        <div class="detail-content shadow">
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
                <br /></div
            ></h-col>
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
            <h-col span="10">客户职业：{{ data.job }}</h-col>
          </h-row>
          <ul>
            <li>客户地址：{{ data.address }}</li>
            <li>风险等级：{{ data.security }}</li>
          </ul>
          <div id="lineEchart" class="line-echart"></div>
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
      </div>
    </div>
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
      data: {},
      addCardData: {},
      addCardVisible: false,
      rechargeFormData: {},
      userLoading: true,
      rechargeVisible: false,
      rechargeValidate: {
        rechargeCard: [
          { required: true, message: "请选择银行卡", trigger: "blur" },
        ],
        rechargeMoney: [
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
      userColumns: [
        {
          title: "客户账号",
          key: "id",
          render: (h, { row: { id } }) => h("span", {}, id.slice(-10)),
        },
        {
          title: "客户姓名",
          key: "name",
        },
        {
          title: "客户类型",
          key: "userType",
          render: (h, { row: { type } }) => {
            return h("span", {}, type);
          },
        },
        {
          title: "风险等级",
          key: "userSecurity",
          render: (h, { row: { security } }) => {
            return h("span", {}, security);
          },
        },
        {
          title: "联系方式",
          key: "phone",
        },
      ],
      userList: [],
      pagination: {
        current: 1,
        "page-size": 10,
        total: 0,
      },
      id: "",
      bankCard: [],
      share: [],
      echart: null,
      searchResultUsers: [],
    };
  },
  created() {
    // 获取产品列表;
    this.getUserList();
  },
  mounted() {
    this.echart = this.$echarts.init(document.getElementById("lineEchart"));
    this.getDetail();
  },
  computed: {
    index() {
      return (this.pagination.current - 1) * this.pagination["page-size"];
    },
  },
  methods: {
    getCertainUser(id) {
      this.userLoading = true;
      core
        .fetch({
          method: "post",
          url: `/apiUser/user/findByIdBubble/`,
          data: {
            id,
          },
        })
        .then((res) => {
          const { code, obj } = res;
          if (code === 200) {
            this.userLoading = false;
            this.userList = obj;
          }
        });
    },
    remoteSearchUser(query) {
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
    getUserList() {
      core
        .fetch({
          method: "get",
          url: `/apiUser/user/findAll/${this.index}/10`,
        })
        .then((res) => {
          const { code, obj } = res;
          if (code === 200) {
            this.userLoading = false;
            this.userList = obj;
          }
          this.id = this.userList[0].id;
          this.getAllCard();
          this.getAllShare();
        });
    },

    getDetail() {
      core
        .fetch({
          method: "post",
          url: `/apiUser/user/findByIdBubble/`,
          data: {
            id: this.id,
          },
        })
        .then((res) => {
          this.data = {
            ...this.data,
            ...res.obj[0],
          };
          this.getAllCard();
        });
    },
    getAllCard() {
      //银行卡信息
      core
        .fetch({
          method: "get",
          url: `/apiBusiness/card/getAllCard`,
          data: {
            user_id: this.id,
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
            user_id: this.id,
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
    handleCurrentChange(currentRow) {
      this.id = currentRow.id;
      this.bankCard = [];
      this.getDetail();
      this.getAllShare();
    },
    resetEchart() {
      this.data = {};
      this.drawLineEchart();
    },
    // 分页
    changePagination(page) {
      this.pagination.current = page;
      core
        .fetch({
          method: "get",
          url: `/apiUser/user/findAll/${this.index}/10`,
          data: {
            current: page,
            pageSize: 10,
          },
        })
        .then((res) => {
          const { code, data, pagination } = res;
          if (code === 1) {
            this.userLoading = false;
            this.userList = data;
            this.pagination = {
              ...pagination,
            };
          }
        });
    },

    handleDeleteCard(card_id) {
      this.$axios
        .delete(`/apiBusiness/card/unbind`, {
          params: {
            user_id: this.id,
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

    drawLineEchart() {
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
      this.echart.setOption(option);
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
          user_id: this.id,
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
            user_id: this.id,
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
.content {
  display: flex;
  height: 80vh;
}
.content-left {
  width: 100%;
  flex: 1;
  width: 50%;
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.pagination-wrap {
  margin-top: 12px;
  text-align: center;
}

.user-search {
  position: relative;
  margin-left: 1vw;
}

.search-content {
  display: flex;
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 6px;
  margin-right: 40px;
}

.search-input {
  flex: 1;
  overflow: hidden;
  padding-right: 8px;
  border: none;
  background-color: transparent;
  box-shadow: none;
  color: #666;
  font-size: 14px;
  line-height: 20px;
  padding-right: 3px;
}
.search-btn {
  position: absolute;
  top: 9px;
  right: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  color: #666;
  line-height: 32px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-btn:hover {
  background-color: #e3e5e7;
}

.content-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-left: 10px;

  h2 {
    font-size: 18px;
    margin: 15px;
  }

  ul {
    margin-bottom: 24px;
  }

  li {
    line-height: 30px;
  }
}

.detail-content {
  padding-left: 30px;
}

.line-echart {
  width: 500px;
  height: 300px;
}

.shadow {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12), 0 2px 2px rgba(0, 0, 0, 0.12),
    0 4px 4px rgba(0, 0, 0, 0.12), 0 8px 8px rgba(0, 0, 0, 0.12),
    0 16px 16px rgba(0, 0, 0, 0.12);
}
</style>
