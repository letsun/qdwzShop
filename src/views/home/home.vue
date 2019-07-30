<template>
	<div>
		<search @showSearchFilterEvent="showSearchFilter" @searchProductToPageEvent="searchProductToPage" @searchProductListEvent="searchProductList" :showSearchFilterList="showSearchFilterList" page="home" :shopLogo="companyInformation.shopLogo"></search>
		
		<div class="scroll-wrapper" ref="scrollWrapper">
			<div class="wrapper">
				
				<swiper-component ref="swiper" :imgList="imgList" swiperType="home" @finishEvent="finish"></swiper-component>

				<template v-if="floorList.length">
					<div class="goods-wrapper" v-for="(item, index) in floorList" :key="index">
						<div class="goods-title">{{item.floorName}}</div>
						
						<!-- 最后一个楼层 -->
						<goods-list ref="goodsListElement" v-if="index === floorList.length - 1" :productList="item.floorDetailInfo.goodsList" :floorId="item.floorId" :pageSize="pageSize" :pageNum="pageNum" type="all" @finishEvent="finish" @updateHasNextEvent="updateHasNext" @errorEvent="showError"></goods-list>

						<!-- 其它楼层 -->
						<goods-list v-else type="hot" :productList="item.floorDetailInfo.goodsList" @errorEvent="showError"></goods-list>

						<!-- 下拉加载更多 -->
						<loading-tip :loadingTip="loadingTip" :isShow="index === floorList.length - 1 && item.floorDetailInfo.goodsList.length >= pageNum" :hasNext="hasNext"></loading-tip>
					</div>
				</template>

				<template v-else>
					<div class="no-floor">
						<no-record iconType="noProduct" text="暂时无楼层信息"></no-record>
					</div>
				</template>
				
			</div>
			<!-- 页面加载状态 -->
			<transition name="fade">
				<loading-page v-if="!isLoadCompleted" page="noTop"></loading-page>
			</transition>
		</div>
		<nav-footer></nav-footer>

		<model-win :show="showModel">
			<template slot="content">
				{{errorTip}}
			</template>
			<template slot="btn">
				<template  v-if="isConfirm">
					<a href="javascript:void(0);" class="btn" @click="closeModelWin">取消</a>
					<a href="javascript:void(0);" class="btn btn-last" @click="okModelWin(okType)">确定</a>
				</template>
				<template  v-else>
					<a href="javascript:void(0);" class="btn" @click="closeModelWin">确定</a>
				</template>
			</template>
		</model-win>

	</div>
</template>

<script>
	// 插件
	import BetterScroll from 'better-scroll';
	import Vue from 'vue';
    import wx from 'weixin-js-sdk';

	// 组件
	import Search from '@/components/searchControls/searchControls';
	import SearchFilterList from '@/components/searchFilterList/searchFilterList';
	import NavFooter from '@/components/navFooter/navFooter';
	import GoodsList from '@/components/goodsList/goodsList';
	import SwiperComponent from '@/components/swiper/swiper';
	// import SliderComponent from '@/components/slider/slider';
	import LoadingTip from '@/components/loadingTip/loadingTip';
	import ModelWin from '@/components/modelWin/modelWin';
	import LoadingPage from '@/components/loadingPage/loadingPage';
	import noRecord from '@/components/noRecord/noRecord';

	import api from '@/util/api';
	import util from '@/util/util';
	import statusCode from '@/util/statusCode';

	export default {
		components: {
			Search,
			SearchFilterList,
			NavFooter,
			GoodsList,
			SwiperComponent,
			LoadingTip,
			ModelWin,
			LoadingPage,
			noRecord
		},
		data() {
			return {
				imgList: [],
				floorList: [],
				scroll: null,
				scrollTo: 0,
				pageSize: 1,
				pageNum: 10,
				hasNext: false,
				loadingTip: '下拉加载更多',
				showSearchFilterList: false,
				errorTip: '',
				isConfirm: true,
				showModel: false,
				okType: '',
				isLoadCompleted: false,
				startTime: '',
				endTime: ''
			}
		},
		computed: {
            getHeaders() {
                return this.$store.getters.getHeaders;
            },
			mallType() {
				return this.$store.state.mallType;
			},
			companyInformation() {
				return this.$store.state.companyInformation;
			}

		},
		beforeMount() {
			console.log('home.vue:beforeMount');
		},
		mounted() {
			this.$nextTick(async () => {
                this.findShareParams();
				console.log('home.vue:mounted nextTick');

				this.startTime = +(new Date());

				await this.initSlide();
				await this.initFloor();

				await this.loadImage();

				this.finish();

				await util.commonFunc(this);

			});
		},
		activated() {
			this.finish();
		},
		methods: {
			initScroll() {
				this.scroll = new BetterScroll(this.$refs.scrollWrapper, {
					scrollbar: {
						fade: true
					},
					probeType: 3,
					click: true,
					pullUpLoad: {
					  threshold: 100
					}
				});

				this.scroll.on('scroll', (e) => {
					this.scrollTo = e.y;
				});
				
				this.scroll.on('pullingUp', () => {
					if (this.hasNext) {
						this.loadingTip = '数据正在加载中....';
						this.pageSize++;
					} else {
						this.loadingTip = '已经没有更多了';
					}
				});
			},
			initSlide() {

				return new Promise((resolve, reject) => {
					this.$http.get(api.home.slide).then((response) => {
						let res = response.data;

						if (res.code === 200) {
							this.imgList = res.data;

						} else {

							util.checkStatus(this, res, {}, this.initSlide);
							
						}

						resolve();

						this.$nextTick(() => {

							this.finish();
						});
					});
				});
				
			},
			initFloor() {
				return new Promise((resolve, reject) => {
					this.$http.get(api.home.floor, {
                        headers: this.getHeaders,
						params: {
							goodsNum: this.pageNum,
							mallType: this.mallType
						}
					}).then((response) => {
						let res = response.data;

						if (res.code === 200) {
							this.floorList = res.data;
							if (this.floorList.length) {
								this.hasNext = this.floorList[this.floorList.length - 1].floorDetailInfo.hasNext;
							} else {
								this.hasNext = false;
							}
						} else {
							util.checkStatus(this, res, {}, this.initFloor);
						}

						resolve();

						this.$nextTick(() => {
							this.finish();
						});
					});
				});
			},
			finish(type = false) {
				if (type) {
					this.loadingTip = '下拉加载更多';
				}

				if (this.scroll) {
					this.scroll.scrollTo(0, this.scrollTo);
					this.scroll.refresh();
					this.scroll.finishPullUp();
				} else {
					this.initScroll();
				}
				
			},
			showSearchFilter(flag) {
				this.showSearchFilterList = flag;
			},
			searchProductList(searchWord) {
				this.$refs.searchFilterList.searchFilter(searchWord);
			},
			searchProductToPage(searchWord) {
				this.$store.commit('updateDirection', 'left');
				this.$router.push({
					path: '/search',
					query: {
						searchWord: searchWord
					}
				});
			},
			closeModelWin() {
				this.showModel = false;
				this.isConfirm = false;
			},
			okModelWin(type) {
				type();
			},
			updateHasNext(flag) {
				this.hasNext = flag;
			},
			showError(msg, okType, isConfirm = false) {
				this.showModel = true;

				if (isConfirm) {
					this.isConfirm = isConfirm;
					this.okType = okType;
				} else {
					this.isConfirm = false;
					this.okType = '';
				}
				
				this.errorTip = msg;
			},
			async loadImage() {
				let imgList = [];

				for (var i = 0, len = this.floorList.length; i < len; i++) {
					
					var goodsList = this.floorList[i].floorDetailInfo.goodsList;
					for (var k = 0, ken = goodsList.length; k < ken; k++) {
						imgList.push(goodsList[k].imagesUrl);
					}
				}

				let loadImagePromiseArr = imgList.map((img) => {
					return util.loadImage(img);
				});

				Promise.all(loadImagePromiseArr).then(() => {
					this.isLoadCompleted = true;
					this.endTime = +(new Date());

					let time = new Date(this.endTime - this.startTime);
					console.log(this.endTime - this.startTime);
				});
			},
            // 自定义分享
            findShareParams () {
                this.$http.get(api.product.findShareParams,{
                    params: {
                        goodsId: 66,
                        thisUrl: window.location.href,

                    }
                }).then((response) => {
                    let res = response.data;
                    if (res.code === statusCode.SUCCESS) {
                        // 微信分享
                        wx.config({
                            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                            appId: res.data.autAppid, // 必填，公众号的唯一标识
                            timestamp: res.data.timestamp, // 必填，生成签名的时间戳
                            nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
                            signature: res.data.signature,// 必填，签名
                            jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'updateTimelineShareData', 'updateAppMessageShareData', 'hideMenuItems', 'showMenuItems'] // 必填，需要使用的JS接口列表
                        });

                        /*wx.hideMenuItems({
                            menuList: ["menuItem:share:timeline", "menuItem:copyUrl", "menuItem:share:appMessage", "menuItem:share:qq", "menuItem:share:weiboApp", "menuItem:favorite", "menuItem:share:facebook", "menuItem:share:QZone", "menuItem:editTag", "menuItem:delete", "menuItem:copyUrl", "menuItem:originPage", "menuItem:readMode", "menuItem:openWithQQBrowser", "menuItem:openWithSafari", "menuItem:share:email", "menuItem:share:brand"] // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮
                        });*/

                        setTimeout(function () {
                            wx.hideMenuItems({
                                menuList: ["menuItem:share:timeline", "menuItem:copyUrl", "menuItem:share:appMessage", "menuItem:share:qq", "menuItem:share:weiboApp", "menuItem:favorite", "menuItem:share:facebook", "menuItem:share:QZone", "menuItem:editTag", "menuItem:delete", "menuItem:copyUrl", "menuItem:originPage", "menuItem:readMode", "menuItem:openWithQQBrowser", "menuItem:openWithSafari", "menuItem:share:email", "menuItem:share:brand"] // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮
                            });
                        },3000);
                    }
                });
            }
		}
	}
</script>

<style scoped lang="less" rel="stylesheet">
	@import 'home.less';
</style>