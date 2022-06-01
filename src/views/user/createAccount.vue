<template>
  <div>
    <div class="content">
      <h-form
        ref="userForm"
        :rules="userRuleValidate"
        :model="userFormData"
        :label-width="80"
        :showMessage="true"
        class="demo-row"
      >
        <h-row>
          <h-col span="8"
            ><h-form-item label="客户姓名" prop="name" clos="1">
              <h-input
                v-model="userFormData.name"
                placeholder="请输入客户姓名"
              />
            </h-form-item>
          </h-col>

          <h-col span="8">
            <h-form-item label="客户年龄" prop="age">
              <h-input v-model="userFormData.age" placeholder="请输入年龄" />
            </h-form-item>
          </h-col>
          <h-col span="8">
            <h-form-item label="性别" prop="sex">
              <h-select v-model="userFormData.sex">
                <h-option value="男">男</h-option>
                <h-option value="女">女</h-option>
              </h-select>
            </h-form-item>
          </h-col>
        </h-row>

        <h-row>
          <h-col span="8"
            ><h-form-item label="证件类型" prop="ctype">
              <h-select v-model="userFormData.ctype" filterable>
                <h-option value="居民身份证">居民身份证</h-option>
                <h-option value="护照">护照</h-option>
              </h-select>
            </h-form-item></h-col
          >
          <h-col span="16">
            <h-form-item label="证件号码" prop="cid" style="width: 85%">
              <h-input
                v-model="userFormData.cid"
                placeholder="请输入客户证件号"
              />
            </h-form-item>
          </h-col>
        </h-row>

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
        <h-form-item label="银行卡号" prop="card_id" style="width: 60%">
          <h-input
            v-model="userFormData.card_id"
            placeholder="请输入绑定银行卡"
            bigTips
          ></h-input>
        </h-form-item>
        <h-form-item label="密码" prop="password" style="width: 60%">
          <h-input
            v-model="userFormData.password"
            type="password"
            placeholder="请输入密码"
            bigTips
          ></h-input>
        </h-form-item>
        <h-form-item prop="repassword" style="width: 60%">
          <h-input
            v-model="userFormData.repassword"
            type="password"
            placeholder="请再次输入密码"
            bigTips
          ></h-input>
        </h-form-item>

        <h-form-item label="联系方式" prop="phone" style="width: 50%">
          <h-input v-model="userFormData.phone" placeholder="请输入联系方式" />
        </h-form-item>

        <h-form-item label="客户职业" prop="job" style="width: 40%">
          <h-input v-model="userFormData.job" placeholder="请输入职业" />
        </h-form-item>

        <h-form-item label="客户地址" prop="address" style="width: 90%">
          <h-input v-model="userFormData.address" placeholder="请输入地址" />
        </h-form-item>

        <h-form-item style="text-align: right; padding-right: 2vw">
          <h-button type="ghost" @click="userFormReset"> 重置 </h-button>
          <h-button type="primary" @click="userFormOk"> 提交 </h-button>
        </h-form-item>
      </h-form>

      <div class="steps shadow">
        <h-steps :current="0" direction="vertical">
          <h-step title="进行中" content="基本信息填写"></h-step>
          <h-step title="待进行" content="风险评估"></h-step>
        </h-steps>
      </div>
    </div>
  </div>
</template>
<script>
import core from "@hsui/core";
import { USER_TYPE_ORM, USER_SECURITY_ORM } from "../../constant";
export default {
  data() {
    this.typeOrm = USER_TYPE_ORM;
    this.userSecurityOrm = USER_SECURITY_ORM;
    return {
      userFormData: {},
      userRuleValidate: {
        name: [
          {
            required: true,
            message: "请输入客户姓名",
            trigger: "blur",
          },
        ],
        phone: [
          {
            required: true,
            pattern: /^1[3456789]\d{9}$|^\d{3}-\d{8}|\d{4}-\d{7,8}/,
            message: "请输入有效的联系方式",
            trigger: "blur",
          },
        ],
        ctype: [{ required: true, message: "请选择证件类型", trigger: "blur" }],

        card_id: [
          {
            required: true,
            pattern: /^[1-9]\d{9,29}$/,
            message: "请输入有效的银行卡号",
            trigger: "blur",
          },
        ],
        cid: [
          {
            required: true,
            pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/,
            message: "请输入有效的证件号",
            trigger: "blur",
          },
        ],
        password: [
          {
            required: true,
            pattern: /^[a-zA-Z0-9]{6,20}$/,
            message: "请输入有效的密码",
            trigger: "blur",
          },
        ],
        repassword: [
          { message: "请再次输入密码", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if (value !== this.userFormData.password) {
                callback(new Error("两次输入的密码不一致"));
              } else {
                callback();
              }
            },
          },
        ],
        sex: [{ required: true, message: "请选择性别", trigger: "blur" }],
        type: [{ required: true, message: "请选择用户类型", trigger: "blur" }],
        age: [
          {
            required: true,
            pattern: /^[0-9]{1,3}$/,
            message: "请输入有效年龄",
            trigger: "blur",
          },
        ],

        address: [{ required: true, message: "请输入地址", trigger: "blur" }],
        job: [{ required: true, message: "请输入职业", trigger: "blur" }],
      },
    };
  },

  methods: {
    userFormOk() {
      this.$refs["userForm"].validate((valid) => {
        if (valid) {
          this.createUser();
        } else {
          this.$hMessage.error("表单验证失败!");
          return;
        }
      });
    },
    userFormReset() {
      this.$refs["userForm"].resetFields();
    },
    createUser() {
      core
        .fetch({
          method: "post",
          url: "/apiUser/user/addUser",
          data: { ...this.userFormData },
        })
        .then((res) => {
          const { obj } = res;
          if (res.code === 200) {
            this.postCard(obj.id);
            this.$hMessage.success("添加成功!");
            //跳转到风险评估
            this.$router.push({
              path: "/user/riskAssess",
              query: {
                user: obj,
              },
            });
          }
        });
    },
    postCard(id) {
      //绑卡
      core
        .fetch({
          method: "post",
          url: "/apiBusiness/card/bind",
          data: {
            user_id: id,
            card_id: this.userFormData.card_id,
          },
        })
        .then((res) => {
          const { code } = res;
          if (code === 200) {
            this.$hMessage.success("绑卡成功!");
          }
        });
    },
  },
};
</script>
<style lang="less" scoped>
.content {
  display: flex;
  justify-content: space-around;
  padding-top: 5vh;
}
.demo-row {
  padding: 0 10px;
  width: 50vw;
}

.steps {
  align-self: center;
  padding: 50px 30px 30px 30px;
  margin-bottom: 10vh;
}

.shadow {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12), 0 2px 2px rgba(0, 0, 0, 0.12),
    0 4px 4px rgba(0, 0, 0, 0.12), 0 8px 8px rgba(0, 0, 0, 0.12),
    0 16px 16px rgba(0, 0, 0, 0.12);
}
</style>