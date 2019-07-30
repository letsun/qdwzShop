<template>
	<div>
		<template v-if="orderList.length">
			<ul class="order-list">
				<li class="item" data-tagname="li" v-for="(item, index) in orderList" :key="index">
					<div class="order-header" @click="toDetail(detailPath, item.orderId, item.status)">
						<div class="order-code">订单号：<span>{{item.orderNo}}</span></div>
						<div class="order-status" v-if="pageType === 'allOrder'">
							状态:
							<span class="status" v-if="item.status === 1">待付款</span>
							<span class="status" v-if="item.status === 2">待发货</span>
							<span class="status" v-if="item.status === 3">待收货</span>
							<span class="status" v-if="item.status === 4">已完成</span>
						</div>
						
					</div>
					<div class="order-wrapper">
						<pro-list :productList="item.orderItem" :orderId="item.orderId" :redirectUrl="redirectUrl"></pro-list>
					</div>
					<div class="order-infor">
						<div class="money">
							<template v-if="item.status === 1">
								创建时间：{{item.createDate}}
							</template>
							<template v-else>
								<template v-if="item.payType !== 5">
									<template v-if="item.couponMoney">
										优惠券抵扣{{item.couponMoney | currency('￥')}}元
									</template>
									<template v-else>
										<template v-if="item.payScore">
											{{item.payScore}}积分抵扣{{item.exchangeMoney | currency('￥')}}元
										</template>
									</template>
								</template>
							</template>
						</div>
						
						<template v-if="!item.freight">共{{item.goodsTotal}}件商品</template>
						<template v-if="item.payType === 5">
							{{item.payScore}} 积分
						</template>
						<template v-else>
							{{item.payMoney | currency('￥')}} 元<template v-if="item.freight">(含运费{{item.freight | currency('￥')}})</template>
						</template>

					</div>
					<div class="order-controls" v-if="pageType === 'payMent'">

						<a href="javascript:void(0);" @click="cancelOrder(item.orderId)">取消订单</a>
						<a href="javascript:void(0);" @click="toDetail(detailPath, item.orderId, item.status)">
							去付款
							<!-- <template v-if="item.orderId === currentOrderId">
								{{isClickedPayMent ? '付款中..' : '去付款'}}
							</template>
							<template v-else>
								去付款
							</template> -->
						</a>
					</div>
					<div class="order-controls" v-if="pageType === 'receiptGoods'">
						<a class="confirm-receipt" href="javascript:void(0);"  @click="showConfirm(item.orderId)">确认收货</a>
					</div>
				</li>
			</ul>
		</template>
		<template v-else>
			<div class="no-order-wrapper">
				<no-record iconType="noRecord" text="暂无订单"></no-record>
			</div>
		</template>
	</div>
</template>

<script>
	// 组件
	import ProList from '@/components/proList/proList';
	import noRecord from '@/components/noRecord/noRecord';

	export default {
		components: {
			ProList,
			noRecord,
		},
		props: {
			pageType: {
				type: String,
				default: ''
			},
			pageTypeDetail: {
				type: String,
				default: ''
			},
			orderList: {
				type: Array,
				default() {
					return [];
				}
			},
			redirectUrl: {
				type: String,
				default: ''
			},
			coupon: {
				type: Object,
				default() {
					return {}
				}
			},
			isClickedPayMent: {
				type: Boolean,
				default: false
			},
			detailPath: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				currentOrderId: ''
			}
		},
		computed: {

		},
		mounted() {
			// console.log(this.orderList);
		},
		methods: {
			cancelOrder(orderId) {
				this.$emit('cancelOrderEvent', orderId);
			},
			payMent(orderId) {
				this.currentOrderId = orderId;
				this.$emit('payMentEvent', orderId);
			},
			toDetail(path, orderId, status) {

				if (this.pageTypeDetail === 'true') {
					return;
				}

				if (typeof path === 'undefined') {
					path = path;
				} else {
					if (status === 1) {
						path = '/waitPaymentDetail';
					} else if (status === 2) {
						path = '/waitSendGoodsDetail';
					} else if (status === 3) {
						path = '/waitReceiptGoodsDetail';
					} else if (status === 4) {
						path = '/successOrderDetail';
					}
				}

				console.log(path);

				let redirectUrl = '';

				if (this.pageType === 'allOrder') {
					redirectUrl = '/allOrder';
				} else if (this.pageType === 'payMent') {
					redirectUrl = '/waitPayment';
				} else if (this.pageType === 'receiptGoods') {
					redirectUrl = '/waitReceiptGoods';
				} else if (this.pageType === 'sendGoods') {
					redirectUrl = '/waitSendGoods';	
				}

				this.$store.commit('updateDirection', 'left');
				this.$router.push({
					path: path,
					query: {
						orderId: orderId,
						redirectUrl: redirectUrl
					}
				});
			},
			showConfirm(orderId) {
				this.$emit('showConfirmEvent', orderId);
			}
		}
	}
</script>

<style scoped lang="less" rel="stylesheet">
	@import "orderList.less";
</style>