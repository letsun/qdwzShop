<template>
	<div>
		<nav-header>
			<div class="title" slot="title">个人中心</div>
		</nav-header>
		<div class="wrapper">
			<div class="person-header">
				<div class="person-infor">
					<img :src="headimgurl" class="avatar" />
					<div class="nickname">{{nickname}}</div>
				</div>
			</div>
			<div class="scroll-wrapper" ref="scrollWrapper">
				<div class="person-detail">
					<div class="my-order">
						<div class="title"><i class="icon iconfont icon-dingdan"></i>我的订单</div>
						<ul class="list">
							<li class="item">
								<a href="javascript:void(0)" @click="toOrder('/waitPayment')">
									<i class="icon iconfont icon-daifukuanb"></i>
									<span class="number" v-if="waitPaymentNumber">{{waitPaymentNumber}}</span>
									<div class="name">待付款</div>
								</a>
							</li>
							<li class="item">
								<a href="javascript:void(0)" @click="toOrder('/waitSendGoods')">
									<i class="icon iconfont icon-daifahuo1"></i>
									<span class="number" v-if="waitSendGoodsNumber">{{waitSendGoodsNumber}}</span>
									<div class="name">待发货</div>
								</a>
							</li>
							<li class="item">
								<a href="javascript:void(0)" @click="toOrder('/waitReceiptGoods')">
									<i class="icon iconfont icon-daishouhuofuben"></i>
									<span class="number" v-if="waitReceiptNumber">{{waitReceiptNumber}}</span>
									<div class="name">待收货</div>
								</a>
							</li>
							<li class="item">
								<a href="javascript:void(0)" @click="toOrder('/allOrder')">
									<i class="icon iconfont icon-dingdan1"></i>
									<div class="name">全部订单</div>
								</a>
							</li>
						</ul>
					</div>
					<ul class="person-list">
						<li class="person-item"@click="toIntegral" v-if="balanceScore">
							<i class="icon iconfont icon-jinbi"></i>
							<div class="person-right">
								<div class="person-title">我的积分</div>
								<div class="my-pengbi">{{balanceScore}}</div>
								<i class="person-icon iconfont icon-arrow-right-copy"></i>
							</div>
						</li>
						<li class="person-item" @click="toAddress">
							<i class="icon iconfont icon-myaddress"></i>
							<div class="person-right">
								<div class="person-title">我的地址</div>
								<i class="person-icon iconfont icon-arrow-right-copy"></i>
							</div>
						</li>
						<li class="person-item" @click="toCoupon">
							<i class="icon iconfont icon-youhuiquan"></i>
							<div class="person-right">
								<div class="person-title">我的优惠券</div>
								<i class="person-icon iconfont icon-arrow-right-copy"></i>
							</div>
						</li>
					</ul>
				</div>
			</div>
			<!-- 页面加载状态 -->
			<transition name="fade">
				<loading-page v-if="!isLoadCompleted" page="noTop"></loading-page>
			</transition>
		</div>

		<nav-footer></nav-footer>

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

		

	</div>
</template>
<script>
	// 插件
	import BetterScroll from 'better-scroll';

	// 组件
	import NavHeader from '@/components/navHeader/navHeader';
	import NavFooter from '@/components/navFooter/navFooter';
	import ModelWin from '@/components/modelWin/modelWin';
	import LoadingPage from '@/components/loadingPage/loadingPage';

	import api from '@/util/api';
	import util from '@/util/util';
	import statusCode from '@/util/statusCode';

	export default {
		components: {
			NavHeader,
			NavFooter,
			ModelWin,
			LoadingPage
		},
		data() {
			return {
				errorTip: '',
				isConfirm: true,
				showModel: false,
				okType: '',
				waitPaymentNumber: 0,
				waitSendGoodsNumber: 0,
				waitReceiptNumber: 0,
				isLoadCompleted: false
			}
		},
		mounted() {
			this.$nextTick(() => {
				this.initGetOrderNumber(1);
				this.initGetOrderNumber(2);
				this.initGetOrderNumber(3);
				
				this.initScroll();
				util.commonFunc(this);
			});
		},
		computed: {
			nickname() {
				return this.$store.state.nickname
			},
			headimgurl() {
				return this.$store.state.headimgurl;
			},
			getHeaders() {
				return this.$store.getters.getHeaders;
			},
			balanceScore() {
				return this.$store.state.balanceScore;
			}
		},
		methods: {
			initScroll() {
				var scroll = new BetterScroll(this.$refs.scrollWrapper, {
					click: true
				});
			},
			initGetOrderNumber(status) {
				this.$http.get(api.order.getOrderCount, {
					headers: this.getHeaders,
					params: {
						status: status
					}
				}).then((response) => {
					let res = response.data;
					if (res.code === statusCode.SUCCESS) {
						let count = res.data.count;
						if (status === 1) {
							this.waitPaymentNumber = count;
						} else if (status === 2) {
							this.waitSendGoodsNumber = count;
						} else if (status === 3) {
							this.waitReceiptNumber = count;
						}

						this.isLoadCompleted = true;
					} else {

						util.checkStatus(this, res, {}, this.initGetOrderNumber, status);
						
					}
				});
			},
			showModelWin() {
				this.errorTip = '确定要退出当前登陆吗？';
				this.showModel = true;
			},
			closeModelWin() {
				this.showModel = false;
			},
			okModelWin(type) {
				type();
			},
			toAddress() {
				this.$store.commit('updateDirection', 'left');
				this.$router.push({path: '/address', query: {redirectUrl: '/person'}});
			},
            toCoupon() {
            	this.$store.commit('updateDirection', 'left');
                this.$router.push('/coupon');
			},
            toOrder(path) {
            	this.$store.commit('updateDirection', 'left');
                this.$router.push(path);
			},
            toIntegral() {
                this.$store.commit('updateDirection', 'left');
                this.$router.push('/integral');
            },
		}
	}
</script>
<style scoped lang="less" rel="stylesheet">
	@import "person.less";
</style>