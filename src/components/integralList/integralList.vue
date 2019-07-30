<template>
	<div>
		<ul class="coupon-list" v-if="item.minMoney && myScore !== 0">
			<li class="item" :class="{'disable': !minDeduction}">
				<div class="title">积分抵扣</div>
				<div class="desc">可用{{myScore}}积分，本次可抵扣{{deductAbleMoney | currency('￥')}}元</div>
				<div class="check-icon-wrapper">
					<gou-gou :isSelected="item.isSelected" :item="item" @editEvent="edit"></gou-gou>
				</div>
			</li>
		</ul>
	</div>
</template>

<script>
	import GouGou from '@/components/gouGou/gouGou';

	import api from '@/util/api';
	import util from '@/util/util';
	import statusCode from '@/util/statusCode';

	export default {
		components: {
			GouGou
		},
		props: {
			totalMoney: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				item: {
					status: 1,
					isSelected: 0,
					scoreExchange: 0,
					minMoney: 0
				}
			}
		},
		mounted() {
			this.$nextTick(() => {

				this.initCouponList();
			});
		},
		computed: {
			
			myScore() {
				return this.$store.state.balanceScore;
			},
			deductAbleMoney() {
				let money = 0;

				if (this.minDeduction) {

					let exchangeMoney = parseInt(this.myScore / this.item.scoreExchange);
					let totalMoney = parseInt(this.totalMoney);

					if (exchangeMoney <= totalMoney) {
						money = exchangeMoney;
					} else {
						money = totalMoney;
					}
					
				}

				return money;
			},
			deductAbleScore() {
				let score = this.deductAbleMoney * this.item.scoreExchange;
				
				return score;
			},
			minDeduction() {
				let flag = false;
				if (this.totalMoney >= this.item.minMoney && this.myScore >= this.item.scoreExchange) {
					flag = true;
				}

				return flag;
			}
		},
		methods: {
			initCouponList() {
				this.$http.get(api.discount.paySet).then((response) => {
					let res = response.data;

					if (res.code === statusCode.SUCCESS) {
						this.item.minMoney = res.data.minMoney;
						this.item.scoreExchange = res.data.scoreExchange;
					} else {
						util.checkStatus(this, res, {isComponent: true}, this.initCouponList);
					}
				});
			},
			edit(check, item) {

				let deductAbleMoney = 0;
				let deductAbleScore = 0;


				if (!this.minDeduction) {
					this.$emit('minDeductionErrorEvent', '积分不能抵扣');
					return;
				}

				if (item.isSelected === 1) {
					item.isSelected = 0;
					deductAbleMoney = 0;
					deductAbleScore = 0;

				} else {
					item.isSelected = 1;
					deductAbleMoney = this.deductAbleMoney;
					deductAbleScore = this.deductAbleScore;
				}


				this.$emit('deductionEvent', deductAbleMoney, deductAbleScore);	
				this.$emit('updateCashAndIntegralEvent', item.isSelected);
				this.$emit('cancelCouponEvent');
			},
			cancelIntegral() {
				this.item.isSelected = 0;
				this.$emit('deductionEvent', 0, 0);	
				this.$emit('updateCashAndIntegralEvent', this.item.isSelected);
			}
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "integralList.less";
</style>