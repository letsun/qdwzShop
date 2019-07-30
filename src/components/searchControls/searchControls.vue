<template>
	<div>
		<div class="search-wrapper">

			<template v-if="page==='home'">
				<transition name="logo">
					<!-- <div class="logo" v-show="!showSearchFilterList"> -->
					<div class="logo">
						<img :src="shopLogo" alt="" />
					</div>
				</transition>
				<div class="search-con" @click="searchProductToPage">
					<div class="search-input">
						<!-- <div class="search-text-tip" v-show="!showSearchFilterList" @click="showSearchFilter">{{searchWord ? searchWord : '请输入查询的商品名称'}}</div> -->
						<div class="search-text-tip" @click="showSearchFilter">{{searchWord ? searchWord : '请输入查询的商品名称'}}</div>
					</div>
					<a class="search-btn iconfont icon-sousuo" href="javascript: void(0);"></a>
				</div>
			</template>
			
			<template v-else>
				<i class="back iconfont icon-fanhui2" @click="backPage"></i>
				<div ref="searchCon" class="search-con search-con1">
					<div class="search-input">
						<input ref="searchText" class="search-text" type="text" v-model="searchWord" @keyup="searchProductList" @click="showSearchFilter" placeholder="请输入查询的商品名称" />
					</div>
					<a class="search-btn iconfont icon-sousuo" href="javascript: void(0);" @click="searchProductToPage"></a>
				</div>
				<transition name="cancelBtn">
					<button class="cancel-search" @click="backPage">取消</button>
				</transition>
			</template>
		</div>
	</div>
</template>

<script>

	export default {
		props: {
			showSearchFilterList: {
				type: Boolean,
				defualt: false
			},
			page: {
				type: String,
				default: 'home'
			},
			shopLogo: {
				type: String,
				defualt: ''
			}
		},
		data() {
			return {
				searchWord: '',
				searchFlag: false
			}
		},
		computed: {
			companyId() {
				
				return this.$store.state.companyId;
			}
		},
		beforeMount() {
			console.log('component searchControls.vue:beforeMount');
		},
		mounted() {

			console.log('component searchControls.vue:mounted');

			this.$nextTick(() => {

				console.log('component searchControls.vue:mounted nextTick');

				this.searchWord = this.$route.query.searchWord;

			});
		},
		methods: {
			showSearchFilter() {
				this.searchFlag = true;
				this.$emit('showSearchFilterEvent', true);
			},
			hideSearchFilter() {
				this.$emit('showSearchFilterEvent', false);
			},
			searchProductList() {
				this.$emit('searchProductListEvent', this.searchWord);
			},
			searchProductToPage() {
				this.$emit('searchProductToPageEvent', this.searchWord);
			},
			backPage() {
				this.$store.commit('updateDirection', 'right');
				this.$router.push({
					path: '/home'
				});
			}
		}
	}
</script>
<style scoped lang="less" rel="stylesheet">
	@import 'searchControls.less';
</style>