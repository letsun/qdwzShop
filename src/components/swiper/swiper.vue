<template>
	<div>
		<!-- Swiper Start -->
		<div class="swiper-container" :class="'swiper-' + swiperType" :id="'swiper-' + swiperType" v-if="imgList.length > 0">
		    <div class="swiper-wrapper">
		        <div class="swiper-slide" v-for="(item, index) in imgList" :key="index">
					<div class="slide-item" v-if="swiperType === 'home'">
						<img class="img" :src="item.picUrl" @click="toPath(item.linkUrl)" />
					</div>
					<div class="slide-item" v-else>
						<img v-adaptiveSrc="item.picUrl" @click="toPreview(item.picUrl)" v-if="item.goodsVideoUrl.length <= 0" />
						<div class="video-item" v-if="item.goodsVideoUrl.length > 0">
							<iframe :src='item.goodsVideoUrl' frameborder=0></iframe>
						</div>
					</div>
		        </div>
		    </div>
		    <div class="swiper-pagination" :id="'swiper-pagination-' + swiperType"></div>
		</div>
		<!--Swiper End-->
	</div>
</template>

<script>

	// 插件
	import Swiper from 'static/plugins/swiper/3.4.2/swiper.min';

	// 样式
	import 'static/plugins/swiper/3.4.2/swiper.min.css';

	export default {
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
				swiper: null
			}
		},
		updated() {
			this.updateSwiper();
			this.$emit('finishEvent');
		},
		mounted() {
			this.$emit('finishEvent');
			this.$nextTick(() => {
				this.$emit('finishEvent');
			});
		},
		methods: {
			initSwiper() {
				let autoplay = false;

				if (this.swiperType === 'home') {
					
					autoplay = 3000;

				}
				
				/** Initialize Swiper */
				this.swiper = new Swiper(`#swiper-${this.swiperType}`, {
					autoplay: autoplay,
					loop: false,
					speed: 500,
			        autoplayDisableOnInteraction: false,
			        pagination: `#swiper-pagination-${this.swiperType}`
				});				
			},
			updateSwiper() {
				if (!this.swiper) {
					this.initSwiper();
				}
			},
			toPath(param) {
				let reg = /(http:\/\/)|(https:\/\/)/;

				if (!param) {
					return;
				}

				if (reg.test(param)) {
					window.location.href = param;
				} else {
					
					this.$store.commit('updateDirection', 'left');

					this.$router.push({
						path: '/productDetail',
						query: {
							goodsId: param
						}
					});
				}
			},
            toPreview (imgUrl) {
                this.$emit('previewEvent', imgUrl);
			}
		}
	}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "swiper.less";
</style>