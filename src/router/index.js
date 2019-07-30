import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/home/home'

import util from '@/util/util'

// users
import Person from '@/views/person/person'

// products
import Category from '@/views/category/category'
import ProductDetail from '@/views/productDetail/productDetail'
import Search from '@/views/search/search'

// order
import CreateOrder from '@/views/createOrder/createOrder'
import PaymentSuccess from '@/views/paymentSuccess/paymentSuccess'

// address
import Address from '@/views/address/address'
import EditAddress from '@/views/editAddress/editAddress'


import WaitPayment from '@/views/waitPayment/waitPayment'
import WaitPaymentDetail from '@/views/waitPaymentDetail/waitPaymentDetail'
import WaitSendGoods from '@/views/waitSendGoods/waitSendGoods'
import WaitSendGoodsDetail from '@/views/waitSendGoodsDetail/waitSendGoodsDetail'
import WaitReceiptGoods from '@/views/waitReceiptGoods/waitReceiptGoods'
import WaitReceiptGoodsDetail from '@/views/waitReceiptGoodsDetail/waitReceiptGoodsDetail'
import AllOrder from '@/views/allOrder/allOrder'
import OrderDetail from '@/views/orderDetail/orderDetail'
import SuccessOrderDetail from '@/views/successOrderDetail/successOrderDetail'

// 购物车
import Cart from '@/views/cart/cart'

import Money from '@/views/money/money'

import Coupon from '@/views/coupon/coupon'

import Integral from '@/views/integral/integral'

import ExchangeSuccess from '@/views/exchangeSuccess/exchangeSuccess'

import ErrorComponent from '@/views/error/error'


Vue.use(Router);

let router = new Router({
	mode: 'hash',
	linkActiveClass: 'active',
	routes: [{
		path: '/index',
		name: 'home',
		component: Home,
		meta: {
			keepAlive: true
		}
	}, {
		path: '/category',
		name: 'category',
		component: Category,
		meta: {
			keepAlive: false
		}
	}, {
		path: '/productDetail',
		name: 'productDetail',
		component: ProductDetail,
		meta: {
			keepAlive: false
		}
	}, {
		path: '/search',
		name: 'search',
		component: Search,
		meta: {
			keepAlive: false
		}
	}, {
		path: '/createOrder',
		name: 'createOrder',
		component: CreateOrder,
		meta: {
			keepAlive: false
		}
	}, {
		path: '/paymentSuccess',
		name: 'paymentSuccess',
		component: PaymentSuccess,
		meta: {
			keepAlive: false
		}
	}, {
		path: '/address',
		name: 'address',
		component: Address,
		meta: {
			keepAlive: false
		}
	}, {
		path: '/editAddress',
		name: 'editAddress',
		component: EditAddress,
		meta: {
			keepAlive: false
		}
	}, {
		path: '/person',
		name: 'person',
		component: Person,
		meta: {
			keepAlive: false
		}
	}, {
		path: '/cart',
		name: 'cart',
		component: Cart,
		meta: {
			keepAlive: false
		}
	}, {
		path: '/waitPayment',
		name: 'waitPayment',
		component: WaitPayment,
		meta: {
			keepAlive: false
		}
	}, {
		path: '/waitPaymentDetail',
		name: 'waitPaymentDetail',
		component: WaitPaymentDetail,
		meta: {
			keepAlive: false
		}
	}, {
		path: '/waitSendGoods',
		name: 'waitSendGoods',
		component: WaitSendGoods,
		meta: {
			keepAlive: false
		}
	}, {
		path: '/waitSendGoodsDetail',
		name: 'waitSendGoodsDetail',
		component: WaitSendGoodsDetail,
		meta: {
			keepAlive: false
		}
	}, {
		path: '/waitReceiptGoods',
		name: 'waitReceiptGoods',
		component: WaitReceiptGoods,
		meta: {
			keepAlive: false
		}
	}, {
		path: '/waitReceiptGoodsDetail',
		name: 'waitReceiptGoodsDetail',
		component: WaitReceiptGoodsDetail,
		meta: {
			keepAlive: false
		}
	}, {
		path: '/allOrder',
		name: 'allOrder',
		component: AllOrder,
		meta: {
			keepAlive: false
		}
	}, {
		path: '/orderDetail',
		name: 'orderDetail',
		component: OrderDetail,
		meta: {
			keepAlive: false
		}
	}, {
		path: '/successOrderDetail',
		name: 'successOrderDetail',
		component: SuccessOrderDetail,
		meta: {
			keepAlive: false
		}
	}, {
		path: '/money',
		name: 'money',
		component: Money,
		meta: {
			keepAlive: false
		}
	}, {
		path: '/coupon',
		name: 'coupon',
		component: Coupon,
		meta: {
			keepAlive: false
		}
	}, {
        path: '/integral',
        name: 'integral',
        component: Integral,
        meta: {
            keepAlive: false
        }
    }, {
		path: '/exchangeSuccess',
		name: 'exchangeSuccess',
		component: ExchangeSuccess,
		meta: {
			keepAlive: false
		}
	},{
		path: '/error',
		name: 'error',
		component: ErrorComponent,
		meta: {
			keepAlive: false
		}
	}, {
		path: '*',
		redirect: '/index'
	}]
});


router.beforeEach((to, from, next) => {

	let tabArr = ['home', 'category', 'cat', 'person'];
	
	// debugger;
	if (tabArr.includes(to.name)) {
		util.addPath(to.path, 0);
	} else {
		util.addPath(to.path, 1);
	}
	
	next();
});

export default router;