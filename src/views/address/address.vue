<template>
	<div>
		<nav-header back="true">
			<div class="title" slot="title">收货地址</div>
			<div class="add-address" slot="addAddressBtn">
				<a href="javascript:void(0);" @click="addAddress">+新增</a>
			</div>
		</nav-header>
		<div class="scroll-wrapper" ref="scrollWrapper">
			<div class="wrapper">
				<template v-if="addressList.length">
					<ul class="address-list">
						<li class="item" :class="{'activeLi': item.isDefault === 1}" v-for="(item, index) in addressList" :key="index">
							<div class="address-top">
								<span class="name">{{item.receiveName}}</span>
								<span class="tel">{{item.receivePhone}}</span>
							</div>
							<div class="address-detail">{{item.receiveProvince}}{{item.receiveCity}}{{item.receiveArea}}{{item.receiveAddress}}</div>
							<div class="controls-wrapper">
								<div class="default-address" @click="setDefault(item)" :class="{active: item.isDefault === 1}">
									<i class="icon iconfont" :class="{'icon-gou': item.isDefault === 1}"></i>
									<span>默认地址</span>
								</div>
								<div class="controls-right">
									<a href="javascript:void(0)" @click="editAddress(item.id)">编辑</a>
									<a href="javascript:void(0)" @click="showDelAddressModel(item.id)">删除</a>
								</div>
							</div>
						</li>
					</ul>
					<div class="confirm-wrapper" v-if="$route.query.redirectUrl !== '/person'">
						<submit-btn @clickEvent="submitDefault">确定地址</submit-btn>
					</div>
				</template>
				<template v-else>
					<div class="no-record-wrapper">
						<no-record iconType="noAddress" text="您还没添加收货地址"></no-record>
						<a href="javascript:void(0)" class="addAddress-btn" @click="addAddress">添加收货地址</a>
					</div>	
				</template>
				
				
			</div>
		</div>

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
	import SubmitBtn from '@/components/submitBtn/submitBtn';
	import ModelWin from '@/components/modelWin/modelWin';
	import noRecord from '@/components/noRecord/noRecord';
	import LoadingPage from '@/components/loadingPage/loadingPage';

	import api from '@/util/api';
	import util from '@/util/util';
	import statusCode from '@/util/statusCode';

	export default {
		components: {
			NavHeader,
			SubmitBtn,
			ModelWin,
			noRecord,
			LoadingPage
		},
		data() {
			return {
				addressList: [],
				query: {},
				errorTip: '',
				showModel: false,
				isConfirm: false,
				okType: '',
				addressId: '',
				isLoadCompleted: false
			}
		},
		mounted() {
			this.$nextTick(() => {
				
				// 收集参数
                if (this.$route.query.goodsId) {
                	this.query.goodsId = this.$route.query.goodsId;
                }

                if (this.$route.query.chooseJsonProp) {
                    this.query.chooseJsonProp = this.$route.query.chooseJsonProp;
                }

                if (this.$route.query.amount) {
                	this.query.amount = this.$route.query.amount;
                }

                if (this.$route.query.isCart) {
                	this.query.isCart = this.$route.query.isCart;
                }

                if (this.$route.query.redirectUrl) {
                	this.query.redirectUrl = this.$route.query.redirectUrl;
                }

				this.initAddress();
				this.initScroll();
				
				util.commonFunc(this);

			});
		},
        computed: {
            
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
			initAddress() {
				this.$http.get(api.address.addressList).then((response) => {
					let res = response.data;

					if (res.code === statusCode.SUCCESS) {
                        this.addressList = res.data;
                        this.isLoadCompleted = true;

                        for (let i = 0, len = this.addressList.length; i < len; i++) {
                            if (this.addressList[i].isDefault) {
                                this.addressId = this.addressList[i].id;
                            }
                        }
					} else {

						util.checkStatus(this, res, {}, this.initAddress);

					}
				});
			},
			addAddress() {
				this.$store.commit('updateDirection', 'left');
				this.query.type = 'add';
				this.$router.push({path: '/editAddress', query: this.query});
			},
			editAddress(id) {
				this.$store.commit('updateDirection', 'left');
				this.query.type = 'edit';
				this.query.addressId = id;
				this.$router.push({path: '/editAddress', query: this.query});
			},
			showDelAddressModel(id) {
				this.addressId = id;
				this.showModel = true;
				this.isConfirm = true;
				this.okType = this.delAddress;
				this.errorTip = '您确定要删除地址吗？';
			},
			closeModelWin() {
				this.isConfirm = false;
				this.showModel = false;
			},
			okModelWin(type) {
				type();
			},
			delAddress() {
				this.$http.get(api.address.delAddress, {
				    params:{
                        receiveId: this.addressId
					}

				}).then((response) => {
					let res = response.data;

					if (res.code === statusCode.SUCCESS) {
						this.isLoadCompleted = true;
                        this.initAddress();
                        this.showModel = false;
					} else {
						util.checkStatus(this, res, {}, this.delAddress);
					}
				});
			},
			setDefault(item) {
				
				this.addressId = item.id;

				for (let i = 0, len = this.addressList.length; i < len; i++) {
					if (this.addressId === this.addressList[i].id) {
						this.addressList[i].isDefault = 1;
					} else {
						this.addressList[i].isDefault = 0;
					}
				}

				this.$http.get(api.address.submitDefault, {
				    params:{
                        receiveId: this.addressId
					}
				}).then((response) => {
					let res = response.data;
					if (res.code === statusCode.SUCCESS) {
						// util.checkStatus(this, res, {}, this.setDefault, item);
					} else {
						util.checkStatus(this, res, {}, this.setDefault, item);
					}
				});

			},
			submitDefault() {

				if (!this.addressId) {
					this.errorTip = '请设置一个默认地址';
					this.showModel = true;
					this.isConfirm = false;
					return;
				}

				this.$http.get(api.address.submitDefault, {
				    params:{
                        receiveId: this.addressId
					}
				}).then((response) => {
					let res = response.data;

					if (res.code === statusCode.SUCCESS) {
						let path = util.getPath();
						this.$store.commit('updateDirection', 'right');
                        this.$router.push({path: '/createOrder', query: this.query});
					} else {

						util.checkStatus(this, res, {}, this.submitDefault);
						
					}
				});
			}
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "address.less";
</style>