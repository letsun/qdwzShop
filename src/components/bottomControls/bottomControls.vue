<template>
	<div>
		<div class="cart-infor" :class="'type-' + pageType">
			<div class="left">合计：
				<template v-if="goodsType === 0">
					{{price | currency('￥')}}<span>元</span>
				</template>
				<template v-else>
					{{totalScore}} <span>积分</span>
				</template>
			</div>
			<div class="buy" @click="createOrder" :class="{checked: checkCount <= 0}">
				<i class="icon iconfont icon-qian"></i>
				<slot></slot>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		props: {
			pageType: {
				type: String,
				default: 'order'
			},
			price: {
				type: Number,
				default: 0
			},
			totalScore: {
				type: Number,
				default: 0
			},
			goodsType: {
				type: Number,
				default: 0
			},
			checkCount: {
				type: Number,
				default: 0
			}
		},
		methods: {
			createOrder() {
				this.$emit('clickEvent');
			}
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "./bottomControls.less";
</style>