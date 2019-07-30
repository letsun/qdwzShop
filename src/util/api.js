// let ip = 'http://192.168.1.8:8085/qdwz';
import ipAddress from '@/util/ipAddress';

let ip = `${ipAddress}/qdwz`;

const api = {
	home: {
		slide: `${ip}/adv/getAll`, 										// 获取首页轮播图
		floor: `${ip}/floor/findAll`, 									// 获取所有楼层
		getFloorById: `${ip}/floor/getFloorById` 						// 获取某个楼层
	},
	users: {
		userInfor: `${ip}/consume/getConsume`
	},
	product: {
		categoryType: `${ip}/goods/findGoodsCategory`, 					// 获取所有商品分类
		goodsList: `${ip}/goods/findGoods`, 							// 获取商品列表
		goodsDetail: `${ip}/goods/getGoodsById`, 						// 获取商品详情
		getFreightRange: `${ip}/freightTemp/getFreightRange`, 			// 获取商品运费范围
		search: `${ip}/goods/search`, 									// 商品搜索
        checkOrder: `${ip}/order/checkOrder`, 							// 校验用户当日是否购买特价订单
        findShareParams: `${ip}/goodShare/findShareParams`, 							// 商品详细自定义分享接口
	},
	cart: {
		cartList: `${ip}/cart/findCart`,     							// 获取购物车列表
		updateCart: `${ip}/cart/upCart`,    							// 修改购物车数据
		delCart: `${ip}/cart/delCart`,     								// 删除购物车数据
		addCart: `${ip}/cart/addCart`,    								// 添加到购物车
		getGoodsListByCart: `${ip}/cart/orderConfirm`,     				// 从购物车中获取商品到确认订单列表
	},
	address: {
		addAddress: `${ip}/receive/addReceive`,    						// 添加地址
		addressList: `${ip}/receive/findReceive`,   					// 获取所有地址
        upReceive: `${ip}/receive/upReceive`,    						// 修改收货地址
		delAddress: `${ip}/receive/delReceive`,    						// 删除地址
		submitDefault: `${ip}/receive/setDefault`,    					// 设置默认收货地址
		getDefaultAddress: `${ip}/receive/getIsDefault`    				// 设置默认收货地址
	},
	order: {
		createOrder: `${ip}/order/addOrder`,							// 提交订单
		getGoodsListById: `${ip}/order/orderConfirm`,					// 获取确认订单的商品列表
		getOrderListByStatus: `${ip}/order/findOrderByConsumerId`,		// 根据订单状态获取订单列表
		getOrderById: `${ip}/order/getOrderById`,						// 根据订单ID获取订单详情
		cancelOrder: `${ip}/order/cancelOrder`,							// 取消订单
		getOrderCount: `${ip}/order/getOrderCount`,						// 获取订单数量
		confirmOrder: `${ip}/order/confirmOrder`,						// 确认收货
		payMent: `${ip}/wechat/wxgopay`,								// 调起微信支付
		getGoodssFreight: `${ip}/freightTemp/getGoodssFreight`			// 获取运费信息
	},
	discount: {
		paySet: `${ip}/paySet/paySet`									// 积分设置
	},
	coupon:{
        findCoupon: `${ip}/coupon/findCoupon`,							// 获取优惠券列表
	},
    integral:{
        findScoreList: `${ip}/score/scoreRecord`,							// 获取积分记录
    },
	company: {
		getCompInfo: `${ip}/company/getCompInfo`						// 获取企业信息
	}
};

export default api;