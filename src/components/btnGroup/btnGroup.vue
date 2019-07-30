<template>
	<div>
		<div class="controls">
			<a href="javascript:void(0)" class="btn" @click="leftClickBtn">
				<slot name="btn_1"></slot>
			</a>
			<a href="javascript:void(0)" class="btn"  @click="rightClickBtn">
				<slot name="btn_2"></slot>
			</a>
		</div>
	</div>
</template>

<script>
	import api from '@/util/api';

	export default {
		methods: {
			leftClickBtn() {
				this.$emit('leftClickBtnEvent');
			},
			rightClickBtn() {
				this.$emit('rightClickBtnEvent');
			}
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "btnGroup.less";
</style>