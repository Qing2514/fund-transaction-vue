<template>
  <div class="steps">
    <h-steps :current="0" direction="vertical">
      <h-step
        :title="steps.cnList[steps.stat[0]]"
        :status="steps.egList[steps.stat[0]]"
        icon="android-sunny"
        content="日初始化"
      >
      </h-step>
      <h-step
        :title="steps.cnList[steps.stat[1]]"
        :status="steps.egList[steps.stat[1]]"
        icon="android-sync"
        content="行情更新"
      >
      </h-step>
      <h-step
        :title="steps.cnList[steps.stat[2]]"
        :status="steps.egList[steps.stat[2]]"
        icon="android-bulb"
        content="份额计算"
      >
      </h-step>
    </h-steps>
  </div>
</template>

<script>
export default {};
</script>


<style scoped>
.steps {
  margin-left: 10%;
  margin-top: 40%;
}
</style>