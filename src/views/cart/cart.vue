<template>
	<div>
		<nav-header>
			<div class="title" slot="title">购物车</div>
		</nav-header>
		<div class="container-wrapper">
			<div class="scroll-wrapper" ref="scrollWrapper">
				<div class="wrapper">
					<template v-if="goodsList.length">
						<ul class="cart-list">
							<li class="cart-item" v-for="(item, index) in goodsList" :key="index" ref="goodsListElement">
								<div class="check-icon-wrapper">
									<gou-gou :isSelected="item.isSelected" :item="item" @editEvent="edit"></gou-gou>
								</div>
								<div class="cart-pic">
									<img v-adaptiveSrc="item.imagesUrl" />
								</div>
								<div class="cart-right">
									<div class="cart-title">{{item.title}}</div>
									<!--<div class="cart-desc">
										{{item.goodsName}}
									</div>-->
									<div class="spec-list" v-if="item.chooseJsonProp != null">
										<div class="spec-item" v-for="(spec,key,i) in item.chooseJsonProp">
											<div class="spec-key">{{key}}：</div>
											<div class="spec-val">{{spec}}</div>
										</div>
									</div>
									<div class="cart-controls">
										<div class="cartControls-wrapper">
											<cart-controls cartType="list" :amount="item.amount" :item="item" @editEvent="edit"></cart-controls>
										</div>
										<div class="cart-price">{{item.goodsSalePrice | currency('￥')}}</div>
										<i class="del-cart-icon iconfont icon-lajitong" @click="showDelModelWin(item.cartId)"></i>
									</div>
								</div>
							</li>
						</ul>
					</template>
					<template v-else>
						<div class="no-record-wrapper">
							<no-record iconType="noProduct" text="购物车暂无记录"></no-record>
						</div>
					</template>
				</div>
			</div>

			<bottom-controls pageType="cart" :price="totalPrice" :checkCount="checkCount" @clickEvent="createOrder">立即购买</bottom-controls>

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
	import CartControls from '@/components/cartControls/cartControls';
	import GouGou from '@/components/gouGou/gouGou';
	import BottomControls from '@/components/bottomControls/bottomControls';
	import ModelWin from '@/components/modelWin/modelWin';
	import noRecord from '@/components/noRecord/noRecord';
	import LoadingPage from '@/components/loadingPage/loadingPage';

	import api from '@/util/api';
	import util from '@/util/util';
	import statusCode from '@/util/statusCode';

	export default {
		components: {
			NavHeader,
			NavFooter,
			CartControls,
			GouGou,
			BottomControls,
			ModelWin,
			noRecord,
			LoadingPage
		},
		data() {
			return {
                goodsList: [],
				cartId: '',
				errorTip: '',
				isConfirm: true,
				showModel: false,
				isLoadCompleted: false,
				okType: ''
			}
		},
		mounted() {
			
			this.$nextTick(() => {
				this.initCart();
				this.initScroll();
				
				util.commonFunc(this);
			});
		},
		computed: {
			checkCount() {
				let count = 0;

				for (let i = 0, len = this.goodsList.length; i < len; i++) {
					if (this.goodsList[i].isSelected) {
						count++;
					}
				}
				return count;
			},
			checkedProductIdList() {
				let productIdList = [];
				for (let i = 0, len = this.goodsList.length; i < len; i++) {
					if (this.goodsList[i].isSelected) {
						productIdList.push(this.goodsList[i].goodsId);
					}
				}
				return productIdList;
			},
			totalPrice() {
				let total = 0;

				for (let i = 0, len = this.goodsList.length; i < len; i++) {
					if (this.goodsList[i].isSelected) {
						total += this.goodsList[i].amount * this.goodsList[i].goodsSalePrice;
					}
				}
				return total;
			}
		},
		methods: {
			initScroll() {
				this.scroll = new BetterScroll(this.$refs.scrollWrapper, {
					scrollbar: {
						fade: true
					},
					click: true
				});
				
			},
			
			initCart(type) {
				
				this.$http.get(api.cart.cartList,{
				    params:{
						pageNum: 100,
						pageSize: 1
                    }
				}).then((response) => {
					let res = response.data;

					if (res.code === statusCode.SUCCESS) {
						this.isLoadCompleted = true;
						this.goodsList = [...this.goodsList, ...res.data.goodsList];
                        /*console.log(this.goodsList[0].cartId);*/
					} else {

						util.checkStatus(this, res, {}, this.initCart, type);
						
					}
				})
			},
			edit(type, item) {

				if (type === 'add') {
					item.amount++;
				} else if (type === 'reduce') {
					if (item.amount > 1) {
						item.amount--;
					} else {
						return;
					}
				} else if (type === 'check') {
					item.isSelected = item.isSelected === 0 ? 1 : 0;
				}

				if (item.amount > item.goodsStock) {
					item.amount = item.goodsStock;
					this.errorTip = '数量已超过该最大的库存';
					this.showModel = true;
					this.isConfirm = false;
					return;
				}

				this.$http.get(api.cart.updateCart, {
				    params:{
                        amount: item.amount,
                        cartId: item.cartId,
                        isSelected:item.isSelected
					}

				}).then((response) => {
					let res = response.data;

					if (res.code === statusCode.SUCCESS) {
						// util.checkStatus(this, res, {}, this.edit, type, item);
					} else {

						util.checkStatus(this, res, {}, this.edit, type, item);

					}
				});

			},
			showDelModelWin(cartId) {
				this.cartId = cartId;
				this.errorTip = '您确定要从购物车中删除商品吗？';
				this.showModel = true;
				this.isConfirm = true;
				this.okType = this.del;
			},
			del() {
				this.$http.get(api.cart.delCart, {
					params:{
                        cartId:this.cartId
					}
				}).then((response) => {
					let res = response.data;

					if (res.code === statusCode.SUCCESS) {
                        this.showModel = false;
                        this.reCartList();
					} else {

						util.checkStatus(this, res, {}, this.del);
					}
				});
			},
			reCartList() {
				for (let i = 0, len = this.goodsList.length; i < len; i++) {
					if (this.cartId === this.goodsList[i].cartId) {
						this.goodsList.splice(i, 1);
						break;
					}
				}
			},
			closeModelWin() {
				this.showModel = false;
				this.isConfirm = true;
			},
			okModelWin(type) {
				type();
			},
			createOrder() {

				if (this.checkedProductIdList.length <= 0) {

					this.errorTip = '请从购物车中至少选中一件商品';
					this.isConfirm = false;
					this.showModel = true;

					return;
				}

				this.$store.commit('updateDirection', 'left');
				this.$router.push({path: '/createOrder', query: {isCart: 'cart', redirectUrl: {createOrderRedirectUrl: '/cart'}}});
			}
		}
	}
</script>

<style scoped lang="less" rel="stylesheet">
	@import "cart.less";
</style>