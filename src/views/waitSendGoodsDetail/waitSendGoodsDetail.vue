<template>
	<div>
		<nav-header back="true" clickRedirect="true" @clickEvent="back">
			<div class="title" slot="title">待发货</div>
		</nav-header>
		<div class="scroll-wrapper" ref="scrollWrapper">
			<div class="wrapper">
				<div class="address" v-if="orderType == 0">
					<address-detail :addressDetail="addressDetail"></address-detail>
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
					<order-list :orderList="orderList" :redirectUrl="$route.query.redirectUrl || '/waitSendGoods'" :coupon="coupon" pageTypeDetail="true"></order-list>
				</div>
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
	import ModelWin from '@/components/modelWin/modelWin';
	import OrderList from '@/components/orderList/orderList';
	import AddressDetail from '@/components/addressDetail/addressDetail';
	import LoadingPage from '@/components/loadingPage/loadingPage';

	import api from '@/util/api';
	import util from '@/util/util';
	import statusCode from '@/util/statusCode';


	export default {
		components: {
			NavHeader,
			OrderList,
			AddressDetail,
			ModelWin,
			LoadingPage
		},
		data() {
			return {
				orderList: [],
				addressDetail: {},
				coupon: {},
				errorTip: '',
				showModel: false,
				isConfirm: false,
				okType: '',
				isLoadCompleted: false,
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
				// debugger;
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

						this.addressDetail = res.data.receiveAddr;
                        this.addressInfor = res.data.address;
						this.logistics = res.data.logistics;
                        this.orderType = this.orderList[0].orderType;

						this.coupon = res.data.coupon;

						if (this.orderList[0].status === 3) {
							this.$store.commit('updateDirection', 'right');

							this.$router.push({
								path: this.$router.query.redirectUrl
							});
						}	
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
			back() {
				if (this.$route.query.redirectUrl) {
					this.$router.push({
						path: this.$route.query.redirectUrl
					});
				} else {
					this.$router.push({
						path: '/waitSendGoods'
					});
				}
			}
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "waitSendGoodsDetail.less";
</style>