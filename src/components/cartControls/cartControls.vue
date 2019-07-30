<template>
	<div>
		<div class="controls" :class="'cart-type-' + cartType">
			<div class="cart-reduce" @click="edit('reduce')">-</div>
			<div class="cart-number">{{amount}}</div>
			<div class="cart-add" @click="edit('add')">+</div>
		</div>
	</div>
</template>

<script>
	export default {
		props: {
			cartType: {
				type: String,
				default: 'list'
			},
            amount: {
				type: Number,
				default: 1
			},
			item: {
				type: Object,
				default: function() {
					return {};
				}
			},
            isAddCart: {
                type: Number,
                default: 0
			}
		},
		methods: {
			edit(type){
                this.$emit('editEvent',type,this.item);
			}
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "./cartControls.less";
</style>