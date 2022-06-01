<template>
  <div class="content">
    <div>
      <h-backtop height="300" :bottom="100" :right="5">
        <div class="top"><h-icon name="ios-arrow-up"></h-icon></div>
      </h-backtop>
    </div>
    <div class="queryContent">
      <h-form :model="FormData" :rules="RuleValidate" :label-width="80">
        <h-row>
          <h-col span="8">
            <h-form-item label="客户账号：" prop="user_id">
              <h-input
                v-model="FormData.user_id"
                placeholder="请输入客户账号"
              />
            </h-form-item>
          </h-col>
          <h-col span="8">
            <h-form-item label="产品代码：" prop="product_id">
              <h-input
                v-model="FormData.product_id"
                placeholder="请输入产品代码"
              />
            </h-form-item>
          </h-col>
          <h-col span="8">
            <h-form-item label="银行卡号:" prop="card_id">
              <h-input
                v-model="FormData.card_id"
                placeholder="请输入银行卡号"
              />
            </h-form-item>
          </h-col>
        </h-row>
        <h-row>
          <h-col span="6">
            <h-form-item label="交易状态：" prop="state">
              <h-select
                v-model="FormData.state"
                placeholder="请选择交易状态"
                :setDefSelect="true"
              >
                <h-option
                  v-for="(item, key) in transTypeList"
                  :value="key"
                  :key="key"
                  >{{ transTypeList[key] }}</h-option
                >
              </h-select>
            </h-form-item>
          </h-col>
          <h-col span="9">
            <h-form-item label="起始日期:" prop="startTime">
              <h-date-picker
                type="date"
                :options="dateOptions"
                placeholder="选择起始日期"
                v-model="startTime"
                @on-change="dateFormat"
              >
              </h-date-picker>
            </h-form-item>
          </h-col>
          <h-col span="9">
            <h-form-item label="结束日期:" prop="endTime">
              <h-date-picker
                type="date"
                :options="dateOptions"
                placeholder="选择结束日期"
                v-model="endTime"
                @on-change="dateFormat"
              >
              </h-date-picker>
            </h-form-item>
          </h-col>
        </h-row>
        <h-button type="ghost" @click="FormReset" long> 重置 </h-button>
        <h-button type="success" @click="getTransList" long>
          点我查询
        </h-button>
      </h-form>
    </div>

    <div class="resultContent">
      <h-table
        :loading="transLoading"
        :columns="transColumns"
        :data="transList"
      ></h-table>
      <!-- <h-button type="primary" size="large" @click="exportData(1)">
        <h-icon type="ios-download-outline"></h-icon>导出原始数据
      </h-button>
      <h-button type="primary" size="large" @click="exportData(2)">
        <h-icon type="ios-download-outline"></h-icon>导出排序和过滤后的数据
      </h-button>
      <h-button type="primary" size="large" @click="exportData(3)">
        <h-icon type="ios-download-outline"></h-icon> 导出自定义数据
      </h-button> -->
      <h-msg-box
        v-model="transDetailVisible"
        :escClose="true"
        :beforeEscClose="resetData"
        @on-close="resetData"
        :top="30"
      >
        <div class="detail-content">
          <h3 style="margin-bottom: 10px">订单信息如下：</h3>
          <h-table :columns="detailColumns" size="large" :data="transDetail">
          </h-table>
        </div>
        <p slot="footer" v-show="isWithdrawal">
          <h-button @click="resetData">取消</h-button>
          <h-button type="warning" @click="withdraw">确定撤单</h-button>
        </p>
        <p slot="footer" v-show="!isWithdrawal">
          <h-button @click="resetData">取消</h-button>
          <h-button type="primary" @click="resetData">确定</h-button>
        </p>
      </h-msg-box>
      <div v-show="pagination.total > 0" class="pagination-wrap">
        <h-page v-bind="pagination" @on-change="changePagination"></h-page>
      </div>
    </div>
  </div>
</template>
<script>
import { PRODUCT_TYPE_ORM, USER_TYPE_ORM } from "../../constant";
import core from "@hsui/core";
const dayjs = require("dayjs");
export default {
  data() {
    this.userTypeOrm = USER_TYPE_ORM;
    this.productTypeOrm = PRODUCT_TYPE_ORM;
    const that = this;
    return {
      startTime: "",
      endTime: "",
      transLoading: true,
      userTypeList: [
        {
          value: "institution",
          label: "机构",
        },
        {
          value: "individual",
          label: "个人",
        },
      ],
      transTypeList: {
        0: "未处理",
        2: "已撤单",
      },
      dateOptions: {
        shortcuts: [
          {
            text: "今天",
            value() {
              return new Date();
            },
          },
          {
            text: "昨天",
            value() {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              return date;
            },
          },
          {
            text: "一周前",
            value() {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              return date;
            },
          },
          {
            text: "一月前",
            value() {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 30);
              return date;
            },
          },
        ],
      },
      FormData: {},
      transList: [],
      transColumns: [
        {
          title: "订单编号",
          key: "id",
          width: 100,
          render: (h, { row: { id } }) => h("span", {}, id),
        },
        {
          title: "客户账号",
          key: "user_id",
          width: 100,
          render: (h, { row: { user_id } }) =>
            h("span", {}, user_id.slice(-10)),
        },
        {
          title: "客户姓名",
          key: "user_name",
          render: (h, { row: { user_name } }) => h("span", {}, user_name),
        },
        {
          title: "产品代码",
          key: "product_id",
          width: 100,
          render: (h, { row: { product_id } }) =>
            h("span", {}, product_id.slice(-10)),
        },
        {
          title: "产品名称",
          key: "product_name",
          render: (h, { row: { product_name } }) => h("span", {}, product_name),
        },
        {
          title: "交易类型",
          key: "type",
          render: (h, { row: { type } }) => h("span", {}, type),
          filters: [
            {
              label: "申购",
              value: 1,
            },
            {
              label: "赎回",
              value: 2,
            },
          ],
          filterMultiple: false,
          filterMethod(value, row) {
            if (value === 1) {
              return row.type == "申购";
            } else if (value === 2) {
              return row.type == "赎回";
            }
          },
        },
        {
          title: "状态",
          key: "state",
          sortable: false,
          render: (h, { row: { state } }) =>
            h("span", {}, this.transTypeList[state]),
        },
        {
          title: "交易时间",
          key: "time",
          render: (h, { row: { time } }) => h("span", {}, time),
          width: 150,
          sortable: true,
        },
        {
          title: "银行卡号",
          key: "card_id",
          render: (h, { row: { card_id } }) => h("span", {}, card_id),
          width: 150,
        },
        {
          title: "操作",
          key: "action",
          fixed: "right",
          width: 120,
          render: (h, { row: { state, ...row } }) => {
            if (state === 0) {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "text",
                      size: "small",
                    },
                    on: {
                      click: () => {
                        that.isWithdrawal = true;
                        that.getDetail(state, row);
                      },
                    },
                  },
                  "撤单"
                ),
                h(
                  "Button",
                  {
                    props: {
                      type: "text",
                      size: "small",
                    },
                    style: {
                      color: "#2980b9",
                    },
                    on: {
                      click: () => {
                        that.isWithdrawal = false;
                        that.getDetail(state, row);
                      },
                    },
                  },
                  "详情"
                ),
              ]);
            } else {
              return h("div", [
                h(
                  "Button",
                  {
                    props: {
                      type: "text",
                      size: "small",
                    },
                    style: {
                      color: "#2980b9",
                      marginLeft: "25%",
                    },
                    on: {
                      click: () => {
                        that.isWithdrawal = false;
                        that.getDetail(state, row);
                      },
                    },
                  },
                  "详情"
                ),
              ]);
            }
          },
        },
      ],
      detailColumns: [
        { title: "选项", key: "item" },
        { title: "信息", key: "value" },
      ],
      detailData: {},
      pagination: {
        current: 1,
        "page-size": 10,
        total: 0,
      },
      RuleValidate: {
        user_id: [{ message: "请输入有效的客户账号", trigger: "blur" }],
      },
      isWithdrawal: false,
      transDetailVisible: false,
      queryEnable: true,
    };
  },
  computed: {
    transDetail() {
      return [
        { item: "订单编号：", value: this.detailData.id },
        { item: "交易时间：", value: this.detailData.time },
        { item: "交易方式：", value: this.detailData.method },
        { item: "交易账号：", value: this.detailData.user_id },
        { item: "产品代码：", value: this.detailData.product_id },
        { item: "交易卡号：", value: this.detailData.card_id },
        { item: "交易类型：", value: this.detailData.type },
        {
          item: "交易状态：",
          value: this.transTypeList[this.detailData.state],
        },
        {
          item: this.detailData.type == "申购" ? `金额` : `份额`,
          value: this.detailData.count,
        },
      ];
    },
  },
  mounted() {
    setTimeout(() => {
      this.getTransList();
    }, 500);
  },
  methods: {
    FormReset() {
      this.FormData = {};
      this.startTime = "";
      this.endTime = "";
      this.getTransList();
    },
    getTransList() {
      if (!this.queryEnable) {
        this.$hMessage.error("请输入起始日期！");
        return;
      }
      core
        .fetch({
          method: "post",
          url: `/apiRtrans/rtrans/findByAll`,
          data: {
            ...this.FormData,
          },
        })
        .then((res) => {
          const { code, obj } = res;
          if (code === 200) {
            this.transLoading = false;
            this.transList = obj.map((item) => {
              return {
                ...item,
                type: "赎回",
              };
            });
          }
        });
    },
    changePagination(page) {
      core
        .fetch({
          method: "get",
          url: "/api/business",
          data: {
            current: page,
            pageSize: 10,
          },
        })
        .then((res) => {
          const { code, data, pagination } = res;
          if (code === 1) {
            this.productLoading = false;
            this.transList = data;
            this.pagination = {
              ...pagination,
            };
          }
        });
    },
    exportData(type) {
      if (type === 1) {
        this.$refs.table.exportCsv({
          filename: "原始数据",
        });
      } else if (type === 2) {
        this.$refs.table.exportCsv({
          filename: "排序和过滤后的数据",
          original: false,
        });
      } else if (type === 3) {
        this.$refs.table.exportCsv({
          filename: "自定义数据",
          columns: this.columns8.filter((col, index) => index < 4),
          data: this.data7.filter((data, index) => index < 4),
        });
      }
    },
    getDetail(state, row) {
      this.detailData = { state, ...row };
      this.transDetailVisible = true;
    },
    resetData() {
      this.transDetailVisible = false;
      this.detailData = {};
    },
    dateFormat() {
      if (this.startTime) {
        this.FormData.date1 = dayjs(this.startTime).format("YYYY-MM-DD");
        if (this.endTime) {
          this.FormData.date2 = dayjs(this.endTime).format("YYYY-MM-DD");
          this.queryEnable = true;
        } else {
          this.FormData.date2 = dayjs().format("YYYY-MM-DD");
        }
      } else {
        delete this.FormData.date1;
        delete this.FormData.date2;
        this.queryEnable = true;
      }
      if (this.endTime) {
        if (!this.startTime) {
          this.queryEnable = false;
          this.$hMessage.error("请输入起始日期！");
        }
      }
    },
    withdraw() {
      this.detailData.type === "申购"
        ? this.withdrawPtrans()
        : this.withdrawRtrans();
    },
    //撤回申购
    withdrawPtrans() {
      core
        .fetch({
          method: "post",
          url: `/apiPtrans/ptrans/withdrawPtrans/${dayjs().format(
            "YYYY-MM-DD HH:mm:ss"
          )}`,
          data: { id: this.detailData.id, state: this.detailData.state },
        })
        .then((res) => {
          const { code } = res;
          if (code === 200) {
            this.$hMessage.success("撤单成功！");
            this.getTransList();
            this.transDetailVisible = false;
          } else {
            this.$hMessage.error("撤单失败！");
          }
        });
    },
    //撤回赎回
    withdrawRtrans() {
      const { product_id, user_id, card_id, id, state } = this.detailData;
      core
        .fetch({
          method: "post",
          url: `/apiRtrans/rtrans/withdrawRtrans/${dayjs().format(
            "YYYY-MM-DD HH:mm:ss"
          )}`,
          data: { id, user_id, product_id, card_id, state },
        })
        .then((res) => {
          const { code } = res;
          console.log(res);
          if (code === 200) {
            this.$hMessage.success("撤单成功！");
            this.getTransList();
            this.transDetailVisible = false;
          } else {
            this.$hMessage.error(`撤单失败，${res.message}`);
          }
        });
    },
  },
};
</script>
<style lang="less">
.pagination-wrap {
  margin-top: 12px;
  text-align: right;
}
.top {
  padding: 5px 10px;
  background: rgba(0, 153, 229, 0.7);
  color: #fff;
  text-align: center;
  border-radius: 2px;
}
.queryContent {
}
.resultContent {
  margin-top: 10px;
}
</style>
