<template>
	<div class="loading-wrapper" :class="page">
		<div class="loading iconRotate iconfont icon-loading1"></div>
	</div>
</template>

<script>
	export default {
		props: {
			page: {
				type: String,
				default: ''
			}
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "loadingPage.less";
</style>