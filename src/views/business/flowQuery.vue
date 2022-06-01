<template>
  <div class="content">
    <div class="queryContent">
      <h-form :model="FormData" :rules="RuleValidate" :label-width="80">
        <h-row>
          <h-col span="8">
            <h-form-item label="客户账号：" prop="user_id">
              <h-input
                v-model="FormData.user_id"
                placeholder="请输入客户账号："
              />
            </h-form-item>
          </h-col>
          <h-col span="8">
            <h-form-item label="产品代码：" prop="product_id">
              <h-input
                v-model="FormData.product_id"
                placeholder="请输入产品代码："
              />
            </h-form-item>
          </h-col>
          <h-col span="8">
            <h-form-item label="银行卡号:" prop="card_id">
              <h-input
                v-model="FormData.card_id"
                placeholder="请输入银行卡号："
              />
            </h-form-item>
          </h-col>
        </h-row>
        <h-row>
          <h-col span="10">
            <h-form-item label="起始日期:" prop="startTime">
              <h-date-picker
                type="date"
                :options="dateOptions"
                placeholder="选择交易日期"
                v-model="startTime"
                @on-change="dateFormat"
              >
              </h-date-picker>
            </h-form-item>
          </h-col>
          <h-col span="10">
            <h-form-item label="结束日期:" prop="endTime">
              <h-date-picker
                type="date"
                :options="dateOptions"
                placeholder="选择交易日期"
                v-model="endTime"
                @on-change="dateFormat"
              >
              </h-date-picker>
            </h-form-item>
          </h-col>
          <h-col span="4">
            <h-button type="ghost" @click="FormReset" style="margin-left: 50px">
              重置
            </h-button>
            <h-button type="success" @click="getTransList"> 查询 </h-button>
          </h-col>
        </h-row>
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
          width: 135,
          render: (h, { row: { id } }) => h("span", {}, id),
        },
        {
          title: "客户账号",
          key: "user_id",

          render: (h, { row: { user_id } }) =>
            h("span", {}, user_id.slice(-10)),
        },
        {
          title: "产品代码",
          key: "product_id",

          render: (h, { row: { product_id } }) =>
            h("span", {}, product_id.slice(-10)),
        },
        {
          title: "银行卡号",
          key: "card_id",
          render: (h, { row: { card_id } }) => h("span", {}, card_id),
        },
        {
          title: "交易份额",
          key: "num",
          render: (h, { row: { num } }) => h("span", {}, num),
        },
        {
          title: "交易时间",
          key: "time",
          render: (h, { row: { time } }) => h("span", {}, time),
          sortable: true,
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
      startTime: "",
      endTime: "",
      queryEnable: true,
      isWithdrawal: false,
      transDetailVisible: false,
    };
  },

  mounted() {
    this.getTransList();
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
      this.transLoading = true;
      core
        .fetch({
          method: "post",
          url: `/apiBusiness/record/findByAll`,
          data: {
            ...this.FormData,
          },
        })
        .then((res) => {
          const { code, obj } = res;
          if (code === 200) {
            this.transList = obj;
            this.transLoading = false;
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
  },
};
</script>
<style lang="less">
.pagination-wrap {
  margin-top: 12px;
  text-align: right;
}
.queryContent {
}
.resultContent {
  margin-top: 10px;
}
</style>
