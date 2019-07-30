<template>
	<div>
		<i class="check-icon iconfont" :class="{'icon-gou': isSelected === 1}" @click="edit"></i>
	</div>
</template>

<script>
	export default {
		props: {
            isSelected: {
				type: Number,
				default: 1
			},
			item: {
				type: Object,
				default: function() {
					return {};
				}
			}
		},
		methods: {
			edit(type) {
				this.$emit('editEvent', 'check', this.item);
			}
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "GouGou.less";
</style>