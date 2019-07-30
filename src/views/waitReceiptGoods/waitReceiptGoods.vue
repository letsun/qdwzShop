<template>
	<div>
		<nav-header back="true" clickRedirect="true" @clickEvent="back">
			<div class="title" slot="title">待收货</div>
		</nav-header>
		<div class="scroll-wrapper" ref="scrollWrapper">
			<div class="wrapper">
				<order-list pageType="receiptGoods" @showConfirmEvent="showModelWin" detailPath="/waitReceiptGoodsDetail" :orderList="orderList"></order-list>
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

		<transition name="fade">
			<waiting-tip v-show="isClicked">
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
	import OrderList from '@/components/orderList/orderList';
	import ModelWin from '@/components/modelWin/modelWin';
	import LoadingTip from '@/components/loadingTip/loadingTip';
	import LoadingPage from '@/components/loadingPage/loadingPage';
	import WaitingTip from '@/components/waitingTip/waitingTip';

	import api from '@/util/api';
	import util from '@/util/util';
	import statusCode from '@/util/statusCode';

	export default {
		components: {
			NavHeader,
			OrderList,
			ModelWin,
			LoadingTip,
			WaitingTip,
			LoadingPage
		},
		data() {
			return {
				orderList: [],
				errorTip: '',
				showModel: false,
				isConfirm: false,
				okType: '',
				scroll: null,
				pageNum: 3,
				pageSize: 1,
				hasNext: true,
				isClicked: false,
				loadingTip: '下拉加载更多',
				isLoadCompleted: false
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
						
						this.initOrderList();
					} else {
						this.loadingTip = '已经没有更多了';
					}
				});
			},
			initOrderList(type) {
				this.$http.get(api.order.getOrderListByStatus, {
					headers: this.getHeaders,
					params: {
						status: 3,
						pageNum: this.pageNum,
						pageSize: this.pageSize
					}
				}).then((response) => {
					let res = response.data;
					if (res.code === statusCode.SUCCESS) {
						this.hasNext = res.data.hasNext;
						this.loadingTip = '下拉加载更多';
						this.isLoadCompleted = true;
						
						if (type === 'receipt') {
							this.orderList = res.data.orderList;
						} else {
							this.orderList = [...this.orderList, ...res.data.orderList];
						}
						
						// this.orderList = [];
					} else {

						util.checkStatus(this, res, {}, this.initOrderList, type);
						
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
			showModelWin(id) {
				this.orderId = id;
				this.showModel = true;
				this.isConfirm = true;
				this.okType = this.confirmReceiptGoods;
				this.errorTip = '您确定要收货吗？';
			},
			confirmReceiptGoods() {

				this.isClicked = true;

				this.$http.get(api.order.confirmOrder, {
					headers: this.getHeaders,
					params: {
						orderId: this.orderId
					}
				}).then((response) => {
					let res = response.data;

					if (res.code === statusCode.SUCCESS) {
						this.isClicked = false;
						this.showModel = false;
						this.isConfirm = false;
						this.isLoadCompleted = false;
						this.initOrderList('receipt');
					} else {

						util.checkStatus(this, res, {}, this.confirmReceiptGoods);
						
					}
				});
			},
			finish() {
				this.scroll.finishPullUp();
				this.scroll.refresh();
			},
			back() {
				this.$router.push({
					path: '/person'
				});
			}
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "waitReceiptGoods.less";
</style>