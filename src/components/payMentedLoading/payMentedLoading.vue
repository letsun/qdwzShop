<template>
	<div>
		<div class="payMented-loading" v-if="payMentedLoading">
			<div class="container">
				<div class="countdown">{{countdownTip}}</div>
				<div class="countdown-text">请稍等，正在检查订单中...</div>
			</div>
			<div class="advertage">
				更多优惠等你来
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		props: {
			payMentedLoading: {
				type: Boolean,
				default: false
			},
			countdownTip: {
				type: Number,
				default: 5
			}
		},
		data() {
			return {
				
			}
		},
		mounted() {
			this.$nextTick(() => {
				
			});
		},
		methods: {
			
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "PayMentedLoading.less";
</style>