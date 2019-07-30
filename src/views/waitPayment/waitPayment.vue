<template>
	<div>
		<nav-header back="true" clickRedirect="true" @clickEvent="back">
			<div class="title" slot="title">待付款</div>
		</nav-header>
		<div class="scroll-wrapper" ref="scrollWrapper">
			<div class="wrapper">
				<order-list ref="orderList" pageType="payMent" :orderList="orderList" :isClickedPayMent="isClickedPayMent" detailPath="/waitPaymentDetail" @cancelOrderEvent="showModelWin" @payMentEvent="payMent"></order-list>
				<!-- 下拉加载更多 -->
				<loading-tip :loadingTip="loadingTip" :isShow="orderList.length >= pageNum" :hasNext="hasNext"></loading-tip>
			</div>
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

		<!-- 微信支付后获取订单状态的加载 -->
		<paymented-Loading :payMentedLoading="payMentedLoading" :countdownTip="countdownTip"></paymented-Loading>

		<transition name="fade">
			<div class="mask" v-if="isClickedPayMent">请稍候，正在支付中...</div>
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
	import OrderList from '@/components/orderList/orderList';
	import ModelWin from '@/components/modelWin/modelWin';
	import LoadingTip from '@/components/loadingTip/loadingTip';
	import LoadingPage from '@/components/loadingPage/loadingPage';
	import PaymentedLoading from '@/components/payMentedLoading/payMentedLoading';

	import api from '@/util/api';
	import goWxPay from '@/util/goWxPay';
	import util from '@/util/util';
	import statusCode from '@/util/statusCode';

	export default {
		components: {
			NavHeader,
			OrderList,
			ModelWin,
			LoadingTip,
			LoadingPage,
			PaymentedLoading
		},
		data() {
			return {
				orderList: [],
				cancelOrderId: '',
				errorTip: '',
				showModel: false,
				isConfirm: false,
				okType: '',
				scroll: null,
				pageNum: 3,
				pageSize: 1,
				hasNext: true,
				loadingTip: '下拉加载更多',
				isLoadCompleted: false,
				isClickedPayMent: false,
				payMentedLoading: false,
				countdownTip: 5
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
			}
		},
		updated() {
			this.finish();
		},
		methods: {
			initScroll() {
				this.scroll = new BetterScroll(this.$refs.scrollWrapper, {
					scrollbar: {
						fade: true
					},
					click: true,
					pullUpLoad: {
					  threshold: 0
					}
				});
				this.scroll.on('pullingUp', () => {
					if (this.hasNext) {
						this.pageSize++;
						this.loadingTip = '数据正在加载中....';
						
						// this.initOrderList();
					} else {
						this.loadingTip = '已经没有更多了';
					}
				});
			},
			initOrderList() {
				this.$http.get(api.order.getOrderListByStatus, {
					headers: this.getHeaders,
					params: {
						status: 1,
						pageNum: this.pageNum,
						pageSize: this.pageSize
					}
				}).then((response) => {
					let res = response.data;
					console.log(60);
					console.log(res);
					if (res.code === statusCode.SUCCESS) {
						this.hasNext = res.data.hasNext;
						this.loadingTip = '下拉加载更多';
						this.isLoadCompleted = true;
						
						this.orderList = [...this.orderList, ...res.data.orderList];

						// this.orderList = [];
					} else {

						util.checkStatus(this, res, {}, this.initOrderList);

					}
				});
			},
			closeModelWin() {
				this.isConfirm = false;
				this.showModel = false;
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
			cancelOrder() {
				
				this.isLoadCompleted = true;

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
						this.isLoadCompleted = false;
						this.orderList = [];
						this.pageSize = 1;
						this.initOrderList();
					} else {

						util.checkStatus(this, res, {}, this.cancelOrder);
						
					}
				});
			},
			payMent(orderId) {

				if (this.isClickedPayMent) {
					this.errorTip = '请稍候，正在支付中...';
					this.showModel = true;
					this.isConfirm = false;
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
			finish() {
				this.scroll.finishPullUp();
				this.scroll.refresh();
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
				this.$router.push({
					path: '/person'
				});
			}
		}
	}
</script>

<style lang="less" scoped rel="styleshett">
	@import "waitPayment.less";
</style>