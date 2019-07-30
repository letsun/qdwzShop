<template>
	<div>
		<nav-header back="true">
			<div class="title" slot="title">已完成</div>
		</nav-header>
		<div class="scroll-wrapper" ref="scrollWrapper">
			<div class="wrapper">
				<template v-if="orderList.length">
					<div class="delivery">
						<div class="name">顺丰快递</div>
						<div class="delivery-code">单号：123456789</div>
					</div>
					<div class="address">
						<address-detail :addressDetail="addressDetail"></address-detail>
					</div>
					<div class="order">
						<order-list :orderList="orderList" pageTypeDetail="true"></order-list>
					</div>
				</template>
			</div>
		</div>

		<div class="payMent-controls">
			<btn-group @leftClickBtnEvent="showModelWin($route.query.id)" @rightClickBtnEvent="buyAgain($route.query.id)">
				<template slot="btn_1">
					<i class="icon iconfont icon-lajitong"></i><span class="text">删除订单</span>
				</template>
				<template slot="btn_2">
					<i class="icon iconfont icon-goumai"></i><span class="text">再次购买</span>
				</template>
			</btn-group>
		</div>
	
		<model-win :show="showModel">
			<template slot="content">
				{{errorTip}}
			</template>
			<template slot="btn">
				<template  v-if="isConfirm">
					<a href="javascript:void(0);" class="btn" @click="confirmDel">确定</a>
					<a href="javascript:void(0);" class="btn btn-last" @click="closeModelWin">取消</a>
				</template>
				<template  v-else>
					<a href="javascript:void(0);" class="btn" @click="closeModelWin">确定</a>
				</template>
			</template>
		</model-win>
		
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
	import SubmitBtn from '@/components/submitBtn/submitBtn';
	import ModelWin from '@/components/modelWin/modelWin';
	import BtnGroup from '@/components/btnGroup/btnGroup';
	import LoadingPage from '@/components/loadingPage/loadingPage';

	import api from '@/util/api';

	export default {
		components: {
			NavHeader,
			OrderList,
			AddressDetail,
			SubmitBtn,
			ModelWin,
			BtnGroup,
			LoadingPage
		},
		data() {
			return {
				orderList: [],
				addressDetail: {},
				errorTip: '',
				showModel: false,
				isConfirm: false,
				isLoadCompleted: false
			}
		},
		mounted() {
			this.$nextTick(() => {
				this.initOrderList();
				this.initScroll();
			});
		},
		computed: {
			getHeaders() {
				return this.$store.getters.getHeaders;
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
						this.isLoadCompleted = true;
						this.addressDetail = Object.assign({}, this.addressDetail, {
							receiveName: res.data.receiveName,
							receivePhone: res.data.receivePhone,
							receiveProvince: res.data.receiveProvince,
							receiveCity: res.data.receiveCity,
							receiveArea: res.data.receiveArea,
							receiveAddr: res.data.receiveAddr
						});
						
					}
				});
			},
			closeModelWin() {
				this.showModel = false;
				this.isConfirm = false;
			},
			showModelWin(id) {
				this.orderId = id;
				this.showModel = true;
				this.isConfirm = true;
				this.errorTip = '您确定要删除订单吗？';
			},
			confirmDel() {
				this.$http.post(api.order.delOrder, {
					orderId: this.orderId
				}).then((response) => {
					let res = response.data;

					if (res.status === 1001) {

					} else if (res.status) {
						this.showModel = false;
						this.isConfirm = false;
						this.$router.push({
							path: this.$route.query.redirectUrl
						});
					}
				});
			},
			buyAgain(id) {
				this.$router.push({
					path: '/createOrder',
					query: {

					}
				});
			},

		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "orderDetail.less";
</style>