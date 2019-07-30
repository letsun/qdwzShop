<template>
  <div>
    <div class="menu-wrapper" ref="menuWrapper">
      <ul>
        <li class="menu-item">
          <a class="menu-item-link" :class="{active: currentIndex === 'all'}" href="javascript:void(0);" @click="selectCategory('all', '', 'menu')">全部</a>
        </li>
        <li class="menu-item" v-for="(item, index) in categoryList" :key="index">
          <a class="menu-item-link" :class="{active: currentIndex === index}" href="javascript:void(0);" @click="selectCategory(index, item.categoryId, 'menu')">{{item.categoryName}}</a>
        </li>
      </ul>
    </div>.
  </div>
</template>

<script>
	// 插件
	import BetterScroll from 'better-scroll';

  import api from '@/util/api';
  import util from '@/util/util';
  import statusCode from '@/util/statusCode';

	export default {
    data() {
      return {
        categoryList: [],
        currentIndex: 'all'
      }
    },
    computed: {
      
    },
		mounted() {
      
			this.$nextTick(() => {
         this.initCategory();
				this.initScroll();
			});
		},
		methods: {
			initScroll() {
				var scroll = new BetterScroll(this.$refs.menuWrapper, {
					click: true
				});
			},
      initCategory() {
        this.$http.get(api.product.categoryType).then((response) => {
          let res = response.data;

          if (res.code === statusCode.SUCCESS) {
            this.categoryList = res.data;
          } else {

            util.checkStatus(this, res, {isComponent: true}, this.initCategory);
            
          }

        });
      },
      selectCategory(index, categoryId, menu) {
        this.currentIndex = index;
        this.$emit('sendCategoryIdEvent', categoryId, menu);
      }
		}
	}
</script>

<style scoped lang="less" rel="stylesheet">
	@import "./menuWrapper.less";
</style>