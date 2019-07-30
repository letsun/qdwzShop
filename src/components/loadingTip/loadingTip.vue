<template>
	<div>
		<div class="loading-wrapper" v-if="isShow">
			<span class="icon-wrapper iconRotate" v-if="hasNext && loadingTip === '数据正在加载中....'">
				<i class="icon iconfont icon-ico_loading"></i>
			</span>
			<span class="loading-tip">{{loadingTip}}</span>
		</div>
	</div>
</template>

<script>
	export default {
		props: {
			loadingTip: {
				type: String,
				default: ''
			},
			isShow: {
				type: Boolean,
				default: false
			},
			hasNext: {
				type: Boolean,
				default: false
			}
		}
	}
</script>

<style lang="less" scoped rel="styleshett">
	@import "loadingTip.less";
</style>