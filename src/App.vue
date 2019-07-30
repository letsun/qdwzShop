<template>
  <div id="app" @touchmove.prevent="">
    <transition :name="direction">
    	<router-view class="view keep"></router-view>
    </transition>

  </div>
</template>
<script>

import 'static/less/common/reset.less';
import 'static/less/common/common.less';

import api from './util/api';


export default {
	name: 'App',
	beforeCreate() {

	},
	created() {

	},
	beforeMount() {

	},
	mounted() {
		this.$nextTick(() => {
			console.log('App.vue:mounted nextTick');
		});
	},
	computed: {
		direction() {
			return this.$store.state.direction;
		},
		keepAlList() {
			return this.$store.state.keepAlList;
		}
	}
}

</script>

<style scoped lang="less" rel="stylesheet">
	@import '../static/less/common/index.less';
	@import '../static/less/common/animate.less';
	#app {
		width: 100%;
		height: 100%;
		overflow: hidden;
		.view {
			position: absolute;
			left: 0;
			top: 0;
			right: 0;
			bottom: 0;
			background: #fff;
			box-shadow: 0 0 10px -3px  #000;
		}
	}
</style>