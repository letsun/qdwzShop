<template>
	<div>
		<nav-header back="true" clickRedirect="true" @clickEvent="back">
			<div class="title" slot="title">交易成功</div>
		</nav-header>
		<div class="scroll-wrapper" ref="scrollWrapper">
			<div class="wrapper">
				<template  v-if="containerId <= 0">
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
				</template>
				<div class="order">
					<order-list :orderList="orderDetail.orderList" pageTypeDetail="true"></order-list>
				</div>
				
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
				orderDetail: {},
				logistics: {},
				containerId: '',
				addressDetail: {},
				errorTip: '',
				showModel: false,
				isConfirm: false,
				okType: '',
				isLoadCompleted: false,
                orderType: 1,
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
						this.containerId = res.data.orderList[0].containerId;
						
						this.isLoadCompleted = true;

						this.addressDetail = res.data.receiveAddr;
                        this.addressInfor = res.data.address;
						this.logistics = res.data.logistics;
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
			back() {
				this.$router.push({
					path: '/allOrder'
				});
			}
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "successOrderDetail.less";
</style>