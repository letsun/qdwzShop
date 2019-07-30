<template>
	<div>
		<div class="no-record">
			<i class="icon" :class="iconType"></i>
			<div class="text">{{text}}</div>
		</div>
	</div>
</template>

<script>
	export default {
		props: {
			text: {
				type: String,
				default: ''
			},
			iconType: {
				type: String,
				default: ''
			}
		}
	}
</script>

<style scoped rel="stylesheet" lang="less">
	@import "noRecord.less";
</style>