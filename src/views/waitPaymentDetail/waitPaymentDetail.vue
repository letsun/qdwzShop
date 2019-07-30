<template>
	<div>
		<nav-header back="true" clickRedirect="true" @clickEvent="back">
			<div class="title" slot="title">待付款</div>
		</nav-header>
		<div class="scroll-wrapper" ref="scrollWrapper">
			<div class="wrapper">
				<div class="countdown-wrapper">
					<div class="status-name">等待买家付款</div>
					<div class="countdown-text">{{orderCancelText}}</div>
					<div class="icon-wrapper">
						<i class="icon iconfont icon-weixinzhifu"></i>
						<span class="icon-text">微信支付</span>
					</div>
				</div>	
				<div class="address" v-if="orderType == 0">
					<address-detail v-if="containerId <= 0" :addressDetail="addressDetail"></address-detail>
				</div>
				<div class="myaddress" v-if="orderType == 1">
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
				</div>
				<div class="order">
					<order-list pageType="payMentDetail" :redirectUrl="$route.query.redirectUrl || '/waitPayment'" :orderList="orderList" pageTypeDetail="true" @cancelOrderEvent="showModelWin" @payMentEvent="payMent" ></order-list>
				</div>
			</div>
		</div>

		<div class="payMent-controls">
			<btn-group @leftClickBtnEvent="showModelWin($route.query.orderId)" @rightClickBtnEvent="payMent($route.query.orderId)">
				<template slot="btn_1">
					<i class="icon iconfont icon-lajitong"></i><span class="text">取消订单</span>
				</template>
				<template slot="btn_2">
					<i class="icon iconfont icon-goumai"></i><span class="text">{{isClickedPayMent ? '付款中..' : '去付款'}}</span>
				</template>
			</btn-group>
		</div>
	
		<!-- 弹窗 -->
		<model-win :show="showModel">
			<template slot="content">
				{{errorTip}}
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
				正在支付中
			</waiting-tip>
		</transition>

		<!-- 微信支付后获取订单状态的加载 -->
		<paymented-Loading :payMentedLoading="payMentedLoading" :countdownTip="countdownTip"></paymented-Loading>

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
	import OrderList from '@/components/orderList/orderList';
	import AddressDetail from '@/components/addressDetail/addressDetail';
	import BtnGroup from '@/components/btnGroup/btnGroup';
	import ModelWin from '@/components/modelWin/modelWin';
	import LoadingPage from '@/components/loadingPage/loadingPage';
	import PaymentedLoading from '@/components/payMentedLoading/payMentedLoading';
	import WaitingTip from '@/components/waitingTip/waitingTip';

	import api from '@/util/api';
	import goWxPay from '@/util/goWxPay';
	import util from '@/util/util';
	import statusCode from '@/util/statusCode';

	export default {
		components: {
			NavHeader,
			AddressDetail,
			OrderList,
			BtnGroup,
			ModelWin,
			LoadingPage,
			PaymentedLoading,
			WaitingTip
		},
		data() {
			return {
				orderList: [],
				addressDetail: {},
				logistics: {},
				coupon: {},
				containerId: '',
				cancelOrderId: '',
				orderMinute: 0,
				orderSecond: 0,
				errorTip: '',
				showModel: false,
				isConfirm: false,
				okType: '',
				isRouter: false,
				isLoadCompleted: false,
				isClickedPayMent: false,
				payMentedLoading: false,
				countdownTip: 5,
				countdownTimer: null,
                orderType:1,
                addressInfor: {},
			}
		},
		mounted() {
			this.$nextTick(() => {
				this.initOrderList();
				
				this.initScroll();
				util.commonFunc(this);
			});
		},
		computed: {
			getHeaders() {
				return this.$store.getters.getHeaders;
			},
			orderCancelText() {
				let orderMinute = `${this.orderMinute}`.length === 2 ? `${this.orderMinute}` : `0${this.orderMinute}`
				let orderSecond = `${this.orderSecond}`.length === 2 ? `${this.orderSecond}` : `0${this.orderSecond}`

				return `剩${orderMinute}分${orderSecond}秒自动关闭`;
			}
		},
		methods: {
			initScroll() {
				var scroll = new BetterScroll(this.$refs.scrollWrapper, {
					scrollbar: {
						fade: true
					},
					click: true
				});
			},
			initOrderList() {
				this.$http.get(api.order.getOrderById, {
					headers: this.getHeaders,
					params: {
						orderId: this.$route.query.orderId,
					}
				}).then((response) => {
					let res = response.data;

					if (res.code === statusCode.SUCCESS) {
						this.orderList = res.data.orderList;

						this.containerId = res.data.orderList[0].containerId;
						this.orderMinute = res.data.orderList[0].orderCancelTime.split(':')[0];
						this.orderSecond = res.data.orderList[0].orderCancelTime.split(':')[1];
						this.orderType = res.data.orderList[0].orderType;

						this.isLoadCompleted = true;

						this.addressDetail = res.data.receiveAddr;

						this.logistics = res.data.logistics;
                        this.addressInfor = res.data.address;
						this.coupon = res.data.coupon;

						if (this.orderList[0].status != 5) {
							this.listenOrderCancel();
						} else {
							this.$store.commit('updateDirection', 'right');
							this.$router.push({
								path: '/waitPayment'
							});
						}
					} else {

						util.checkStatus(this, res, {}, this.initOrderList);
					}
				});
			},
			closeModelWin() {
				this.showModel = false;
				this.isConfirm = false;

				if (this.isRouter) {
					this.$router.push({
						path: this.$route.query.redirectUrl
					});
				}
			},
			okModelWin(type) {
				type();
			},
			showModelWin(orderId) {

				if (this.isClickedPayMent) {
					this.errorTip = '正在付款中，不可取消订单';
					this.showModel = true;
					this.isConfirm = false;
					return;
				}

				this.cancelOrderId = orderId;
				this.showModel = true;
				this.isConfirm = true;
				this.okType = this.cancelOrder;
				this.errorTip = '您确定要取消订单吗？';
			},
			listenOrderCancel() {

				this.countdownTimer = setInterval(() => {
					if (this.orderSecond > 0) {
						this.orderSecond--;
					} else {

						if (this.orderMinute > 0) {
							this.orderSecond = 59;
							this.orderMinute--;
						} else {
							clearInterval(this.countdownTimer);
							this.cancelOrderId = this.$route.query.orderId;
							this.cancelOrder();
						}
					}
				}, 1000);
				
			},
			cancelOrder() {
				this.$http.get(api.order.cancelOrder, {
					headers: this.getHeaders,
					params: {
						orderId: this.cancelOrderId
					}
				}).then((response) => {
					let res = response.data;

					if (res.code === statusCode.SUCCESS) {
						this.showModel = false;
						this.isConfirm = false;

						this.$store.commit('updateDirection', 'right');
						this.$router.push({
							path: this.$route.query.redirectUrl
						});
					} else {

						util.checkStatus(this, res, {}, this.cancelOrder);
						
					}
				});
			},
			payMent(orderId) {

				if (this.orderMinute == 0 && this.orderSecond <= 5) {
					this.errorTip = '订单即将失效,请勿支付';
					this.showModel = true;
					this.isConfirm = false;
					return;
				}

				if (this.isClickedPayMent) {
					
					return;
				}

				this.isClickedPayMent = true;

				goWxPay(this.$http, orderId, this.getHeaders).then((status) => {
					
					if (status === 'ok') {
						
						this.payMentedLoading = true;
						this.setCountdown().then(() => {

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
									this.isClickedPayMent = false;

									this.$store.commit('updateDirection', 'left');
									this.$router.push({path: '/paymentSuccess', query: {orderId: res.data.orderList[0].orderId, status: res.data.orderList[0].status}});
								} else {
									
									this.isClickedPayMent = false;

									util.checkStatus(this, res, {}, this.payMent, orderId);

								}
								
							});
						});

					} else {
						
						if (status !== 'cancel') {
							if (status === 'fail') {
								this.errorTip = '支付失败';
							} else if (status === 'exception') {
								this.errorTip = '支付异常';
							}
							this.showModel = true;
							this.isConfirm = false;
						}

						this.isClickedPayMent = false;
					}
				}).catch((msg) => {
					this.errorTip = msg;
					this.showModel = true;
					this.isConfirm = false;
					this.isClickedPayMent = false;
				});
				
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
			back() {
				if (this.$route.query.redirectUrl) {
					this.$router.push({
						path: this.$route.query.redirectUrl
					});
				} else {
					this.$router.push({
						path: '/waitPayment'
					});
				}
			}
		},
		destroyed() {
			clearInterval(this.countdownTimer);
			this.countdownTimer = null;
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "waitPaymentDetail.less";
</style>