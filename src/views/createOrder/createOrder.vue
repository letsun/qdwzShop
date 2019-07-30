<template>
	<div>
		<nav-header back="true">
			<div class="title" slot="title">提交订单</div>
		</nav-header>
		<div class="scroll-wrapper" ref="scrollWrapper">
			<div class="wrapper">

				<div class="delivery-type" v-if="!selfMentionFlag">
					<div class="form-key">配送方式</div>
					<div class="form-input">
						<div class="radio-group">
							<span class="radio" @click="defaultDelivery(1)"><i class="icon1 iconfont" :class="{'icon-gou': orderType === 1}"></i><span class="label">门店自提</span></span>
							<span class="radio" @click="defaultDelivery(0)"><i class="icon1 iconfont" :class="{'icon-gou': orderType === 0}"></i><span class="label">快递配送</span></span>
						</div>
					</div>
				</div>

				<!-- 默认收货地址 -->
				<div class="address-wrapper" @click="selectAddress" v-if="orderType === 0">
					<template v-if="checkedAddressInfor.id">
						<div class="receiver-infor">
							<div class="receiver">收货人：{{checkedAddressInfor.receiveName}}</div>
							<div class="tel">{{checkedAddressInfor.receivePhone}}</div>
						</div>
						<div class="address-infor">
							<div class="key">收货地址：</div>
							<div class="value">
								<span>{{checkedAddressInfor.receiveProvince}}</span><span>{{checkedAddressInfor.receiveCity}}</span><span>{{checkedAddressInfor.receiveArea}}</span><span>{{checkedAddressInfor.receiveAddress}}</span>
							</div>
						</div>
					</template>
					<template v-else>
						<div class="address-infor">
							现在去选择一个默认地址
						</div>
					</template>
					<i class="icon iconfont icon-arrow-right-copy"></i>
				</div>

				<!-- 默认自提地址 -->
				<div class="address-wrapper" v-if="orderType === 1">
					<template>
						<div class="receiver-infor">
							<div class="receiver">姓名：{{addressInfor.contactName}}</div>
							<div class="tel">{{addressInfor.mobile}}</div>
						</div>
						<div class="address-infor">
							<div class="key">自提地址：</div>
							<div class="value">
								<span>{{addressInfor.address}}</span>
							</div>
						</div>
						<div class="address-tip">注：下单成功后请到该地址提货</div>
					</template>
				</div>
				
				<!-- 商品列表 -->
				<div class="order-wrapper">
					<pro-list :productList="productList" :isCart="$route.query.isCart"></pro-list>
					<div class="order-infor">
						共{{productAmount}}件商品 <template v-if="goodsType === 0">{{totalMoney - freight | currency('￥')}}元</template><template v-else>{{totalScore}}积分</template> 运费：{{freight | currency('￥')}}元
					</div>
				</div>

				
				<!-- 积分抵扣 -->
				<div class="coupon-wrapper" v-if="goodsType !== 1">
					<integral-list ref="integralList" :totalMoney="totalMoney" @minDeductionErrorEvent="showMinDeductionError" @deductionEvent="deduction" @updateCashAndIntegralEvent="updateCashAndIntegral" @cancelCouponEvent="cancelCoupon" @errorEvent="showError"></integral-list>
				</div>
				
				<!-- 优惠券 -->
				<div class="coupon-wrapper" v-if="goodsType !== 1">
					<coupon-list ref="couponList" :totalMoney="totalMoney" @updateCashAndCouponEvent="updateCashAndCoupon" @cancelIntegralListEvent="cancelIntegral" @errorEvent="showError"></coupon-list>
				</div>

			</div>
		</div>

		<!-- 底部控制栏 -->
		<bottom-controls v-if="goodsType === 0" pageType="createOrder" :price="payMoney" :totalScore="totalScore" :goodsType="goodsType" :checkCount="addressCount" @clickEvent="payMent">
			{{isClickedPayMent ? '正在结算...': '结算'}}
		</bottom-controls>

		<bottom-controls v-else pageType="createOrder" :price="payMoney" :totalScore="totalScore" :goodsType="goodsType" :checkCount="addressCount" @clickEvent="showConfirmExchange">
			{{isClickedPayMent ? '正在兑换...': '兑换'}}
		</bottom-controls>
		
		<!-- 微信支付后获取订单状态的加载 -->
		<paymented-Loading :payMentedLoading="payMentedLoading" :countdownTip="countdownTip"></paymented-Loading>
		
		<!-- 弹窗 -->
		<model-win :show="showModel">
			<template slot="content">
				<span v-html="errorTip"></span>
			</template>
			<template slot="btn">
				<template  v-if="isConfirm">
					<a href="javascript:void(0);" class="btn" @click="closeModelWin">取消</a>
					<a href="javascript:void(0);" class="btn btn-last" @click="okModelWin(okType)">确定</a>
				</template>
				<template  v-else>
					<a href="javascript:void(0);" class="btn" @click="closeModelWin">确定</a>
				</template>
			</template>
		</model-win>

		<transition name="fade">
			<waiting-tip v-show="isClickedPayMent">
				正在提交中
			</waiting-tip>
		</transition>

		<!-- 页面加载状态 -->
		<transition name="fade">
			<loading-page v-if="!isLoadCompleted"></loading-page>
		</transition>

	</div>
</template>

<script>
	// 插件
	import BetterScroll from 'better-scroll';
	

	// 组件
	import NavHeader from '@/components/navHeader/navHeader';
	import ProList from '@/components/proList/proList';
	import IntegralList from '@/components/integralList/integralList';
	import CouponList from '@/components/couponList/couponList';
	import BottomControls from '@/components/bottomControls/bottomControls';
	import ModelWin from '@/components/modelWin/modelWin';
	import LoadingPage from '@/components/loadingPage/loadingPage';
	import PaymentedLoading from '@/components/payMentedLoading/payMentedLoading';
	import WaitingTip from '@/components/waitingTip/waitingTip';

	import api from '@/util/api';
	import currency from '@/util/currency';
	import goWxPay from '@/util/goWxPay';
	import setUserSessionInfor from '@/util/setUserSessionInfor';
	import util from '@/util/util';
	import statusCode from '@/util/statusCode';

	// 订单备注
	const ORDERREMAK = '';

	// 运费
	const FREIGHT = 0;

	// 订单类型,送货上门
	const ORDERTYPE_SENDTO_HOME = 0;

	// 订单类型,门店自提
	const ORDERTYPE_SHOP_AUTO_GET = 1;

	// 支付类型
	const PAYTYPE = 1;

	// 现金商品
	const GOODS_TYPE_CARD = 0; 

	// 积分商品
	const GOODS_TYPE_SCORE = 1;

	// 微信支付
	const PAY_TYPE_WECHAT = 1;

	// 微信支付 + 积分支付
	const PAY_TYPE_WECHAT_SCORE = 4;

	// 积分支付
	const PAY_TYPE_SCORE = 5;

	// 微信支付 + 优惠券
	const PAY_TYPE_WECHAT_COUPON = 6;

	export default {
		components: {
			NavHeader,
			ProList,
			IntegralList,
			BottomControls,
			ModelWin,
			LoadingPage,
			CouponList,
			PaymentedLoading,
			WaitingTip
		},
		data() {
			return {
				scroll: null,
				query: {},
				productList: [],
				checkedAddressInfor: {},
				addressCount: 1,
				freight: 0,
				errorTip: '',
				showModel: false,
				isConfirm: false,
				okType: '',
				isRouter: false,
				discountMoney: 0,
				isCashAndIntegral: false,
				isCashAndCoupon: false,
				payScore: 0,
				couponMoney: 0,
				couponId: 0,
				isLoadCompleted: false,
				isClickedPayMent: false,
				payMentedLoading: false,
				countdownTip: 5,
				result: 1,
                orderType: 0,
                selfMentionFlag: '',
			}
		},
		mounted() {
			this.$nextTick(async () => {

				// 收集参数
                if (this.$route.query.goodsId) {
                	this.query.goodsId = this.$route.query.goodsId;
                }

                if (this.$route.query.amount) {
                	this.query.amount = this.$route.query.amount;
                }

                if (this.$route.query.isCart) {
                	this.query.isCart = this.$route.query.isCart;
                }

				await this.initAddress();
				await this.initProductList();
				await this.initFreight();

				this.initScroll();
				util.commonFunc(this);
				// this.checkOrder();
                if (this.orderType == 1) {
                    this.addressCount = 1;
                } else if (this.orderType == 0 && !this.checkedAddressInfor.id) {
                    this.addressCount = 0;
				}
			});
		},
		computed: {
			getHeaders() {
				return this.$store.getters.getHeaders;
			},
			mallType() {
				return this.$store.state.mallType;
			},
			payMoney() {
				let payMoney = 0;

				if (this.isCashAndIntegral) {
					payMoney = this.totalMoney - this.discountMoney;
				} else if (this.isCashAndCoupon) {
					
					if (this.totalMoney >= this.couponMoney2) {
						payMoney = this.totalMoney - this.couponMoney;
					} else {
						payMoney = this.totalMoney;
					}
					
				} else {
					payMoney = this.totalMoney;
				}

				return parseFloat(payMoney.toFixed(2));
			},
			totalMoney() {
				let total = 0;

				for (let i = 0, len = this.productList.length; i < len; i++) {
					total += this.productList[i].amount * this.productList[i].goodsSalePrice;
				}
				return total + this.freight;
			},
			productAmount() {
				let amount = 0;

				for (let i = 0, len = this.productList.length; i < len; i++) {
					amount += this.productList[i].amount;
				}

				return amount;
			},
			totalScore() {
				let total = 0;

				for (let i = 0, len = this.productList.length; i < len; i++) {
					total += this.productList[i].amount * this.productList[i].goodsScore;
				}

				return total;
			},
			myScore() {
				return this.$store.state.balanceScore;
			},
			orderProduct() {
				let orderProduct = [];

				for (let i = 0, len = this.productList.length; i < len; i++) {
					let orderProductObject = {};
					orderProductObject.goodsId = this.productList[i].goodsId;
					orderProductObject.amount = this.productList[i].amount;
					orderProduct.push(orderProductObject);
				}

				console.log(orderProduct);

				return orderProduct;
			},
			goodsType() {
				let goodsType = 0;
				for (let i = 0, len = this.productList.length; i < len; i++) {
					goodsType = this.productList[i].goodsType;
				}

				return goodsType;
			},
			isContainer() {
				let isContainer = 0;

				for (let i = 0, len = this.productList.length; i < len; i++) {
					isContainer = this.productList[i].isopenContainer;
				}

				return isContainer;
			},
			goodsInfo() {
				let goodsInfo = [];

				for (let i = 0, len = this.productList.length; i < len; i++) {
					goodsInfo.push(this.productList[i].goodsId + ',' + this.productList[i].amount);
				}

				return goodsInfo.join('@');
			}
		},
		methods: {
			initScroll() {
				this.scroll = new BetterScroll(this.$refs.scrollWrapper, {
					scrollbar: {
						fade: true
					},
					click: true
				});
			},
            defaultDelivery(val) {
                this.orderType = val;

				if (this.orderType == 0 && !this.checkedAddressInfor.id) {
                    this.addressCount = 0;
				} else if (this.orderType == 1) {
                    this.addressCount = 1;
				}
            },
			initAddress() {

				return new Promise((resolve, reject) => {
					this.$http.get(api.address.getDefaultAddress).then((response) => {
						let res = response.data;
						if (res.code === statusCode.SUCCESS) {

							this.checkedAddressInfor = res.data ? res.data : {};

							if (this.checkedAddressInfor.id) {
								this.addressCount = 1;
							}

						} else {
							util.checkStatus(this, res, {}, this.initAddress);
	                    }

	                    resolve();
					});
				});
			},
			initFreight() {
				if (typeof this.checkedAddressInfor.id === 'undefined') {
					return;
				}

				return new Promise((resolve, reject) => {
					this.$http.get(api.order.getGoodssFreight, {
						params: {
							city: this.checkedAddressInfor.receiveCity,
							province: this.checkedAddressInfor.receiveProvince,
							goodssInfo: this.goodsInfo
						}
					}).then((response) => {
						let res = response.data;
						if (res.code === statusCode.SUCCESS) {
							this.freight = res.data;
						} else {

							util.checkStatus(this, res, {}, this.initAddress);
	                        
	                    }

	                    resolve();

					});
				});
			},
			initProductList() {
				let url = '';
				if (this.query.isCart === 'cart') {
					url = api.cart.getGoodsListByCart;
				} else {
					url = api.order.getGoodsListById;
				}
				
				return new Promise((resolve, reject) => {
					this.$http.get(url, {
						params: {
							goodsId: this.$route.query.goodsId,
							amount: this.$route.query.amount
						}
					}).then((response) => {
						let res = response.data;

						if (res.code === statusCode.SUCCESS) {
							this.isLoadCompleted = true;
							this.productList = res.data.goodsList;
							this.selfMentionFlag = res.data.selfMentionFlag;
							this.addressInfor = res.data.address;
							console.log(this.productList);
						} else {
	                        
	                        util.checkStatus(this, res, {}, this.initProductList);

	                    }

	                    resolve();

					});
				});
			},
			showConfirmExchange() {

				if (typeof this.checkedAddressInfor.id === 'undefined') {
					this.isConfirm = false;
					this.showModel = true;
					this.errorTip = '请选择收货地址';
					return;
				}

				if (this.goodsType === 1 && this.myScore < this.totalScore) {
					this.isConfirm = false;
					this.showModel = true;
					this.errorTip = '您的积分余额不足';
					return;
				}

				this.showModel = true;
				this.isConfirm = true;
				this.okType = this.payMent;

				this.errorTip = `您当前有${this.myScore}积分<br />是否花费${this.totalScore}积分来兑换此商品？`;
			},
			payMent() {
				if (this.orderType == 0 && typeof this.checkedAddressInfor.id == 'undefined') {
                    this.isConfirm = false;
                    this.showModel = true;
                    this.errorTip = '请选择收货地址';
                    return;
                }

                if (this.orderType == 1) {
                    this.checkedAddressInfor.id = 0;
                }

				if (this.isClickedPayMent) {
					return;
				}

				this.isClickedPayMent = true;
				// 现金和积分都要提交的参数
				let params = {
					freight: this.freight,
					goodsList: this.orderProduct,
					goodsTotal: this.orderProduct.length,
					mallType: this.mallType,
					orderRemark: ORDERREMAK,
					orderType: this.orderType,
					receiveAddrId: this.checkedAddressInfor.id,
                    orderCategory: 0,
				};

				// 区别现金和积分商品的参数，0：现金商品，1为积分商品
				if (this.goodsType === GOODS_TYPE_CARD) {
					params.payMoney = parseFloat(this.payMoney.toFixed(2));
					params.totalMoney = this.totalMoney;

					// 是否是货柜商品
					params.isContainer = this.isContainer;

					// 货柜编号为1表示是货柜商品
					if (this.isContainer === 1) {
						// 货柜商品订单类型是门店自提
						params.orderType = 1;
					}

					if (this.isCashAndIntegral) {
						// 现金+积分
						params.payType = PAY_TYPE_WECHAT_SCORE;
						params.payScore = this.payScore;
						params.exchangeMoney = this.discountMoney;
					} else if (this.isCashAndCoupon) {
						// 现金+优惠券
						params.payType = PAY_TYPE_WECHAT_COUPON;
						params.couponId = this.couponId;
						params.couponMoney = this.couponMoney;
						params.exchangeMoney = this.discountMoney;
					} else {
						// 纯微信支付
						params.payType = PAY_TYPE_WECHAT;
					}
					
				} else if (this.goodsType === GOODS_TYPE_SCORE) {
					params.payScore = this.totalScore;
					
					// 纯积分支付
					params.payType = PAY_TYPE_SCORE; 
				}

				// 提交订单
				this.$http.post(api.order.createOrder, params).then((response) => {
					let res = response.data;
					if (res.code === statusCode.SUCCESS) {

						// 判断商品类型
						if (this.goodsType === GOODS_TYPE_SCORE) {
								this.isConfirm = false;
								this.showModel = false;
								setUserSessionInfor(this.$store, this.$store, true);
								this.$store.commit('updateDirection', 'left');
								this.$router.push({path: '/exchangeSuccess'});
						} else {

							if (res.data.isPayFlag === 1) {

								// isPayFlag为1时，表示需要支付
								goWxPay(this.$http, res.data.orderId, this.getHeaders).then((status) => {
									if (status === 'ok') {
										// 支付成功
										this.payMentedLoading = true;
										this.setCountdown().then(() => {
											this.payMentSuccess(res.data.orderId);
										});

									} else {

										// 其它情况下
										if (status === 'cancel') {
											this.$store.commit('updateDirection', 'left');
											this.$router.push({path: '/waitPayment'});
										} else {
											if (status === 'fail') {
												this.errorTip = '支付失败';
											} else if (status === 'exception') {
												this.errorTip = '支付异常';
											}
											this.isRouter = true;
											this.showModel = true;
											this.isConfirm = false;
											this.isClickedPayMent = false;
										}
									}
								}).catch((err) => {
									this.errorTip = err;
									this.showModel = true;
									this.isConfirm = false;
									this.isRouter = true;
								});

							} else if (res.data.isPayFlag === 0) {

								// isPayFlag为0时，表示不需要支付
								this.payMentSuccess(res.data.orderId);
							}
						}
					} else {

						this.isClickedPayMent = false;
						this.isRouter = false;

						util.checkStatus(this, res, {}, this.payMent);
                        
                    }
				});
			},
			closeModelWin() {
				this.showModel = false;
				this.isConfirm = false;

				if (this.isRouter) {
					this.$store.commit('updateDirection', 'left');
					this.$router.push({path: '/waitPayment'});
				}
			},
			okModelWin(type) {
				type();
			},
			selectAddress() {
				this.$store.commit('updateDirection', 'left');
				this.query.redirectUrl = '/createOrder';
				this.$router.push({path: '/address', query: this.query});
			},
			showMinDeductionError(msg) {
				this.showModel = true;
				this.isConfirm = false;
				this.errorTip = msg;
			},
			deduction(deductMoney, deductScore) {
				this.discountMoney = deductMoney;
				this.payScore = deductScore;
			},

			updateCashAndIntegral(status) {
				if (status === 0) {
					this.isCashAndIntegral = false;
				} else {
					this.isCashAndIntegral = true;
				}
			},
			cancelIntegral() {
				this.$refs.integralList.cancelIntegral();
			},
			updateCashAndCoupon(status, couponId, couponMoney,couponMoney2) {
				if (this.totalMoney >= couponMoney2) {
                    if (status === 0) {
                        this.isCashAndCoupon = false;
                        this.couponId = couponId;
                        this.couponMoney = couponMoney;
                        this.couponMoney2 = couponMoney2;
                    } else {
                        this.isCashAndCoupon = true;
                        this.couponId = couponId;
                        this.couponMoney = couponMoney;
                        this.couponMoney2 = couponMoney2;
                    }
				} else {
                    this.showModel = true;
                    this.isConfirm = false;
                    this.errorTip = '优惠券不可用';
				}

			},
			cancelCoupon() {
				this.$refs.couponList.cancelCoupon();
			},
			setCountdown() {
				let timer = null;
				return new Promise((resolve, reject) => {
					timer = setInterval(() => {
						this.countdownTip--;

						if (this.countdownTip === 0) {
							clearInterval(timer);
							resolve();
						}
					}, 1000);
				});
			},
			payMentSuccess(orderId) {
				// 重新去查询订单详情
				this.$http.get(api.order.getOrderById, {
					headers: this.getHeaders,
					params: {
						orderId: orderId
					}
				}).then((response) => {
					let res = response.data;
					
					if (res.code === statusCode.SUCCESS) {
						this.payMentedLoading = false;
						this.$store.commit('updateDirection', 'left');
						this.$router.push({path: '/paymentSuccess', query: {orderId: res.data.orderList[0].orderId, status: res.data.orderList[0].status}});
					} else {

						util.checkStatus(this, res, {}, this.payMentSuccess, orderId);

					}
					
				});
			},
			refresh() {
				this.scroll.refresh();
			},
			showError(msg, okType, isConfirm = false) {
				this.showModel = true;

				if (isConfirm) {
					this.isConfirm = isConfirm;
					this.okType = okType;
				} else {
					this.isConfirm = false;
					this.okType = '';
				}
				
				this.errorTip = msg;
			},
            checkOrder () {
                this.$http.get(api.product.checkOrder).then((response) => {
                    let res = response.data;

                    if (res.code === statusCode.SUCCESS) {
                        this.result = res.data.result;
                    }
                });
            }
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "createOrder.less";
</style>