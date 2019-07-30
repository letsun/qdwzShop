<template>
	<div>
		<nav-header>
			<div class="title" slot="title">商品分类</div>
		</nav-header>
		<div class="category-wrapper">
			<div class="menu-container">
				<menu-wrapper @sendCategoryIdEvent="receiptCategoryFunc" @errorEvent="showError"></menu-wrapper>
			</div>
			<div class="goods-container">
				<category-list ref="categoryList" :isLoadCompleted="isLoadCompleted" :isLoadPageCompleted="isLoadPageCompleted" @updateLoadCompletedEvent="updateLoadCompleted" @updatePageLoadCompleteEvent="updatePageLoadCompleted" @errorEvent="showError"></category-list>
			</div>
			
			<!-- 页面加载状态 -->
			<transition name="fade">
				<loading-page v-if="!isLoadPageCompleted" page="noTop"></loading-page>
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
	import betterScroll from 'better-scroll';

	// 组件
	import NavHeader from '@/components/navHeader/navHeader';
	import NavFooter from '@/components/navFooter/navFooter';
	import ModelWin from '@/components/modelWin/modelWin';
	import MenuWrapper from '@/components/menuWrapper/menuWrapper';
	import CategoryList from '@/components/categoryList/categoryList';
	import LoadingPage from '@/components/loadingPage/loadingPage';

	import util from '@/util/util';

	export default {
		components: {
			NavHeader,
			NavFooter,
			MenuWrapper,
			CategoryList,
			LoadingPage,
			ModelWin
		},
		data(){
			return {
				isLoadCompleted: true,
				isLoadPageCompleted: false,
				errorTip: '',
				isConfirm: true,
				showModel: false,
				okType: '',
			}
		},
		mounted() {
			this.$nextTick(() => {
				util.commonFunc(this);
			});
		},
		methods: {
			receiptCategoryFunc(typeId, menu) {
				this.isLoadCompleted = false;
				this.$refs.categoryList.sendCategoryIdToCategoryList(typeId, menu);
			},
			updateLoadCompleted(flag) {
				this.isLoadCompleted = flag;
			},
			updatePageLoadCompleted(flag) {
				this.isLoadPageCompleted = flag;
			},
			closeModelWin() {
				this.showModel = false;
				this.isConfirm = false;
			},
			okModelWin(type) {
				type();
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
			}
		}
	}
</script>

<style scoped lang="less" rel="stylesheet">
	@import "./category.less";
</style>