<template>
	<div class="win-mask" v-show="show">
		<div class="win-wrapper" v-show="show" :class="{showWin: show ,hideWin: !show}">
			<div class="content-wrapper">
				<slot name="content"></slot>
			</div>
			<div class="btn-wrapper">
				<slot name="btn"></slot>
			</div>
		</div>
		<div class="mask" v-show="show" :class="{showMask: show}"></div>
	</div>
</template>

<script>
	export default {
		props: {
			show: {
				type: Boolean,
				default: false
			}
		},
		methods: {
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "modelWin.less";
</style>