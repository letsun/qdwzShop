<template>
	<div>
		<ul class="pro-list">
			<li class="pro-item" v-for="(item, index) in productList" @click="toDetail(item)">	
				<div class="pro-pic">
					<img v-adaptiveSrc:li="item.imagesUrl" />
				</div>
				<div class="pro-right">
					<div class="pro-title">{{item.goodsName}}</div>
					<!--<div class="pro-desc">{{item.title}}</div>-->
					<div class="spec-list" v-if="item.chooseJsonProp != null">
						<div class="spec-item" v-for="(spec,key,i) in item.chooseJsonProp">
							<div class="spec-key">{{key}}：</div>
							<div class="spec-val">{{spec}}</div>
						</div>
					</div>
					<div class="pro-controls">
						<div class="pro-price">
							<template v-if="item.goodsType === 0">
								<span>{{item.goodsSalePrice | currency('￥')}}元</span>
							</template>
							<template v-else>
								{{item.goodsScore}} <span>积分</span>
							</template>
						</div>
						<div class="pro-number">×{{item.amount}}</div>
					</div>
				</div>
				<i class="arrow-icon iconfont icon-arrow-right-copy"></i>
			</li>
			
		</ul>
	</div>
</template>

<script>
	import util from '@/util/util';
	
	export default {
		props: {
			productList: {
				type: Array,
				default: function() {
					return [];
				}
			},
			queryParams: {
				type: Object,
				default() {
					return {}
				}
			},
			isCart: {
				type: String,
				default: ''
			},
			orderId: {
				type: Number,
				default: 0
			},
			redirectUrl: {
				type: String,
				default: ''
			},
			productDetailRedirectUrl: {
				type: String,
				default: ''
			},
			createOrderRedirectUrl1: {
				type: String,
				default: ''
			}
		},
		data() {
			return {
				query: {}
			}
		},
		mounted() {

		},
		methods: {

			toDetail(item) {
				if (this.isCart) {
                	this.query.isCart = this.isCart;
                }

                if (this.orderId) {
                	this.query.orderId = this.orderId;
                }

                if (this.redirectUrl) {
                	this.query.redirectUrl = this.redirectUrl;
                }

				this.query.goodsId = item.goodsId;

				this.$store.commit('updateDirection', 'left');
				this.$router.push({path: '/productDetail', query: this.query});
			}
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "proList.less";
</style>