<template>
	<div>
		<div class="loading-wrapper">
			<div class="loading-container">
				<div class="loading-content">
					<span class="icon-wrapper">
						<i class="icon"></i>
					</span>
					<span class="loading-tip"><slot></slot></span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		props: {
			loadingTip: {
				type: String,
				default: ''
			}
		}
	}
</script>

<style lang="less" scoped rel="styleshett">
	@import "waitingTip.less";
</style>