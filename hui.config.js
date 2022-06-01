module.exports = {
    // 应用 id
    id: "4f893310-58b1-11ec-8395-03772d74b210",
    // 应用类型
    type: "app",
    // 打开之后将使用内置的路由引擎，自动处理路由关系，否则需要手动设置路由
    autoRouting: true,
    // 设置路由前缀，通常用于部署到非根目录
    base: "/",
    // 配置路由模式
    mode: "hash",
    // 插件
    plugins: ["@hsui/plugin-lint"],
    // 代理
    proxy: {
        "/apiUser": {
            target: "http://10.20.100.75:9095",
            pathRewrite: {"^/apiUser": ""},
            ws:true,
            changeOrigin: true,
        },
        "/apiProduct": {
            target: "http://10.20.100.75:9094",
            pathRewrite: {"^/apiProduct": ""},
            ws:true,
            changeOrigin: true,
        },
        "/apiBusiness": {
            target: "http://10.20.100.75:9093",
            pathRewrite: {"^/apiBusiness": ""},
            ws:true,
            changeOrigin: true,
        },
        "/apiRtrans": {
            target: "http://10.20.100.75:9092",
            pathRewrite: {"^/apiRtrans": ""},
            ws:true,
            changeOrigin: true,
        },
        "/apiPtrans": {
            target: "http://10.20.100.75:9091",
            pathRewrite: {"^/apiPtrans": ""},
            ws:true,
            changeOrigin: true,
        },
        "/apiLiq": {
            target: "http://10.20.100.75:9090",
            pathRewrite: {"^/apiLiq": ""},
            ws:true,
            changeOrigin: true,
        },
    },
    // 设置静态资源文件打包时的相对路径
    publicPath: "/",
    // 部署配置
    see: {
        // 系统类型
        systemType: "HUI",
    },
    // 使用 Vuex 进行状态管理
    vuex: true
};