(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[6],{"051b":function(t,e,n){},"267e":function(t,e,n){"use strict";var a={special:"专户产品",normal:"普通"},r={releaseNormal:"正常",releaseFail:"发布失败",releaseSuccess:"发布成功"};n.d(e,"b",(function(){return a})),n.d(e,"a",(function(){return r}))},"819d":function(t,e,n){"use strict";n.r(e);var a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("div",{staticClass:"product-detail"},[n("h2",[t._v("详情页")]),t._v(" "),n("ul",[n("li",[t._v("产品名称："+t._s(t.data.productName))]),t._v(" "),n("li",[t._v("\n      产品类型："+t._s(t.data.productType&&t.productTypeOrm[t.data.productType])+"\n    ")]),t._v(" "),n("li",[t._v("\n      产品状态："+t._s(t.data.productStatus&&t.productStatusOrm[t.data.productStatus])+"\n    ")]),t._v(" "),n("li",[t._v("产品大类："+t._s(t.data.productCategory))])]),t._v(" "),n("div",{staticClass:"line-echart",attrs:{id:"lineEchart"}})])},r=[],o=n("9523"),i=n.n(o),c=n("b802"),s=n("267e");function u(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(t);e&&(a=a.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,a)}return n}function d(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?u(Object(n),!0).forEach((function(e){i()(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):u(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}var l={data:function(){return this.productTypeOrm=s["b"],this.productStatusOrm=s["a"],{data:{}}},created:function(){var t=this,e=this.$route.params;e=void 0===e?{}:e;var n=e.id;c["a"].fetch({method:"get",url:"/api/product/".concat(n)}).then((function(e){t.data=d(d({},t.data),e.data)}))},mounted:function(){this.drawLineEchart()},methods:{drawLineEchart:function(){var t=this.$echarts.init(document.getElementById("lineEchart")),e={tooltip:{trigger:"axis"},legend:{data:["基金1","基金2","基金3","基金4","基金5"]},grid:{left:"3%",right:"4%",bottom:"3%",containLabel:!0},toolbox:{feature:{saveAsImage:{}}},xAxis:{type:"category",boundaryGap:!1,data:["周一","周二","周三","周四","周五","周六","周日"]},yAxis:{type:"value"},series:[{name:"基金1",type:"line",stack:"Total",data:[120,132,101,134,90,230,210]},{name:"基金2",type:"line",stack:"Total",data:[220,182,191,234,290,330,310]},{name:"基金3",type:"line",stack:"Total",data:[150,232,201,154,190,330,410]},{name:"基金4",type:"line",stack:"Total",data:[320,332,301,334,390,330,320]},{name:"基金5",type:"line",stack:"Total",data:[820,932,901,934,1290,1330,1320]}]};t.setOption(e)}}},p=l,f=(n("9bba"),n("b6c4")),b=Object(f["a"])(p,a,r,!1,null,null,null);e["default"]=b.exports},"9bba":function(t,e,n){"use strict";n("051b")},b6c4:function(t,e,n){"use strict";function a(t,e,n,a,r,o,i,c){var s,u="function"===typeof t?t.options:t;if(e&&(u.render=e,u.staticRenderFns=n,u._compiled=!0),a&&(u.functional=!0),o&&(u._scopeId="data-v-"+o),i?(s=function(t){t=t||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext,t||"undefined"===typeof __VUE_SSR_CONTEXT__||(t=__VUE_SSR_CONTEXT__),r&&r.call(this,t),t&&t._registeredComponents&&t._registeredComponents.add(i)},u._ssrRegister=s):r&&(s=c?function(){r.call(this,(u.functional?this.parent:this).$root.$options.shadowRoot)}:r),s)if(u.functional){u._injectStyles=s;var d=u.render;u.render=function(t,e){return s.call(e),d(t,e)}}else{var l=u.beforeCreate;u.beforeCreate=l?[].concat(l,s):[s]}return{exports:t,options:u}}n.d(e,"a",(function(){return a}))}}]);