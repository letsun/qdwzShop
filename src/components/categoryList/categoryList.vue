<template>
	<div>
		<div class="goods-wrapper" ref="goodsWrapper">
			<div>
				<transition name="fade">
					<div v-if="isLoadCompleted">
						<template v-if="goodsList.length">
							<ul class="goods-list">
								<li class="goods-item" data-tagname="li" v-for="(item, index) in goodsList" :key="index">
									<div class="container" v-if="item.isopenContainer === 1"></div>
									<div class="img-wrapper">
										<a href="javascript:void(0)" @click="toProductDetail(item.goodsId)">
											<img v-adaptiveSrc:li="item.imagesUrl" />
										</a>
									</div>
									<div class="goods-name" @click="toProductDetail(item.goodsId)">{{item.goodsName}}</div>
									<div class="goods-infor">
										<div class="price active">
											<template v-if="item.goodsType === 0">
												<span>{{item.goodsSalePrice | currency('￥')}}元</span>
												<span>{{item.goodsVipPrice | currency('￥')}}元</span>
											</template>
											<template v-else>
												{{item.goodsScore}} <span class="score-unit">积分</span>
											</template>
										</div>
										<a href="javascript:void(0)" @click="nowBuy(item.goodsId, item.isopenContainer)" class="buy-btn">{{item.goodsType === 0 ? '立即购买': '立即兑换'}}</a>
									</div>
								</li>
							</ul>
							<!-- 下拉加载更多 -->
							<loading-tip :loadingTip="loadingTip" :isShow="goodsList.length >= pageNum" :hasNext="hasNext"></loading-tip>
						</template>
						<template v-else>
							<div class="no-record-wrapper">
								<no-record iconType="noProduct" text="商品上架中..."></no-record>
							</div>
						</template>
					</div>
				</transition>
			</div>

			<!-- 页面加载状态 -->
			<transition name="fade">
				<loading-page v-if="!isLoadCompleted"></loading-page>
			</transition>
		</div>
	</div>
</template>

<script>
	// 插件
	import BetterScroll from 'better-scroll';

	// 组件
	import GoodsList from '@/components/goodsList/goodsList';
	import noRecord from '@/components/noRecord/noRecord';
	import LoadingTip from '@/components/loadingTip/loadingTip';
	import LoadingPage from '@/components/loadingPage/loadingPage';

	import api from '@/util/api';
	import util from '@/util/util';
	import statusCode from '@/util/statusCode';

	export default {
		data() {
			return {
				categoryId: '',
				goodsList: [],
				hasNext: false,
				scroll: null,
				pageNum: 10,
				pageSize: 1,
				hasNext: true,
				loadingTip: '下拉加载更多'
			}
		},
		props: {
			isLoadCompleted: {
				type: Boolean,
				default: true
			},
			isLoadPageCompleted: {
				type: Boolean,
				default: false
			}
		},
		components: {
			GoodsList,
			noRecord,
			LoadingTip,
			LoadingPage
		},
		computed: {
			mallType() {
				return this.$store.state.mallType;
			},
			containerId() {
				return this.$store.state.containerId;
			}
		},
		mounted() {
			this.$nextTick(() => {
				this.initProductListById();
				this.initScroll();
			});
		},
		updated() {
			this.finish();
		},
		methods: {
			initScroll() {
				this.scroll = new BetterScroll(this.$refs.goodsWrapper, {
					scrollbar: {
						fade: true
					},
					click: true,
					pullUpLoad: {
					  threshold: 100
					}
				});

				this.scroll.on('pullingUp', () => {
					if (this.hasNext) {
						this.pageSize++;
						this.loadingTip = '数据正在加载中....';
						
						this.initProductListById();
					} else {
						this.loadingTip = '已经没有更多了';
					}
				});
			},
			initProductListById(menu) {
				
				this.$http.get(api.product.goodsList, {
					 params: {
						categoryId: this.categoryId,
						mallType: this.mallType,
						pageNum: this.pageNum,
						pageSize: this.pageSize
					}
				}).then((response) => {
					let res = response.data;
					

					if (res.code === statusCode.SUCCESS) {
						this.loadingTip = '下拉加载更多';
						this.hasNext = res.data.hasNext;

						// 更改加载状态
						if (this.isLoadPageCompleted) {
							this.$emit('updateLoadCompletedEvent', true);
						}
						
						if (!this.isLoadPageCompleted) {
							// 更改页面加载状态
							this.$emit('updatePageLoadCompleteEvent', true);
						}

						if (typeof menu == 'undefined') {
							this.goodsList = [...this.goodsList, ...res.data.goodsList];	
						} else {
							this.goodsList = res.data.goodsList;
						}
					} else {

						util.checkStatus(this, res, {isComponent: true}, this.initProductListById, menu);
						
					}
				});
			},
			sendCategoryIdToCategoryList(categoryId, menu) {
				this.pageSize = 1;
				
				this.categoryId = typeof categoryId !== 'undefined' ? categoryId : '';
				this.initProductListById(menu);
				this.scroll.scrollTo(0, 0);
			},
			finish() {
				this.scroll.finishPullUp();
				this.scroll.refresh();
			},
			toProductDetail(goodsId) {
				this.$store.commit('updateDirection', 'left');
				this.$router.push({
					path: '/productDetail', 
					query: {goodsId: goodsId}
				});
			},
			nowBuy(goodsId, isopenContainer) {

				
				if ((this.containerId == 0 || this.containerId == null ) && isopenContainer) {
					this.$emit('errorEvent', '请扫货柜码进行购买');

					return;
				}

				this.$store.commit('updateDirection', 'left');
				this.$router.push({
					path: '/createOrder', 
					query: {goodsId: goodsId, amount: 1}
				});
			}
		},
	}
</script>
<style lang="less" scoped rel="stylesheet">
	@import "categoryList.less";
</style>