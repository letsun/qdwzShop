<template>
	<div>
		<div class="address-wrapper">
			<div class="address-top">
				<div class="name">收货人：{{addressDetail.receiveName}}</div>
				<div class="tel">{{addressDetail.receivePhone}}</div>
			</div>
			<div class="address-infor">
				<div class="key">
					收货地址：
				</div>
				<div class="value">
					<span>{{addressDetail.receiveProvince}}</span><span>{{addressDetail.receiveCity}}</span><span>{{addressDetail.receiveArea}}</span> <span>{{addressDetail.receiveAddr}}</span>
				</div>
			</div>
			<i class="icon iconfont icon-dizhi"></i>
		</div>
	</div>
</template>

<script>
	import api from '@/util/api';

	export default {
		props: {
			addressDetail: {
				type: Object,
				default() {
					return {
						
					}
				}
			}
		},
		data() {
			return {
				addressInfor: {}
			}
		},
		watch: {
			'addressDetail'() {
				this.addressInfor = this.addressDetail;
			}
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "addressDetail.less";
</style>