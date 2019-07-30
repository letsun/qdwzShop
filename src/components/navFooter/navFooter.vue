<template>
	<div>
		<ul class="footer-wrapper">
			<li class="footer-item" @click="tab">
				<router-link class="footer-item-link" to="/index">
					<i class="icon iconfont icon-ai-home"></i>
					<div class="title">首页</div>
				</router-link>
			</li>
			<li class="footer-item" @click="tab">
				<router-link class="footer-item-link" to="/category">
					<i class="icon iconfont icon-leimupinleifenleileibie2"></i>
					<div class="title">商品分类</div>
				</router-link>
			</li>
			<li class="footer-item" @click="tab" v-if="mallType != 1">
				<router-link class="footer-item-link" to="/cart">
					<i class="icon iconfont icon-gouwucheman"></i>
					<div class="title">购物车</div>
				</router-link>
			</li>
			<li class="footer-item" @click="tab">
				<router-link class="footer-item-link" to="/person">
					<i class="icon iconfont icon-gerenfill"></i>
					<div class="title">个人中心</div>
				</router-link>
			</li>
		</ul>
	</div>
</template>
<script>

	import util from '@/util/util';

	export default {
		computed: {
			mallType() {
				return this.$store.state.mallType;
			}
		},
		methods: {
			tab() {
				this.$store.commit('updateKeepAlList', false);
				this.$store.commit('updateDirection', '');
			}
		}
	}
</script>
<style lang="less" scoped rel="stylesheet">
	@import './navFooter.less';
</style>