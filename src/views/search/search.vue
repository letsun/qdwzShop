<template>
	<div>
		<search @showSearchFilterEvent="showSearchFilter" @searchProductToPageEvent="searchProductToPage" @searchProductListEvent="searchProductList" :showSearchFilterList="showSearchFilterList" page="search"></search>
		
		<search-filter-list ref="searchFilterList" :showSearchFilterList="showSearchFilterList" @errorEvent="showError"></search-filter-list>
		
		<div class="scroll-wrapper" ref="scrollWrapper">
			<div class="wrapper">
				<div class="search-wrapper">
					<template v-if="searchFilterList.length">
						<ul class="search-list">
							<li class="search-item" data-tagname="li" v-for="(item, index) in searchFilterList" @click="toProduct(item.goodsId)" :key="index">
								<div class="search-pic">
									<img v-adaptiveSrc:li="item.imagesUrl" />
								</div>
								
								<div class="search-right">
									<div class="search-title">{{item.goodsName}}</div>
									<div class="search-desc">{{item.goodsTitle}}</div>
									<div class="search-controls">
										<div class="search-price">
											<template v-if="item.goodsType === 0">
												{{item.goodsSalePrice | currency('￥')}}<span>元</span>
											</template>
											<template v-else>
												{{item.goodsScore}} <span>积分</span>
											</template>
										</div>
									</div>
								</div>
								<i class="arrow-icon iconfont icon-arrow-right-copy"></i>
							</li>
						</ul>
						<!-- 下拉加载更多 -->
						<loading-tip :loadingTip="loadingTip" :isShow="searchFilterList.length >= pageNum" :hasNext="hasNext"></loading-tip>
					</template>
					<template v-else>
						<div class="no-record-wrapper">
							<no-record iconType="noSearch" text="您搜索的商品不存在"></no-record>
						</div>
					</template>
				</div>
			</div>
		</div>
		<!-- 页面加载状态 -->
		<transition name="fade">
			<loading-page v-if="!isLoadCompleted" page="productDetail"></loading-page>
		</transition>

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

	// 组件
	import Search from '@/components/searchControls/searchControls';
	import SearchFilterList from '@/components/searchFilterList/searchFilterList';
	import noRecord from '@/components/noRecord/noRecord';
	import LoadingTip from '@/components/loadingTip/loadingTip';
	import LoadingPage from '@/components/loadingPage/loadingPage';
	import ModelWin from '@/components/modelWin/modelWin';

	import api from '@/util/api';
	import util from '@/util/util';
	import statusCode from '@/util/statusCode';

	export default {
		components: {
			Search,
			noRecord,
			SearchFilterList,
			LoadingTip,
			ModelWin,
			LoadingPage
		},
		data() {
			return {
				searchWord: '',
				searchFilterList: [],
				scroll: {},
				showSearchFilterList: false,
				pageNum: 6,
				pageSize: 1,
				hasNext: true,
				loadingTip: '下拉加载更多',
				loading: false,
				errorTip: '',
				showModel: false,
				isConfirm: false,
				okType: '',
				isLoadCompleted: false
			}
		},
		mounted() {

			this.$nextTick(() => {

				this.searchWord = this.$route.query.searchWord;
				this.initSearchFilterList();
				this.initScroll();
				util.commonFunc(this);
			});
		},
		computed: {
			mallType() {
				return this.$store.state.mallType;
			}
		},
		updated() {
			this.finish();
		},
		methods: {
			initScroll() {
				this.scroll = new BetterScroll(this.$refs.scrollWrapper, {
					scrollbar: {
						fade: true
					},
					click: true,
					pullUpLoad: {
					  threshold: 0
					}
				});

				this.scroll.on('pullingUp', () => {
					
					if (this.hasNext) {
						this.pageSize++;
						this.loadingTip = '数据正在加载中....';
						this.loading = true;
						this.initSearchFilterList();
						
					} else {
						this.loadingTip = '已经没有更多了';
					}
				});
			},
			initSearchFilterList(type) {

				if (!this.searchWord) {
					this.searchFilterList = [];
					this.isLoadCompleted = true;
				} else {
					this.$http.get(api.product.search, {
						params: {
							mallType: this.mallType,
							searchWord: this.searchWord,
							pageNum: this.pageNum,
							pageSize: this.pageSize
						}
					}).then((response) => {
						let res = response.data;

						if (res.code === statusCode.SUCCESS) {
							this.loadingTip = '下拉加载更多';
							this.hasNext = res.data.hasNext;
							this.isLoadCompleted = true;

							if (this.loading) {
								this.searchFilterList = [...this.searchFilterList, ...res.data.goodsList];	
							} else {
								this.searchFilterList = res.data.goodsList
							}
						} else {

							util.checkStatus(this, res, {}, this.initSearchFilterList, type);
						
							
						}
					});
				}				
			},
			searchProductToPage(searchWord) {
				this.showSearchFilterList = false;
				this.loading = false;
				this.searchWord = searchWord;
				this.pageSize = 1;
				
				this.initSearchFilterList();
			},
			showSearchFilter(flag) {
				this.showSearchFilterList = flag;
			},
			searchProductList(searchWord) {
				this.$refs.searchFilterList.searchFilter(searchWord);
			},
			toProduct(goodsId) {

				this.$emit('updateDirection', 'left');
				
				this.$router.push({
					path: '/productDetail',
					query: {
						goodsId: goodsId
					}
				});
			},
			closeModelWin() {
				this.isConfirm = false;
				this.showModel = false;
			},
			okModelWin(type) {
				type();
			},
			finish() {
				if (!this.loading) {
					this.scroll.scrollTo(0, 0);
				}
				this.scroll.refresh();
				this.scroll.finishPullUp();
			},
			showError(msg, okType, isConfirm = false) {
				this.showModel = true;

				if (isConfirm) {
					this.isConfirm = isConfirm;
					this.okType = okType;
				}
				
				this.errorTip = msg;
			}
		}
	}
</script>
<style lang="less" scoped rel="stylesheet">
	@import "search.less";
</style>