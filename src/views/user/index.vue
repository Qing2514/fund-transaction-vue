<template>
  <div>
    <!-- 表格操作 -->
    <div class="items">
      <div class="user-action-bar"></div>

      <div class="user-search">
        <div class="search-content">
          <h-form
            ref="queryForm"
            :model="userSearch"
            :label-width="70"
            :rules="queryRule"
            :showMessage="true"
            inline
          >
            <h-form-item label="查询类型" prop="queryType" cols="2">
              <h-radio-group v-model="userSearch.symbol">
                <h-radio label="0">精确</h-radio>
                <h-radio label="1">模糊</h-radio>
              </h-radio-group>
            </h-form-item>
            <h-form-item label="客户姓名" prop="name" cols="2">
              <h-input v-model="userSearch.name" placeholder="请输入客户姓名" />
            </h-form-item>
            <h-form-item label="客户类型" prop="type" cols="2">
              <h-select v-model="userSearch.type" width="90">
                <h-option value="个人">个人</h-option>
                <h-option value="机构">机构</h-option>
              </h-select>
            </h-form-item>
            <h-form-item label="证件类型" prop="ctype" cols="2">
              <h-select v-model="userSearch.ctype" width="95">
                <h-option value="居民身份证">身份证</h-option>
                <h-option value="护照">护照</h-option>
              </h-select>
            </h-form-item>
            <h-form-item label="证件号" prop="cid" cols="2">
              <h-input
                v-model="userSearch.cid"
                placeholder="请输入客户证件号"
              />
            </h-form-item>
          </h-form>
        </div>
        <h-button class="search-btn" @click="querySearch">
          <h-icon name="android-search"></h-icon>
        </h-button>
      </div>
    </div>
    <!-- 表格 -->
    <h-table
      :loading="userLoading"
      :columns="userColumns"
      :data="userList"
    ></h-table>
    <!-- 分页 -->
    <div v-show="pagination.total > 0" class="pagination-wrap">
      <h-page v-bind="pagination" @on-change="changePagination"></h-page>
    </div>
    <!-- 弹框-用户编辑 -->
    <h-msg-box
      v-model="userMsgBoxVisible"
      footerHide
      :escClose="true"
      :title="userFormMsgBoxData.id ? `编辑${userFormMsgBoxData.name}` : '新增'"
      :beforeEscClose="userMsgBoxBeforeEscClose"
      @on-close="userMsgBoxClose"
    >
      <h-form
        ref="userForm"
        :model="userFormData"
        :rules="userRuleValidate"
        :label-width="80"
      >
        <h-form-item label="客户姓名" prop="name">
          <h-input v-model="userFormData.name" placeholder="请输入客户姓名" />
        </h-form-item>
        <h-form-item label="客户类型" prop="type" cols="2">
          <h-radio-group v-model="userFormData.type">
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
        <h-form-item label="客户职业" prop="job">
          <h-input v-model="userFormData.job" placeholder="请输入职业" />
        </h-form-item>
        <h-form-item label="评估等级" prop="security" cols="2">
          <h-radio-group v-model="userFormData.security">
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
        <h-form-item label="联系方式" prop="phone">
          <h-input v-model="userFormData.phone" placeholder="请输入联系方式" />
        </h-form-item>
        <h-form-item label="客户地址" prop="address">
          <h-input
            v-model="userFormData.address"
            placeholder="请输入客户地址"
          />
        </h-form-item>
        <h-form-item style="text-align: right">
          <h-button type="ghost" @click="userFormCancel"> 取消 </h-button>

          <h-button type="primary" @click="userFormOk"> 提交 </h-button>
        </h-form-item>
      </h-form>
    </h-msg-box>
  </div>
</template>

<script>
import core from "@hsui/core";
import { USER_TYPE_ORM, USER_SECURITY_ORM } from "../../constant";

export default {
  data() {
    this.timer = null;
    this.typeOrm = USER_TYPE_ORM;
    this.securityOrm = USER_SECURITY_ORM;
    const router = this.$router;
    const that = this;
    return {
      searchValue: "",
      userSearch: {
        symbol: "0",
      },
      userLoading: true,
      userMsgBoxVisible: false,
      userFormMsgBoxData: {},
      userFormData: {},
      userRuleValidate: {
        name: [
          {
            required: true,
            message: "客户姓名不能为空",
            trigger: "blur",
          },
        ],
        security: [
          {
            required: true,
            message: "请选择客户风险等级",
            trigger: "change",
          },
        ],
        type: [
          {
            required: true,
            message: "请选择客户类型",
            trigger: "change",
          },
        ],
        phone: [
          {
            required: true,
            message: "请输入客户联系方式",
            trigger: "change",
          },
        ],
      },
      userColumns: [
        {
          title: "客户账号",
          key: "id",
          render: (h, { row: { id } }) => h("span", {}, id),
        },
        {
          title: "客户姓名",
          key: "name",
          render: (h, { row: { name } }) => h("span", {}, name),
        },
        {
          title: "客户类型",
          key: "type",
          render: (h, { row: { type } }) => {
            return h("span", {}, type);
          },
        },
        {
          title: "风险等级",
          key: "security",
          render: (h, { row: { security } }) => {
            return h("span", {}, security);
          },
        },
        {
          title: "联系方式",
          key: "phone",
          render: (h, { row: { phone } }) => {
            return h("span", {}, phone);
          },
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
                      that.delUser(id, name);
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
                      that.userMsgBoxVisible = true;
                      that.userFormMsgBoxData = { ...row };
                      that.userFormData = { ...row };
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
                        path: `/user/${id}`,
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
      userList: [],
      pagination: {
        current: 1,
        "page-size": 15,
        total: 0,
      },
    };
  },
  created() {
    // 获取用户列表;
    this.getUserList();
  },
  computed: {
    queryRule() {
      if (this.userSearch.symbol === "0") {
        return {
          name: [
            {
              required: true,
              message: "客户姓名(至少两位)",
              pattern: /^[\u4e00-\u9fa5]{2,6}$/,
              trigger: "blur",
            },
          ],
          type: [
            {
              required: true,
              message: "请选择客户类型",
              trigger: "change",
            },
          ],
          ctype: [
            {
              required: true,
              message: "请选择证件类型",
              trigger: "change",
            },
          ],
          cid: [
            {
              required: true,
              message: "请输入证件号",
              trigger: "blur",
            },
          ],
        };
      } else {
        return {
          name: [
            {
              required: true,
              message: "请输入客户姓名",
              trigger: "blur",
            },
          ],
        };
      }
    },
    index() {
      return (this.pagination.current - 1) * this.pagination["page-size"];
    },
  },

  methods: {
    //搜索
    querySearch() {
      core
        .fetch({
          method: "post",
          url: "/apiUser/user/findUser",
          data: { ...this.userSearch },
        })
        .then((res) => {
          const { code, obj } = res;
          if (code === 200) {
            this.userLoading = false;
            if (this.userSearch.symbol == 1) this.userList = obj;
            else {
              this.userList = [];
              this.userList.push(obj);
            }
          }
        });
    },

    // delUser(user) {
    //   this.$axios.put(`/apiUser/user/deleteUser`, { ...user }).then((res) => {
    //     if (res.data.code === 200) {
    //       this.$hMessage.success({
    //         content: `删除${name}成功`,
    //         duration: 3,
    //         closable: true,
    //       });
    //       this.getUserList();
    //     } else {
    //       this.$hMessage.error({
    //         content: `删除${name}失败，${res.data.message}`,
    //         duration: 3,
    //         closable: true,
    //       });
    //     }
    //   });
    // },
    delUser(id, name) {
      this.$axios.put(`/apiUser/user/deleteUser`, { id: id }).then((res) => {
        if (res.data.code === 200) {
          this.$hMessage.success({
            content: `删除${name}成功`,
            duration: 3,
            closable: true,
          });
          this.getUserList();
        } else {
          this.$hMessage.error({
            content: `删除${name}失败，${res.data.message}`,
            duration: 3,
            closable: true,
          });
        }
      });
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
        });
    },

    updateUser() {
      this.$axios
        .put("/apiUser/user/updateUser", {
          ...this.userFormData,
        })
        .then((res) => {
          if (res.data.code === 200) {
            this.$hMessage.success("修改成功");
            this.userMsgBoxVisible = false;
            this.getUserList();
          }
        });
    },
    userFormOk() {
      this.$refs["userForm"].validate((valid) => {
        if (valid) {
          if (this.userFormData.id) {
            this.updateUser();
          } else {
            this.createUser();
          }
        } else {
          this.$Message.error("表单验证失败!");
          return;
        }
      });
    },
    userFormCancel() {
      this.resetUserFormMsgBoxData();
      this.resetUserFormData();
    },
    userMsgBoxBeforeEscClose() {
      this.resetUserFormMsgBoxData();
      this.resetUserFormData();
      return ture;
    },
    userMsgBoxClose() {
      this.resetUserFormMsgBoxData();
      this.resetUserFormData();
    },
    resetUserFormMsgBoxData() {
      this.userMsgBoxVisible = false;
      this.userFormMsgBoxData = {};
    },
    resetUserFormData() {
      this.userFormData = {};
      this.timer = setTimeout(() => {
        this.$refs["userForm"].resetValidate();
      }, 0);
    },
    changePagination(page) {
      this.pagination.current = page;
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
  justify-content: space-around;
  margin-bottom: 12px;
}

.user-action-bar {
  flex: 1;
}

.pagination-wrap {
  margin-top: 12px;
  text-align: right;
}

.user-search {
  position: relative;
  margin-right: 4.5vw;
  width: 100%;
}

.search-content {
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 6px;
}

.search-btn {
  position: absolute;
  top: 9px;
  right: 0px;
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
