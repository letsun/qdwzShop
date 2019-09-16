<template>
	<div>
		<div class="header-wrapper">
			<i class="back iconfont icon-fanhui2" @click="backPage" v-if="back"></i>
			<slot name="title"></slot>
			<slot name="addAddressBtn"></slot>
		</div>
	</div>
</template>

<script type="text/ecmascript-6">
	import util from '@/util/util';

	export default {
		props: {
			back: {
				type: String,
				default: ''
			},
			clickRedirect: {
				type: String,
				default: ''
			}
		},

		methods: {
			backPage() {
				this.$store.commit('updateDirection', 'right');
				this.$store.commit('updateKeepAlList', true);

				if (this.clickRedirect === 'true') {
					this.$emit('clickEvent');
				} else if (this.clickRedirect === 'false') {
					let path = util.getPath();
					this.$router.back();
				} else {
					let path = util.getPath();
					let query = {};
					
					// debugger;

					if (this.$route.query.goodsId) {
	                	query.goodsId = this.$route.query.goodsId;
	                }

	                if (this.$route.query.amount) {
	                	query.amount = this.$route.query.amount;
	                }

                    if (this.$route.query.chooseJsonProp) {
                        query.chooseJsonProp = this.$route.query.chooseJsonProp;
                    }

	                if (this.$route.query.isCart) {
	                	query.isCart = this.$route.query.isCart;
	                }

	                if (this.$route.query.orderId) {
	                	query.orderId = this.$route.query.orderId;
	                }

	                if (this.$route.query.redirectUrl) {
	                	query.redirectUrl = this.$route.query.redirectUrl;
	                }

	                console.log(3333);
	                console.log(query);

					this.$router.push({
						path: path,
						query: query
					});
				}
				
			}
		}
	}
</script>

<style scoped lang="less" rel="stylesheet">
	@import "./navHeader.less";
</style>