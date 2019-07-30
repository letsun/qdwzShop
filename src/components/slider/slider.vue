<template>
	<yd-slider autoplay="3000" speed="500">
        <yd-slider-item  v-for="(item, index) in imgList" :key="index">
            <a :href="item.linkUrl" v-if="swiperType === 'home'">
                <img  v-adaptiveSrc="item.picUrl">
            </a>
            <a href="javascript:void(0)" v-else>
                <img v-adaptiveSrc="item.picUrl">
            </a>
        </yd-slider-item>
        
    </yd-slider>
</template>

<script>

	import Vue from 'vue';
	import {Slider, SliderItem} from 'vue-ydui/dist/lib.rem/slider';

	export default {
		components: {
			[Slider.name]: Slider,
			[SliderItem.name]: SliderItem
		},
		props: {
			imgList: {
				type: Array,
				default() {
					return []
				}
			},
			swiperType: {
				type: String,
				default: 'home'
			}
		},
		data() {
			return {
				swiper: {}
			}
		},
		updated() {
			this.$emit('finishEvent');
		},
		mounted() {
			this.$emit('finishEvent');
			this.$nextTick(() => {
				this.$emit('finishEvent');
			});
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "slider.less";
</style>