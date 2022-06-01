import { initRouter, initRouterLayout } from '@hsui/core'

export default initRouter(
  [
    {
      path: '/',
      component: initRouterLayout(layout => {
        return import('@/layouts/' + layout + '.vue')
      }),
      children: [
        {
          name: 'index',
          path: '',
          component: Index
        },
        {
          name: 'product-index',
          path: 'product',
          component: ProductIndex
        },
        {
          name: 'purchase-index',
          path: 'purchase',
          component: PurchaseIndex
        },
        {
          name: 'redemption-index',
          path: 'redemption',
          component: RedemptionIndex
        },
        {
          name: 'user-index',
          path: 'user',
          component: UserIndex
        },
        {
          name: 'business-assert',
          path: 'business/assert',
          component: BusinessAssert
        },
        {
          name: 'business-flowQuery',
          path: 'business/flowQuery',
          component: BusinessFlowQuery
        },
        {
          name: 'business-transInquiry',
          path: 'business/transInquiry',
          component: BusinessTransInquiry
        },
        {
          name: 'liquidate-calculate',
          path: 'liquidate/calculate',
          component: LiquidateCalculate
        },
        {
          name: 'liquidate-initialize',
          path: 'liquidate/initialize',
          component: LiquidateInitialize
        },
        {
          name: 'liquidate-update',
          path: 'liquidate/update',
          component: LiquidateUpdate
        },
        {
          name: 'product-trend',
          path: 'product/trend',
          component: ProductTrend
        },
        {
          name: 'purchase-transInquiry',
          path: 'purchase/transInquiry',
          component: PurchaseTransInquiry
        },
        {
          name: 'redemption-transInquiry',
          path: 'redemption/transInquiry',
          component: RedemptionTransInquiry
        },
        {
          name: 'user-createAccount',
          path: 'user/createAccount',
          component: UserCreateAccount
        },
        {
          name: 'user-riskAssess',
          path: 'user/riskAssess',
          component: UserRiskAssess
        },
        {
          name: 'product-id',
          path: 'product/:id?',
          component: ProductId
        },
        {
          name: 'user-id',
          path: 'user/:id?',
          component: UserId
        },
        {
          name: '__404__',
          path: '*',
          component: __404__
        }
      ]
    }
  ],
  { base: '/', mode: 'hash' }
)

function Index() {
  return import(/* webpackChunkName: "index" */ '@/views/index.vue')
}
function ProductIndex() {
  return import(
    /* webpackChunkName: "product-index" */ '@/views/product/index.vue'
  )
}
function PurchaseIndex() {
  return import(
    /* webpackChunkName: "purchase-index" */ '@/views/purchase/index.vue'
  )
}
function RedemptionIndex() {
  return import(
    /* webpackChunkName: "redemption-index" */ '@/views/redemption/index.vue'
  )
}
function UserIndex() {
  return import(/* webpackChunkName: "user-index" */ '@/views/user/index.vue')
}
function BusinessAssert() {
  return import(
    /* webpackChunkName: "business-assert" */ '@/views/business/assert.vue'
  )
}
function BusinessFlowQuery() {
  return import(
    /* webpackChunkName: "business-flowQuery" */ '@/views/business/flowQuery.vue'
  )
}
function BusinessTransInquiry() {
  return import(
    /* webpackChunkName: "business-transInquiry" */ '@/views/business/transInquiry.vue'
  )
}
function LiquidateCalculate() {
  return import(
    /* webpackChunkName: "liquidate-calculate" */ '@/views/liquidate/calculate.vue'
  )
}
function LiquidateInitialize() {
  return import(
    /* webpackChunkName: "liquidate-initialize" */ '@/views/liquidate/initialize.vue'
  )
}
function LiquidateUpdate() {
  return import(
    /* webpackChunkName: "liquidate-update" */ '@/views/liquidate/update.vue'
  )
}
function ProductTrend() {
  return import(
    /* webpackChunkName: "product-trend" */ '@/views/product/trend.vue'
  )
}
function PurchaseTransInquiry() {
  return import(
    /* webpackChunkName: "purchase-transInquiry" */ '@/views/purchase/transInquiry.vue'
  )
}
function RedemptionTransInquiry() {
  return import(
    /* webpackChunkName: "redemption-transInquiry" */ '@/views/redemption/transInquiry.vue'
  )
}
function UserCreateAccount() {
  return import(
    /* webpackChunkName: "user-createAccount" */ '@/views/user/createAccount.vue'
  )
}
function UserRiskAssess() {
  return import(
    /* webpackChunkName: "user-riskAssess" */ '@/views/user/riskAssess.vue'
  )
}
function ProductId() {
  return import(/* webpackChunkName: "product-id" */ '@/views/product/_id.vue')
}
function UserId() {
  return import(/* webpackChunkName: "user-id" */ '@/views/user/_id.vue')
}
function __404__() {
  return import(/* webpackChunkName: "__404__" */ '@/views/__404__.vue')
}
