<template >
  <div>
    <div class="content">
      <!-- <h-msg-box :value="id == undefined" :escClose="true" title="注意">
        <div class="result">
          <div class="title" style="height: 100px">
            <h1 style="text-align: center">
              您尚未选择客户评测，请先选择客户！
            </h1>
          </div>
        </div>
      </h-msg-box> -->

      <h-msg-box
        v-model="MsgBoxVisible"
        :escClose="true"
        title="评估结果"
        @on-ok="postUserSecurity"
      >
        <div class="result">
          <div class="title" style="height: 150px">
            <h3>您的风险评估等级为：</h3>
            <h1 style="text-align: center">
              {{ security }}
            </h1>
          </div>
        </div>
      </h-msg-box>
      <div class="questionnaire">
        <!-- 问卷题 -->
        <div v-for="(item, index) in questionList" :key="item.id">
          <!-- 测试 -->
          <div class="test-content" v-show="index == page">
            <h-card class="shadow" :bordered="false">
              <div class="questionnaire-content">
                <!-- 问卷题 -->
                <div class="content-title">
                  {{ index + 1 }}. {{ item.question }}
                </div>

                <!-- 选项卡 -->
                <h-radio-group
                  v-model="radio"
                  class="radio-group"
                  size="large"
                  :vertical="true"
                >
                  <h-radio :label="item.answer1Num + ',' + item.id"
                    >A. {{ item.answer1 }}</h-radio
                  >
                  <h-radio :label="item.answer2Num + ',' + item.id"
                    >B. {{ item.answer2 }}</h-radio
                  >
                  <h-radio :label="item.answer3Num + ',' + item.id"
                    >C. {{ item.answer3 }}</h-radio
                  >
                  <h-radio
                    v-if="item.answer4"
                    :label="item.answer4Num + ',' + item.id"
                    >D. {{ item.answer4 }}</h-radio
                  >
                  <h-radio
                    v-if="item.answer5"
                    :label="item.answer5Num + ',' + item.id"
                    >E. {{ item.answer5 }}</h-radio
                  >
                </h-radio-group>

                <div class="button-group">
                  <h-button-group shape="circle">
                    <h-button
                      type="primary"
                      @click="toBack(index)"
                      v-if="index != 0"
                      :class="index == 0 ? 'before-back' : 'back'"
                    >
                      <h-icon name="return"></h-icon>
                      后退
                    </h-button>
                    <h-button
                      type="primary"
                      @click="toNext(index, item.id)"
                      v-if="isShow"
                      :class="index == 0 ? 'next' : 'before-next'"
                    >
                      前进
                      <h-icon name="enter"></h-icon>
                    </h-button>
                    <h-button
                      type="primary"
                      v-if="!isShow"
                      @click="submit(item)"
                      :class="index == 0 ? 'next' : 'before-next'"
                      :btnWith="70"
                    >
                      提交
                    </h-button>
                  </h-button-group>
                </div>
              </div>
            </h-card>
            <div class="step-content">
              <div class="steps shadow">
                <h-steps :current="current" direction="vertical">
                  <h-step title="财务状况"></h-step>
                  <h-step title="投资经验"></h-step>
                  <h-step title="投资风格"></h-step>
                  <h-step title="风险承受能力"></h-step>
                </h-steps>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import core from "@hsui/core";
import { USER_SECURITY_ORM } from "../../constant";

export default {
  name: "riskAssess",

  data() {
    this.userSecurityOrm = USER_SECURITY_ORM;
    return {
      //显示框
      MsgBoxVisible: false,
      // 当前页
      page: 0,
      // 选项
      radio: "",
      // 题⽬的id
      ids: [],
      // 分数
      nums: [],
      // 存放每⼀题的id和num
      questionInfos: [],
      // 当前题⽬的序号等于当前题⽬的条数
      isShow: true,
      // 获取问卷数据
      questionList: [],
      current: 0,
      changeArray: [2, 4, 8, 9],
      security: "",
      user: "",
    };
  },
  created() {
    // 接受上⼀层传来的数据
    const { query: { user } = {} } = this.$route;
    this.user = user;
    if (this.user == undefined) {
      this.$hNotice.warning({
        title: "注意！",
        desc: "您尚未选择客户，若要给客户登记风险等级请先返回客户列表选择客户并查看！",
      });
    }
    // 获取问卷数据
    this.getQuestion();
  },
  methods: {
    // 获取问卷数据
    getQuestion() {
      this.questionList = [
        {
          question: "您的年龄？",
          answer1: "18岁以下",
          answer2: "18-25岁",
          answer3: "26-60岁",
          answer4: "高于60岁",
          answer1Num: "1",
          answer2Num: "2",
          answer3Num: "3",
          answer4Num: "4",
          id: "1",
        },
        {
          question:
            "您的家庭总资产净值为（折合人民币）?（不包括自用住宅和私营企业等实业投资，包括储蓄、保险、金融投资，并需扣除未结清贷款、信用卡账单等债务）",
          answer1: "5万以下",
          answer2: "5万-20万",
          answer3: "20万-50万",
          answer4: "50万-100万",
          answer5: "100万以上",
          answer1Num: "1",
          answer2Num: "2",
          answer3Num: "3",
          answer4Num: "4",
          answer5Num: "5",
          id: "2",
        },
        {
          question:
            "在您家庭总资产净值中，可用于金融投资（储蓄存款外）的比例为？",
          answer1: "10%以下",
          answer2: "10%-25%",
          answer3: "25%-50%",
          answer4: "50%-75%",
          answer5: "75%以上",
          answer1Num: "1",
          answer2Num: "2",
          answer3Num: "3",
          answer4Num: "4",
          answer5Num: "5",
          id: "3",
        },
        {
          question: "以下哪项最能说明您的投资经验？",
          answer1: "除存款、国债外，我几乎不投资其他金融产品",
          answer2: "大部分投资于存款、国债等，较少投资于股票、基金等风险产品",
          answer3:
            "资产均衡地分布于存款、国债、银行理财产品、信托产品、股票、基金等",
          answer4:
            "大部分投资于股票、基金、外汇等高风险产品，较少投资于存款、国债",
          answer1Num: "1",
          answer2Num: "2",
          answer3Num: "3",
          answer4Num: "4",
          id: "4",
        },
        {
          question:
            "您有多少年投资股票、基金、外汇、金融衍生产品等风险投资品的经验？",
          answer1: "没有经验",
          answer2: "少于2年",
          answer3: "2至5年",
          answer4: "5至8年",
          answer5: "8年以上",
          answer1Num: "1",
          answer2Num: "2",
          answer3Num: "3",
          answer4Num: "4",
          answer5Num: "5",
          id: "5",
        },
        {
          question: "以下哪项描述最符合您的投资态度？",
          answer1: "厌恶风险，不希望本金损失，希望获得稳定回报",
          answer2: "保守投资，不希望本金损失，愿意承担一定幅度的收益波动",
          answer3: "寻求资金的较高收益和成长性，愿意为此承担有限本金损失",
          answer4: "希望赚取高回报，愿意为此承担较大本金损失",
          answer1Num: "1",
          answer2Num: "2",
          answer3Num: "3",
          answer4Num: "4",
          id: "6",
        },
        {
          question:
            "本金100万，不提供保本承诺的情况下，您会选择哪一种投资机会？",
          answer1: "有100%的机会赢取1000元现金，并保证归还",
          answer2: "有50%的机会赢取5万元现金，并有较高可能性归还本金",
          answer3: "有25%的机会赢取50万元现金，并有一定的可能性损失本金",
          answer4: "有10%的机会赢取100万元现金，并有较高可能性损失本金",

          answer1Num: "1",
          answer2Num: "2",
          answer3Num: "3",
          answer4Num: "4",

          id: "7",
        },
        {
          question:
            "投资于金融投资品（不含存款和国债）时，您可接受的最长投资期限是多久？",
          answer1: "1年之内",
          answer2: "1-3年",
          answer3: "3-5年",
          answer4: "5年以上",
          answer1Num: "1",
          answer2Num: "2",
          answer3Num: "3",
          answer4Num: "4",
          id: "8",
        },
        {
          question: "您的投资目的是？",
          answer1: "资产保值",
          answer2: "资产稳健增长",
          answer3: "资产迅速增长",
          answer1Num: "1",
          answer2Num: "2",
          answer3Num: "3",
          id: "9",
        },
        {
          question: "您的投资出现何种程度的波动时，您会呈现明显的焦虑？",
          answer1: "本金无损失，但收益未达预期",
          answer2: "出现轻微本金损失",
          answer3: "本金10％以内的损失",
          answer4: "本金20-50％的损失",
          answer5: "本金50％以上损失",
          answer1Num: "1",
          answer2Num: "2",
          answer3Num: "3",
          answer4Num: "4",
          answer5Num: "5",
          id: "10",
        },
      ];
    },
    // 点击下⼀题
    toNext(index, id) {
      // 1. 判断是否答题，没有则⽆法跳转到下⼀题
      if (index === 0) {
        if (
          this.radio.slice(0, 1) === "" ||
          this.radio.slice(0, 1) === undefined
        ) {
          this.$hMessage.error("请选择!");
          return;
        }
      } else {
        if (this.radio.slice(2) != id) {
          this.$hMessage.error("请选择!");
          return;
        }
      }
      // 2. 保存答题数据

      let question = { ids: this.radio.slice(2), nums: this.radio.slice(0, 1) };

      this.questionInfos[index] = question;
      this.questionInfos.forEach((questionInfo) => {
        // console.log('questionInfo:[ids: ' + questionInfo.ids + ', nums: ' + questionInfo.nums + '] ');
      });
      // 3. index ++；

      if (this.changeArray.indexOf(index) >= 0) this.current++;

      index++;
      // 4. 判断已答题⽬列表是否包含下标为index的题⽬，有则回显
      if (
        this.questionInfos[index] !== undefined &&
        this.questionInfos[index] !== ""
      ) {
        this.radio =
          this.questionInfos[index].nums + "," + this.questionInfos[index].ids;
      }
      // 5. page ++
      this.page++;

      // 6. 其他（如按钮隐藏）
      // 当前页等于最后⼀题下⼀题按钮隐藏
      if (this.page == this.questionList.length - 1) {
        return (this.isShow = false);
      } else {
        return (this.isShow = true);
      }
    },
    // 点击上⼀题
    toBack(index) {
      // 1. index --；
      index--;
      if (this.changeArray.indexOf(index) >= 0) this.current--;
      // 2. 从已回答列表中获取答题数据，回显
      this.radio =
        this.questionInfos[index].nums + "," + this.questionInfos[index].ids;
      // 3. 保存答题数据
      let question = { ids: this.radio.slice(2), nums: this.radio.slice(0, 1) };
      this.questionInfos[index] = question;
      // 4. page --
      this.page--;
      this.isShow = true;
    },
    // 点击提交
    submit(n) {
      for (var i = 0; i < this.questionInfos.length; i++) {
        this.ids[i] = this.questionInfos[i].ids;
        this.nums[i] = this.questionInfos[i].nums;
      }
      // 发现点击最后⼀题时⽤户点击提交打印出来少⼀条最后⼀页的数据
      // ⽤户点击提交⼿动将最后⼀条数据添加到数组中
      this.ids.push(this.radio.slice(2));
      this.nums.push(this.radio.slice(0, 1));
      //对数组nums求和
      var sum = 0;
      for (var i = 0; i < this.nums.length; i++) {
        sum += parseInt(this.nums[i]);
      }
      //将sun(最高43)划分成5个等级
      if (sum <= 10) {
        this.security = this.userSecurityOrm["R1"];
      } else if (sum > 10 && sum <= 20) {
        this.security = this.userSecurityOrm["R2"];
      } else if (sum > 20 && sum <= 30) {
        this.security = this.userSecurityOrm["R3"];
      } else if (sum > 30 && sum <= 40) {
        this.security = this.userSecurityOrm["R4"];
      } else if (sum > 40) {
        this.security = this.userSecurityOrm["R5"];
      }
      //弹窗展示userSecurity等级
      this.MsgBoxVisible = true;
    },
    postUserSecurity() {
      //根据id给用户追加安全等级
      this.$axios
        .put("/apiUser/user/updateUser", {
          ...this.$route.query.user,
          security: this.security,
        })
        .then((res) => {
          if (res.data.code === 200) {
            this.$hMessage.success("提交成功");
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
  padding-top: 2vh;
}

.test-content {
  display: flex;
  justify-content: space-between;
}

.questionnaire-content {
  width: 60vw;
  padding: 20px;
}

.content-title {
  display: flex;
  font-size: 26px;
}

.radio-group {
  display: flex;
  flex-direction: column;
  padding: 20px 0 0 50px;
  height: 25vh;
  h-radio {
    font-size: 50px;
    flex-wrap: wrap;
  }
}
.button-group {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 10vh;
}
.back {
  background-color: rgb(101, 92, 198);
}

.step-content {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 10px;
  padding: 10px;
  .steps {
    padding: 20px;
  }
}

.shadow {
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.12), 0 2px 2px rgba(0, 0, 0, 0.12),
    0 4px 4px rgba(0, 0, 0, 0.12), 0 8px 8px rgba(0, 0, 0, 0.12),
    0 16px 16px rgba(0, 0, 0, 0.12);
}

.result h1 {
  margin-top: 30px;
}
</style>