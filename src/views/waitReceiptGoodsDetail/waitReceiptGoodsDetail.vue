<template>
	<div>
		<nav-header back="true" clickRedirect="true" @clickEvent="back">
			<div class="title" slot="title">待收货</div>
		</nav-header>
		<div class="scroll-wrapper" ref="scrollWrapper">
			<div class="wrapper">
				<div class="delivery">
					<div class="name">{{logName}}</div>
					<div class="delivery-code" v-if="orderType == 0">单号：{{logistics.logisticsNo}}</div>
				</div>
				<div class="address" v-if="orderType == 0">
					<address-detail :addressDetail="addressDetail"></address-detail>
				</div>
				<div class="myaddress" v-if="orderType == 1 && addressInfor.contactName != ''">
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
					<order-list :orderList="orderDetail.orderList" :redirectUrl="$route.query.redirectUrl || '/waitReceiptGoods'" pageTypeDetail="true"></order-list>
				</div>

				<div class="confirmBtn-wrapper">
					<submit-btn @clickEvent="showModelWin($route.query.orderId)">确认收货</submit-btn>
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
	import AddressDetail from '@/components/addressDetail/addressDetail';
	import SubmitBtn from '@/components/submitBtn/submitBtn';
	import ModelWin from '@/components/modelWin/modelWin';
	import LoadingPage from '@/components/loadingPage/loadingPage';
	import WaitingTip from '@/components/waitingTip/waitingTip';

	import api from '@/util/api';
	import util from '@/util/util';
	import statusCode from '@/util/statusCode';

	export default {
		components: {
			NavHeader,
			OrderList,
			AddressDetail,
			SubmitBtn,
			ModelWin,
			WaitingTip,
			LoadingPage
		},
		data() {
			return {
				orderDetail: {},
				addressDetail: {},
				logistics: {},
				errorTip: '',
				showModel: false,
				isConfirm: false,
				isClicked: false,
				okType: '',
				isLoadCompleted: false,
                orderType:1,
                addressInfor: {},
                logName:'',
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
				this.$http.get(api.order.getOrderById, {
					headers: this.getHeaders,
					params: {
						orderId: this.$route.query.orderId,
					}
				}).then((response) => {
					let res = response.data;

					if (res.code === statusCode.SUCCESS) {
						this.orderDetail = res.data;
						this.isLoadCompleted = true;

						this.addressDetail = res.data.receiveAddr;

						this.logistics = res.data.logistics;
						this.addressInfor = res.data.address;
                        this.orderType = this.orderDetail.orderList[0].orderType;

                        if (this.orderType == 0) {
                            this.logName = this.logistics.logisticsName;
						} else {
                            this.logName = '门店自提';
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

						this.showModel = false;
						this.isConfirm = false;
						this.isClicked = false;

						this.$store.commit('updateDirection', 'right');
						this.$router.push({
							path: '/waitReceiptGoods'
						});
					} else {

						util.checkStatus(this, res, {}, this.confirmReceiptGoods);

					}
				});
			},
			back() {
				if (this.$route.query.redirectUrl) {
					this.$router.push({
						path: this.$route.query.redirectUrl
					});
				} else {
					this.$router.push({
						path: '/waitReceiptGoods'
					});
				}
			}
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "waitReceiptGoodsDetail.less";
</style>