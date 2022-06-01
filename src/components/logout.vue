<template>
  <div>
    <a ref="#"><span>登出</span></a>
  </div>
</template>
<script>
export default {};
</script>
<style lang="less" scoped>
a {
  position: relative;
  background: #0690fd;
  font-size: 16px;
  color: #fff;
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.5s linear;
  box-shadow: 0 20px 25px #0690fd44;
  overflow: hidden;
  &:hover {
    width: 200px;
    transition-delay: 0.5s;
  }
  &::before {
    content: "";
    position: absolute;
    right: 25px;
    width: 12px;
    height: 12px;
    border-top: 3px solid #fff;
    border-right: 3px solid#fff;
    transform: rotate(45deg);
    transition: 0.5s;
  }
  &::after {
    content: "";
    position: absolute;
    left: -50px;
    width: 12px;
    height: 12px;
    border-top: 3px solid #fff;
    border-right: 3px solid#fff;
    transform: rotate(45deg) translate(-50px, 50px);
    transition: 0.5s;
  }
}
a:hover::before {
  transform: rotate(45deg) translate(50px, -50px);
}
a:hover::after {
  transform: rotate(45deg) translate(50px, -50px);
  transition-delay: 1s;
}
a span {
  visibility: hidden;
  opacity: 0;
  white-space: nowrap;
  transition: 0.5s;
}
a:hover span {
  visibility: visible;
  opacity: 1;
  transition-delay: 0.75s;
}
</style>