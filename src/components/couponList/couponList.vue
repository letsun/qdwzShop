<template>
	<div>
		<ul class="coupon-list" v-if="couponList.length">
			<li class="item" :class="{'disable': !minDeduction}">
				<div @click="showCouponList">
					<div class="title">优惠券<span>（有可以使用优惠券）</span></div>
					<div class="desc">本券不可与其它优惠券同时使用</div>
					<div class="right-wrapper">
						 <div class="right-container">
						 	<span class="number">{{couponList.length}}</span>
						 	<i class="icon iconfont icon-fanhui2" :class="{showCoupon: showCouponFlag}"></i>
						 </div>
					</div>
				</div>
				
				<ul class="coupon-list_1" v-show="showCouponFlag">
					<li class="coupon-item" v-for="(item, index) in couponList" :key="index">
						<div class="name">{{item.name}}</div>
						<div class="number">
							<i class="icon iconfont icon-chenghao"></i>
							<span>1</span>
						</div>
						<div class="check-icon-wrapper">
							<gou-gou :isSelected="item.isSelected" :item="item" :key="index" @editEvent="edit"></gou-gou>
						</div>
					</li>
				</ul>
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
			GouGou,
		},
		props: {
			totalMoney: {
				type: Number,
				default: 0
			}
		},
		data() {
			return {
				couponList: [],
				minDeduction: true,
				showCouponFlag: false,
			}
		},
		mounted() {
			this.$nextTick(() => {

				this.initCouponList();
			});
		},
		computed: {
			
		},
		methods: {
			initCouponList() {
				this.$http.get(api.coupon.findCoupon, {
					params: {
						couponType: 3,
						pageNum: 100,
						pageSize: 1,
						status: 0
					}
				}).then((response) => {
					let res = response.data;

					if (res.code === statusCode.SUCCESS) {
						this.couponList = res.data.couponList;
					} else {

						util.checkStatus(this, res, {isComponent: true}, this.initCouponList);

					}
				});
			},
			showCouponList() {
				this.showCouponFlag = !this.showCouponFlag;
			},
			edit(check, item) {
				let status = 0;
				let couponId = 0;
				let couponMoney = 0;
				let couponMoney2 = 0;
				for (let i = 0, len = this.couponList.length; i < len; i++) {
                    if (this.couponList[i].couponId === item.couponId) {
                        if (this.totalMoney >= this.couponList[i].fullPrice) {
                            if (this.couponList[i].isSelected === 0) {
                                this.couponList[i].isSelected = 1;
                                status = 1;
                                couponId = this.couponList[i].couponId;
                                couponMoney = this.couponList[i].reducePrice;
                                couponMoney2 = this.couponList[i].fullPrice;
                            } else {
                                this.couponList[i].isSelected = 0;
                                status = 0;
                                couponId = 0;
                                couponMoney2 = this.couponList[i].fullPrice;
                            }
                        } else {
                            this.couponList[i].isSelected = 0;
                            couponMoney2 = this.couponList[i].fullPrice;
						}

                    } else {
                        this.couponList[i].isSelected = 0;
                    }

                    this.$emit('updateCashAndCouponEvent', status, couponId, couponMoney,couponMoney2);
                    this.$emit('cancelIntegralListEvent');
				}
			},
			cancelCoupon() {
				for (let i = 0, len = this.couponList.length; i < len; i++) {
					this.couponList[i].isSelected = 0;
				}

				this.$emit('updateCashAndCouponEvent', 0, 0, 0,0);
			},
            closeModelWin() {
                this.showModel = false;
                this.errorTip = '';
            },
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "couponList.less";
</style>