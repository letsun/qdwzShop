<template>
	<div>
		<nav-header back="true">
			<div class="title" slot="title">我的积分</div>
		</nav-header>
		<div class="scroll-wrapper" ref="scrollWrapper">
			<div class="wrapper">
				<ul class="money-list">
					<li class="money-item" v-for="(item, index) in myPengBiList">
						<div class="title">{{item.desc}}</div>
						<div class="money-desc">
							<span class="order-id">订单号： {{item.orderId}}</span>|
							<span class="date">{{item.createTime}}</span>
						</div>
						<i class="arrow-icon">+15</i>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script>
	// 插件
	import BetterScroll from 'better-scroll';

	// 组件
	import NavHeader from '@/components/navHeader/navHeader';

	import api from '@/util/api';

	export default {
		components: {
			NavHeader
		},
		data() {
			return {
				myPengBiList: [],
				page: 1,
				pageSize: 8
			}
		},
		mounted() {
			this.$nextTick(() => {
				this.initMoneyList();
				this.initScroll();
			});
		},
		methods: {
			initScroll() {
				var scroll = new BetterScroll(this.$refs.scrollWrapper, {
					scrollbar: {
						fade: true
					},
					click: true
				})
			},
			initMoneyList() {
				this.$http.get(api.discount.myPengBiList).then((response) => {
					let res = response.data;

					if (res.status === 1001) {

					} else if (res.status === 1) {
						this.myPengBiList = res.result.list;
					}
				});
			}
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "./money.less";
</style>