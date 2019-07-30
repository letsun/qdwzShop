<template>
	<div @click="closeFn">
		<nav-header back="true">
			<div class="title" slot="title">收货地址</div>
		</nav-header>
		<div class="scroll-wrapper" ref="scrollWrapper">
			<div class="wrapper">
				<ul class="form-list" ref="formList">
					<li class="item">
						<div class="form-key">收货人</div>
						<div class="form-input">
							<input type="text" class="form-text" maxlength="15" v-model="receiveName" placeholder="请输入收货人姓名" />
						</div>
					</li>
					<li class="item">
						<div class="form-key">手机号码</div>
						<div class="form-input">
							<input type="text" class="form-text" v-model="receivePhone" placeholder="请输入收货人手机号码" />
						</div>
					</li>
					<li class="item">
						<div class="form-key">省份</div>
						<div class="form-input">
							<span class="text" @click.stop="selectProvince">{{receiveProvince}}</span>
							<i class="icon iconfont icon-arrow-right-copy"></i>
						</div>
					</li>
					<li class="item" v-if="isShowCity">
						<div class="form-key">城市</div>
						<div class="form-input">
							<span class="text" @click.stop="selectCity">{{receiveCity}}</span>
							<i class="icon iconfont icon-arrow-right-copy"></i>
						</div>
					</li>
					<li class="item" v-if="isShowArea">
						<div class="form-key">地区</div>
						<div class="form-input">
							<span class="text" @click.stop="selectArea">{{receiveArea}}</span>
							<i class="icon iconfont icon-arrow-right-copy"></i>
						</div>
					</li>
					<li class="item">
						<div class="form-key">详细地址</div>
						<div class="form-input">
							<input type="text" class="form-text" v-model="receiveAddress" placeholder="请输入收货人街道门牌等信息" />
						</div>
					</li>
					<li class="item">
						<div class="form-key">是否默认</div>
						<div class="form-input">
							<div class="radio-group">
								<span class="radio" @click="defaultAddress(1)"><i class="icon1 iconfont" :class="{'icon-gou': isDefault === 1}"></i><span class="label">是</span></span>
								<span class="radio" @click="defaultAddress(0)"><i class="icon1 iconfont" :class="{'icon-gou': isDefault === 0}"></i><span class="label">否</span></span>
							</div>
						</div>
					</li>
				</ul>
				<div class="btn-wrapper">
					<submit-btn @clickEvent="submit">保存地址</submit-btn>
				</div>
			</div>
		</div>
		<vue-pickers :show="showPicker1" :selectData="pickData1" v-on:cancel="closeFn" v-on:confirm="confirmFn1"></vue-pickers>
		<vue-pickers :show="showPicker2" :selectData="pickData2" v-on:cancel="closeFn" v-on:confirm="confirmFn2"></vue-pickers>
		<vue-pickers :show="showPicker3" :selectData="pickData3" v-on:cancel="closeFn" v-on:confirm="confirmFn3"></vue-pickers>
	
		<transition name="fade">
			<waiting-tip v-show="isClicked">
				正在提交中
			</waiting-tip>
		</transition>

		<model-win :show="showModel">
			<template slot="content">
				{{errorTip}}
			</template>
			<template slot="btn">
				<template  v-if="isConfirm">
					<a href="javascript:void(0);" class="btn" @click="closeModelWin">取消</a>
					<a href="javascript:void(0);" class="btn btn-last" @click="okModelWin(okType, param)">确定</a>
				</template>
				<template  v-else>
					<a href="javascript:void(0);" class="btn" @click="closeModelWin">确定</a>
				</template>
			</template>
		</model-win>

		
		
		<!-- 页面加载状态 -->
		<transition name="fade">
			<loading-page v-if="$route.query.type === 'edit' && !isLoadCompleted"></loading-page>
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
	import LoadingPage from '@/components/loadingPage/loadingPage';
	import WaitingTip from '@/components/waitingTip/waitingTip';

	import cityData from '../../../static/js/cityData';
	import VuePickers from 'vue-pickers';

	import api from '@/util/api';
	import util from '@/util/util';
	import statusCode from '@/util/statusCode';

	export default {
		components: {
			NavHeader,
			SubmitBtn,
			VuePickers,
			ModelWin,
			WaitingTip,
			LoadingPage
		},
		data() {
			return {
			    type:'',
			    query: {},
                addressList:[],
				errorTip: '',
				showModel: false,
				isConfirm: false,
				okType: '',
				addressId: '',
                receiveName: '',
                receivePhone: '',
                receiveAddress: '',
                receiveProvince: '请选择收货人的省份',
                receiveCity: '请选择收货人的城市',
                receiveArea: '请选择收货人的地区',
				isShowArea: true,
				isShowCity: true,
				showPicker1: false,
				showPicker2: false,
				showPicker3: false,
				isLoadCompleted: false,
				isClicked: false,
				pickData1: {
					columns: 1,
					default: {
						text: '请选择',
						value: ''
					},
					pData1: cityData
				},
				pickData2: {
					columns: 1,
					default: {
						text: '请选择',
						value: ''
					},
					pData1: [{text: '请选择', value: ''}]
				},pickData3: {
					columns: 1,
					default: {
						text: '请选择',
						value: ''
					},
					pData1: [{text: '请选择', value: ''}]
				},
                isDefault: 1
			}
		},
        computed: {
            getHeaders() {
                return this.$store.getters.getHeaders;
            },
            mallType() {
                return this.$store.state.mallType;
            }
		},
		mounted() {
			this.$nextTick(() => {
			    this.type = this.$route.query.type;

			    if (this.type == 'add') {

				} else if (this.type == 'edit') {
                    this.addressId = this.$route.query.addressId;
                    this.getAddressInfor();
				}

				// 收集参数
                if (this.$route.query.goodsId) {
                	this.query.goodsId = this.$route.query.goodsId;
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

				this.initScroll();

				util.commonFunc(this);
			});
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
			getAddressInfor() {
				this.$http.get(api.address.addressList, {
                    headers: this.getHeaders,
				    params:{
                        companyId:this.companyId,
                        consumerId:this.consumerId
					}

				}).then((response) => {
					let res = response.data;

					if (res.code === statusCode.SUCCESS) {
                        this.addressList = res.data;
                        this.isLoadCompleted = true;
                        for (let i =0; i < this.addressList.length; i++) {

                            if (this.addressId == this.addressList[i].id) {
                                this.receiveName = this.addressList[i].receiveName;
                                this.receivePhone = this.addressList[i].receivePhone;
                                this.receiveProvince = this.addressList[i].receiveProvince;
                                this.receiveCity = this.addressList[i].receiveCity;
                                this.receiveArea = this.addressList[i].receiveArea;
                                this.receiveAddress = this.addressList[i].receiveAddress;
                                this.isDefault = this.addressList[i].isDefault;
                            }
                        }

                        if (this.receiveArea) {
                            this.isShowArea = true;
                        } else {
                            this.isShowArea = false;
                        }
					} else {

						util.checkStatus(this, res, {}, this.getAddressInfor);
						
						
					}
				});
			},
			selectProvince() {
				this.inputBlur();
				this.showPicker1 = true;
			},
			selectCity() {
				this.inputBlur();
				this.showPicker2 = true;
			},
			selectArea() {
				this.inputBlur();
				this.showPicker3 = true;
			},
			confirmFn1(res) {
				this.showPicker1 = false;
				if (typeof res.select1.sub !== 'undefined') {
					this.pickData2.pData1 = res.select1.sub;
					this.isShowCity = true;	
					this.isShowArea = true;		
				} else {
					this.isShowCity = false;
					this.isShowArea = false;
				}
				
				this.receiveProvince = res.select1.text;
				this.receiveCity = '请选择收货人的城市';
				this.receiveArea = '请选择收货人的地区';
			},
			confirmFn2(res) {
				this.showPicker2 = false;
				
				if (typeof res.select1.sub !== 'undefined') {
					this.pickData3.pData1 = res.select1.sub;
					this.isShowArea = true;	
				} else {
					this.isShowArea = false;
				}
				this.receiveCity = res.select1.text;
				this.receiveArea = '请选择收货人的地区';
			},
			confirmFn3(res) {
				this.showPicker3 = false;
				this.receiveArea = res.select1.text;
			},
			closeFn() {
				this.showPicker1 = false;
				this.showPicker2 = false;
				this.showPicker3 = false;
			},
			defaultAddress(val) {
				this.isDefault = val;
			},
			submit() {

				this.inputBlur();

				if (!this.receiveName) {
					this.showModel = true;
					this.isConfirm = false;
					this.errorTip = '收货人姓名不能为空';
					return;
				}
				if (!this.receivePhone) {
					this.showModel = true;
					this.isConfirm = false;
					this.errorTip = '收货人电话不能为空';
					return;
				}

				if (!/^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/.test(this.receivePhone)) {
					this.showModel = true;
					this.isConfirm = false;
					this.errorTip = '收货人电话格式有误';
					return;
				}

				if (this.receiveProvince === '请选择收货人的省份' || this.receiveProvince === '请选择') {
					this.showModel = true;
					this.isConfirm = false;
					this.errorTip = '收货人省份不能为空';
					return;
				}

				if (this.receiveCity === '请选择收货人的城市' || this.receiveCity === '请选择') {
					this.showModel = true;
					this.isConfirm = false;
					this.errorTip = '收货人城市不能为空';
					return;
				}

				if (this.isShowArea && (this.receiveArea === '请选择收货人的地区' || this.receiveArea === '请选择')) {
					this.showModel = true;
					this.isConfirm = false;
					this.errorTip = '收货人地区不能为空';
					return;
				}

				if (!this.receiveAddress) {
					this.showModel = true;
					this.isConfirm = false;
					this.errorTip = '收货人地址不能为空';
					return;
				}

				this.isConfirm = true;
				this.showModel = true;
				this.okType = this.add;
				this.param = this.type;
				this.errorTip = '确定所有信息填写正确吗？';
			},
			closeModelWin() {
				this.isConfirm = false;
				this.showModel = false;
			},
			okModelWin(type, param) {
				type(param);
			},
			add(type) {

				let url = '';
				let params = {
                    receiveName: this.receiveName,
                    receivePhone: this.receivePhone,
                    receiveProvince: this.receiveProvince,
                    receiveCity: this.receiveCity,
                    receiveAddress: this.receiveAddress,
                    isDefault: this.isDefault
                };

                if (this.receiveArea === '请选择收货人的地区' || this.receiveArea === '请选择') {
                	params.receiveArea = '';
                } else {
                	params.receiveArea = this.receiveArea;
                }

			    if (type == 'add') {
                    url = api.address.addAddress;
				} else if (type == 'edit') {
					url = api.address.upReceive;
					params.receiveId = this.$route.query.addressId;
				}

				this.isClicked = true;

				this.$http.get(url, {
                    headers: this.getHeaders,
                    params: params
                }).then((response) => {
                    let res = response.data;

                    if (res.code === statusCode.SUCCESS) {
                        this.showModel = true;
                        this.isConfirm = false;
                        this.errorTip = res.msg;
                        this.isClicked = true;

                        let path = util.getPath();

                        this.$store.commit('updateDirection', 'right');
                        this.$router.push({path: '/address', query: this.query});

                    }  else {

                    	util.checkStatus(this, res, {}, this.add, type);
						
					}
                });
			},
			inputBlur() {
				let inputs = this.$refs.formList.getElementsByTagName('input');
				
				for (let i = 0, len = inputs.length; i < len; i++) {
					inputs[i].blur();
				}
			}
		}
	}
</script>

<style scoped lang="less" rel="stylesheet">
	@import "editAddress.less";
</style>