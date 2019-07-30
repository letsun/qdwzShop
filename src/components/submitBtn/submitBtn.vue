<template>
	<div>
		<a href="javascript:void(0);" class="submit-btn" @click="emitEvent">
			<slot></slot>
		</a>
	</div>
</template>

<script>
	export default {
		methods: {
			emitEvent() {
				this.$emit('clickEvent');
			}
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "./submitBtn.less";
</style>