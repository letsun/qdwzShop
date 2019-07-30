<template>
	<div>
		<ul class="goods-list" v-if="goodsList.length">
			<li class="goods-item" data-tagname="li" v-for="(item, index) in goodsList" :key="index">
				<div class="container" v-if="item.isopenContainer === 1"></div>
				<div class="img-wrapper">
					<a href="javascript:void(0)" @click="toProductDetail(item.goodsId)">
						<img v-adaptiveSrc:li="item.imagesUrl" />
					</a>
				</div>
				<div class="goods-name" @click="toProductDetail(item.goodsId)">{{item.goodsName}}</div>
				<div class="goods-infor">
					<div class="price" :class="{'active': item.goodsType === 0}">
						<template v-if="item.goodsType === 0">
							<span class="span1">{{item.goodsSalePrice | currency('￥')}}元</span>
							<span class="span1">{{item.goodsVipPrice | currency('￥')}}元</span>
						</template>
						<template v-else>
							{{item.goodsScore}} <span class="score-unit">积分</span>
						</template>
					</div>
					<a href="javascript:void(0)" @click="nowBuy(item.goodsId, item.isopenContainer)" class="buy-btn">{{item.goodsType === 0 ? '立即购买': '立即兑换'}}</a>
				</div>
			</li>
		</ul>
		<div class="no-record-wrapper" v-else>
			<no-record iconType="noProduct" text="暂时无商品"></no-record>
		</div>
	</div>
</template>

<script>
	import noRecord from '@/components/noRecord/noRecord';

	import api from '@/util/api';
	import util from '@/util/util';
	import statusCode from '@/util/statusCode';


	export default {
		components: {
			noRecord
		},
		props: {
			type: {
				type: String,
				default: 'all'
			},
			productList: {
				type: Array,
				default() {
					return [];
				}
			},
			floorId: {
				type: Number,
				default: 1
			},
			pageSize: {
				type: Number,
				default: 8
			},
			pageNum: {
				type: Number,
				default: 4
			}
		},
		data() {
			return {
				goodsList: []
			}
		},
		computed: {
			mallType() {
				return this.$store.state.mallType;
			},
			containerId() {
				return this.$store.state.containerId;
			}
		},
		watch: {
			'pageSize'() {
				this.initGoodsList();
			}
		},
		mounted() {
			this.goodsList = this.productList;
		},
		updated() {
			if (this.type === 'all') {
				this.$emit('finishEvent');
			}
		},
		methods: {
			initGoodsList() {
				this.$http.get(api.home.getFloorById, {
					params: {
						floorId: this.floorId,
						mallType: this.mallType,
						pageSize: this.pageSize,
						pageNum: this.pageNum
					}
				}).then((response) => {
					let res = response.data;
					let hasNext = false;
					
					if (res.code === statusCode.SUCCESS) {
						hasNext = res.data.floorDetailInfo.hasNext;
						this.goodsList = [...this.goodsList, ...res.data.floorDetailInfo.goodsList];
						// this.goodsList = []
					} else {

						util.checkStatus(this, res, {isComponent: true}, this.initGoodsList);
						
						hasNext = false;
					}

					this.$emit('updateHasNextEvent', hasNext);
				});
			},
			toProductDetail(goodsId) {
				this.$store.commit('updateDirection', 'left');
				this.$store.commit('updateKeepAlList', false);
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
		}
	}
</script>

<style scoped lang="less" rel="stylesheet">
	@import 'goodsList.less';
</style>