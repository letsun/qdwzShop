<template>
	<div>
		<transition name="search">
			<div class="filter-wrapper"  v-show="showSearchFilterList">
				<div ref="scrollWrapper" class="scroll-wrapper">
					<transition-group name="searchList" tag="ul" class="filter-list" :css="false" @before-enter="beforeEnter" @enter="enter" @leave="leave">
						<li class="item" v-for="(item, index) in searchFilterList" :data-index="index" :key="index" @click="toProduct(item.goodsId)">{{item.goodsName}}</li>
					</transition-group>
				</div>
			</div>
		</transition>
	</div>
</template>

<script>
	// 插件
	import BetterScroll from 'better-scroll';

	import api from '@/util/api';
	import util from '@/util/util';
	import statusCode from '@/util/statusCode';

	export default {
		props: {
			showSearchFilterList: {
				type: Boolean,
				default: true,
				
			}
		},
		data() {
			return {
				goodsList: [],
				searchFilterList: [],
				scroll: {},
				pageNum: 100,
				pageSize: 1
			}
		},
		computed: {
			mallType() {
				return this.$store.state.mallType;
			}
		},
		mounted() {
			this.$nextTick(() => {
				this.initScroll();
			});
		},
		watch: {
			'showSearchFilterList'() {
				this.iniGoods();
			}
		},
		updated() {
			this.scroll.refresh();
		},
		methods: {
			initScroll() {
				this.scroll = new BetterScroll(this.$refs.scrollWrapper, {
					scrollbar: {
						fade: true
					},
					click: true
				});
			},
			initGoodsList() {

				this.$http.get(api.product.goodsList, {
					params: {
						mallType: this.mallType,
						pageNum: this.pageNum,
						pageSize: this.pageSize
					}
				}).then((response) => {
					let res = response.data;
					
					if (res.code === statusCode.SUCCESS) {
						this.goodsList = res.data.goodsList
					} else {
            			util.checkStatus(this, res, {isComponent: true}, this.initGoodsList);
            			
					}
				});			
			},
			iniGoods() {
				if (this.showSearchFilterList) {
					this.initGoodsList();
				}
			},
			searchFilter(searchWord) {

				this.searchFilterList = [];

				if (searchWord) {

					let searchReg = new RegExp(searchWord, 'i');

					for(let item of this.goodsList) {
						if (searchReg.test(item.goodsName)) {
							this.searchFilterList.push(item);
						}
					};
				}
				
			},
			toProduct(goodsId) {
				this.$store.commit('updateDirection', 'left');
				this.$router.push({
					path: '/productDetail',
					query: {
						goodsId: goodsId
					}
				});
			},
			beforeEnter(el) {
				el.style.opacity = 0;
			},
			enter(el, done) {
				let delay = el.dataset.index * 10;

				setTimeout(() => {
					Velocity(el, {
						opacity: 1
					}, {
						complete: done
					});
				}, delay);
			},
			leave(el, done) {
				let delay = el.dataset.index * 30;
				
				setTimeout(() => {
					Velocity(el, {
						opacity: 0
					}, {
						complete: done
					});
				}, delay);
			}
		}
	}
</script>

<style scoped lang="less" rel="stylesheet">
	@import "searchFilterList.less";
</style>