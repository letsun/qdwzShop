<template>
	<div>
		<nav-header back="true" clickRedirect="true" @clickEvent="back">
			<div class="title" slot="title">全部订单</div>
		</nav-header>
		<div class="scroll-wrapper" ref="scrollWrapper">
			<div class="wrapper">
				<order-list pageType="allOrder" :orderList="orderList"></order-list>
				<!-- 下拉加载更多 -->
				<loading-tip :loadingTip="loadingTip" :isShow="orderList.length >= pageNum" :hasNext="hasNext"></loading-tip>
			</div>
		</div>
		<!-- 页面加载状态 -->
		<transition name="fade">
			<loading-page v-if="!isLoadCompleted"></loading-page>
		</transition>

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
	import OrderList from '@/components/orderList/orderList';
	import LoadingTip from '@/components/loadingTip/loadingTip';
	import LoadingPage from '@/components/loadingPage/loadingPage';
	import ModelWin from '@/components/modelWin/modelWin';

	import api from '@/util/api';
	import util from '@/util/util';
	import statusCode from '@/util/statusCode';

	export default {
		components: {
			NavHeader,
			OrderList,
			LoadingTip,
			LoadingPage,
			ModelWin
		},
		data() {
			return {
				orderList: [],
				scroll: null,
				pageNum: 4,
				pageSize: 1,
				hasNext: true,
				loadingTip: '下拉加载更多',
				isLoadCompleted: false,
				errorTip: '',
				showModel: false,
				isConfirm: false,
				okType: ''
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
			initOrderList() {
				this.$http.get(api.order.getOrderListByStatus, {
					params: {
						status: 0,
						pageNum: this.pageNum,
						pageSize: this.pageSize
					}
				}).then((response) => {
					let res = response.data;
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
			finish() {
				this.scroll.finishPullUp();
				this.scroll.refresh();
			},
			closeModelWin() {
				this.isConfirm = false;
				this.showModel = false;
			},
			okModelWin(type) {
				type();
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
	@import "allOrder.less";
</style>