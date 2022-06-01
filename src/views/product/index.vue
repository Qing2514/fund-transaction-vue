<template>
  <div>
    <!-- 表格操作 -->
    <div class="items">
      <div class="product-action-bar">
        <h-button type="primary" @click="addProduct">新增</h-button>
      </div>
      <div class="product-search">
        <div class="search-content">
          <h-select
            placeholder="请选择产品代码"
            ref="product_id"
            :maxlength="6"
            remote
            remoteIcon="search"
            filterable
            :remote-method="remoteSearchProduct"
            @on-change="getCertainProduct"
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
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <h-table
      :loading="productLoading"
      :columns="productColumns"
      :data="productList"
    ></h-table>
    <!-- 分页 -->
    <div v-show="pagination.total > 0" class="pagination-wrap">
      <h-page v-bind="pagination" @on-change="changePagination"></h-page>
    </div>
    <!-- 弹框-产品新增/编辑 -->
    <h-msg-box
      v-model="productMsgBoxVisible"
      footerHide
      :escClose="true"
      :title="
        productFormMsgBoxData.id ? `编辑${productFormMsgBoxData.name}` : '新增'
      "
      :beforeEscClose="productMsgBoxBeforeEscClose"
      @on-close="productMsgBoxClose"
    >
      <h-form
        ref="productForm"
        :model="productFormData"
        :rules="productRuleValidate"
        :label-width="80"
      >
        <h-form-item label="产品代码" prop="id" required>
          <h-input
            v-model="productFormData.id"
            placeholder="请输入产品代码"
            v-show="!productFormMsgBoxData.id"
            required
          ></h-input>
          <h4 v-show="productFormMsgBoxData.id">
            {{ productFormData.id }}
          </h4>
        </h-form-item>
        <h-form-item label="产品名称" prop="name" required>
          <h-input
            v-model="productFormData.name"
            placeholder="请输入产品名称"
            v-show="!productFormMsgBoxData.id"
          ></h-input>
          <h4 v-show="productFormMsgBoxData.id">
            {{ productFormData.name }}
          </h4>
        </h-form-item>
        <h-form-item label="产品类型" prop="type" required cols="2">
          <h-radio-group v-model="productFormData.type">
            <h-radio
              v-for="(type, key) in typeOrm"
              :key="key"
              style="margin-right: 24px"
              :label="type"
            >
              {{ type }}
            </h-radio>
          </h-radio-group>
        </h-form-item>
        <h-form-item label="风险等级" prop="security" required cols="2">
          <h-radio-group v-model="productFormData.security">
            <h-radio
              v-for="(security, key) in securityOrm"
              :key="key"
              style="margin-right: 24px"
              :label="security"
            >
              {{ security }}
            </h-radio>
          </h-radio-group>
        </h-form-item>
        <h-form-item label="产品描述" prop="detail">
          <h-input
            icon="close"
            @on-click="detailClear"
            v-model="productFormData.detail"
            placeholder="请输入产品描述"
          />
        </h-form-item>
        <h-form-item style="text-align: right">
          <h-button type="ghost" @click="productFormCancel"> 取消 </h-button>
          <h-button type="primary" @click="productFormOk"> 提交 </h-button>
        </h-form-item>
      </h-form>
    </h-msg-box>
  </div>
</template>

<script>
import core from "@hsui/core";
import { PRODUCT_TYPE_ORM, PRODUCT_SECURITY_ORM } from "../../constant";

export default {
  data() {
    this.timer = null;
    this.typeOrm = PRODUCT_TYPE_ORM;
    this.securityOrm = PRODUCT_SECURITY_ORM;
    const router = this.$router;
    const that = this;
    return {
      productLoading: true,
      productMsgBoxVisible: false,
      productFormMsgBoxData: {},
      productFormData: {},
      productRuleValidate: {
        id: [
          {
            required: true,
            message: "请输入六位产品代码",
            pattern: /^\d{6}$/,
            trigger: "blur",
          },
        ],
        security: [
          {
            required: true,
            message: "请选择产品风险等级",
            trigger: "change",
          },
        ],
        type: [
          {
            required: true,
            message: "请选择产品类型",
            trigger: "change",
          },
        ],
      },
      productColumns: [
        {
          title: "产品代码",
          key: "id",
          render: (h, { row: { id } }) => h("span", {}, id),
        },
        {
          title: "产品名称",
          key: "name",
          render: (h, { row: { name } }) => h("span", {}, name),
        },
        {
          title: "产品类型",
          key: "type",
          render: (h, { row: { type } }) => {
            return h("span", {}, type);
          },
        },
        {
          title: "产品风险等级",
          key: "security",
          render: (h, { row: { security } }) => {
            return h("span", {}, security);
          },
        },
        {
          title: "产品描述",
          key: "detail",
        },
        {
          title: "操作",
          key: "action",
          width: 200,
          render(h, { row, row: { id, name } = {} }) {
            return h("div", [
              h(
                "h-poptip",
                {
                  props: {
                    title: `确认删除${name}?`,
                    confirm: true,
                    width: 200,
                    transfer: true,
                  },
                  on: {
                    "on-ok": () => {
                      that.delProduct(id, name);
                    },
                    "on-cancel": () => {
                      that.$hMessage.info({
                        content: `取消删除${name}`,
                        duration: 3,
                        closable: true,
                      });
                    },
                  },
                },
                [
                  h(
                    "Button",
                    {
                      props: { type: "text", size: "small" },
                      style: {
                        color: "#c0392b",
                      },
                    },

                    "删除"
                  ),
                ]
              ),
              h(
                "Button",
                {
                  props: { type: "text", size: "small" },
                  on: {
                    click() {
                      that.isUpdate = true;
                      that.productMsgBoxVisible = true;
                      that.productFormMsgBoxData = { ...row };
                      that.productFormData = { ...row };
                    },
                  },
                },
                "编辑"
              ),
              h(
                "Button",
                {
                  props: { type: "text", size: "small" },
                  on: {
                    click() {
                      router.push({
                        path: `/product/${id}`,
                      });
                    },
                  },
                  style: {
                    color: "#2980b9",
                  },
                },
                "查看"
              ),
            ]);
          },
        },
      ],
      productList: [],
      pagination: {
        current: 1,
        "page-size": 10,
        total: 0,
      },
      searchResultProducts: [],
      isUpdate: false,
    };
  },
  created() {
    // 获取产品列表;
    this.getProductList();
  },
  computed: {
    index() {
      return (this.pagination.current - 1) * this.pagination["page-size"];
    },
  },
  methods: {
    detailClear() {
      this.productFormData.detail = "";
    },
    addProduct() {
      this.timer = null;
      this.isUpdate = false;
      this.productMsgBoxVisible = true;
    },
    delProduct(id, name) {
      this.$axios
        .delete(`/apiProduct/product/deleteProduct/${id}`)
        .then((res) => {
          if (res.data.code === 200) {
            this.$hMessage.success({
              content: `删除${name}成功`,
              duration: 3,
              closable: true,
            });
            this.getProductList();
          } else {
            this.$hMessage.error({
              content: `删除${name}失败`,
              duration: 3,
              closable: true,
            });
          }
        });
    },
    remoteSearchProduct(query) {
      if (query !== "" && query.length >= 4) {
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
        this.getProductList();
        this.searchResultProducts = [];
      }
    },
    getCertainProduct(value) {
      this.isLoading = true;
      core
        .fetch({
          method: "get",
          url: `/apiProduct/product/findProductByIdBubble/${value}`,
        })
        .then((res) => {
          const { code, obj } = res;
          if (code === 200) {
            this.isLoading = false;
            this.productList = obj;
          }
        });
    },
    getProductList() {
      core
        .fetch({
          method: "get",
          url: `/apiProduct/product/findAllProduct/${this.index}/10`,
        })
        .then((res) => {
          const { code, obj } = res;
          if (code === 200) {
            this.productLoading = false;
            this.productList = obj;
          }
        });
    },
    createProduct() {
      core
        .fetch({
          method: "post",
          url: `/apiProduct/product/addProduct/${this.$store.state.workday}`,
          data: { networth: 1, ...this.productFormData },
        })
        .then((res) => {
          if (res.code === 200) {
            this.$hMessage.success({
              content: "添加产品成功",
              duration: 3,
              closable: true,
            });
            this.getProductList();
            this.resetProductFormMsgBoxData();
            this.resetProductFormData();
          }
        });
    },
    updateProduct() {
      this.$axios
        .put(`/apiProduct/product/updateProduct`, {
          ...this.productFormData,
        })
        .then((res) => {
          if (res.data.code === 200) {
            this.$hMessage.success({
              content: `修改${this.productFormData.name}成功`,
              duration: 3,
              closable: true,
            });
            this.getProductList();
            this.resetProductFormMsgBoxData();
            this.resetProductFormData();
          }
        });
    },
    productFormOk() {
      this.$refs["productForm"].validate((valid) => {
        if (valid) {
          if (this.isUpdate) {
            this.updateProduct();
          } else {
            this.createProduct();
          }
        } else {
          this.$hMessage.error("表单验证失败!");
          return;
        }
      });
    },
    productFormCancel() {
      this.resetProductFormMsgBoxData();
      this.resetProductFormData();
    },
    productFormReset() {
      this.resetProductFormData();
    },
    productMsgBoxBeforeEscClose() {
      this.resetProductFormMsgBoxData();
      this.resetProductFormData();
    },
    productMsgBoxClose() {
      this.resetProductFormMsgBoxData();
      this.resetProductFormData();
    },
    resetProductFormMsgBoxData() {
      this.productMsgBoxVisible = false;
      this.productFormMsgBoxData = {};
    },
    resetProductFormData() {
      this.productFormData = {};
      this.timer = setTimeout(() => {
        this.$refs["productForm"].resetValidate();
      }, 0);
    },
    changePagination(page) {
      this.pagination.current = page;
      core
        .fetch({
          method: "get",
          url: `/apiProduct/product/findAllProduct/${this.index}/10`,
        })
        .then((res) => {
          const { code, obj } = res;
          if (code === 200) {
            this.productLoading = false;
            this.productList = obj;
          }
        });
    },
  },
  beforeDestroy() {
    this.timer = null;
  },
};
</script>

<style lang="less" scoped>
.items {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.product-action-bar {
  flex: 1;
}

.pagination-wrap {
  margin-top: 12px;
  text-align: right;
}

.product-search {
  position: relative;
  flex: 1;
  justify-content: center;
  align-items: center;
  margin-right: 4.5vw;
}

.search-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
</style>
