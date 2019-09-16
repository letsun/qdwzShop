<template>
	<div>
		<nav-header back="true">
			<div class="title" slot="title">商品详情</div>
		</nav-header>
		<div class="scroll-wrapper" ref="scrollWrapper">
			<div class="wrapper">

				<swiper-component :imgList="goodsDetail.goodsImgs" swiperType="proDefault" @finishEvent="finish" @previewEvent="preview"></swiper-component>

				<div class="pro-title">{{goodsDetail.goodsName}}</div>
				<div class="price-wrapper">
					<div class="price">
						<template v-if="goodsDetail.goodsType === 0">
							<span class="span1 active">{{goodsDetail.goodsSalePrice | currency('￥')}}</span>
							<span class="span1">{{goodsDetail.goodsVipPrice | currency('￥')}}</span>
						</template>
						<template v-else>
							{{goodsDetail.goodsScore}} <span>积分</span>
						</template>
					</div>
					<div class="price-desc">{{goodsDetail.title}}</div>
					<div class="freight-range">
						单件运费：{{freightRange.minFee | currency('￥')}}-{{freightRange.maxFee | currency('￥')}}
					</div>
				</div>
				<div class="buy-number">
					<template v-if="goodsDetail.status === 0">
						<div class="title">购买数量：</div>
						<div class="buy-controls">
							<cart-controls cartType="detail" :amount="amount" :isAddCart="isAddCart" @editEvent="edit"></cart-controls>
						</div>
						<div class="stock">库存量：<span>{{goodsDetail.goodsStock}}</span></div>
					</template>

					<template v-else>
						<div class="drop-off">该商品已经下架</div>
					</template>

				</div>
				<div class="spec-wra">
					<div class="detail-content">
						<ul class="specification-list" v-if="goodsDetail.chooseJsonProp != null">
							<li class="item" v-for="(specList, key,i) in goodsDetail.chooseJsonProp">
								<div class="key">{{key}}：</div>
								<div class="value">
									<div class="spec-list">
										<div class="spec-item" v-for="(item) in specList" :class="{active: specObj[key] == item}" @click="specAction(key,item)">{{item}}</div>
									</div>
								</div>
							</li>
						</ul>
					</div>
				</div>
				<div class="detail-list">
					<div class="detail-header">
						规格参数
					</div>
					<div class="detail-content">
						<ul class="specification-list" v-if="jsonPropLength">
							<li class="item" v-for="(value, index) in goodsDetail.jsonProp" :key="index">
								<template v-for="(item, key, i) in value">
									<span class="key">{{key}}：</span>
									<span class="value">{{item}}</span>
								</template>
							</li>
						</ul>
						<div class="no-specification" v-else>暂无规格参数</div>
					</div>
				</div>
				<div class="detail-list">
					<div class="detail-header">
						产品详情
						<i class="icon iconfont icon-arrow-right-copy" :class="{showDetail: isShowDetail}" @click="showDetail"></i>
					</div>
					<div class="detail-content" v-show="isShowDetail">
						<span ref="detailContent" v-html="goodsDetail.goodsDesc"></span>
					</div>
				</div>
			</div>
		</div>

		<template v-if="goodsDetail.goodsType === 0">
			<div class="buy-controls" v-if="goodsDetail.isopenContainer === 0">
				<btn-group @leftClickBtnEvent="addCart" @rightClickBtnEvent="nowBuy">
					<template slot="btn_1">
						<i class="icon iconfont icon-gouwucheman"></i><span class="text">加入购物车</span>
					</template>
					<template slot="btn_2">
						<i class="icon iconfont icon-goumai"></i><span class="text">立即购买</span>
					</template>
				</btn-group>
			</div>
			<div class="score-controls" v-else-if="goodsDetail.isopenContainer === 1" @click="nowBuy">
				<i class="icon iconfont icon-goumai"></i><span class="text">立即购买</span>
			</div>
		</template>

		<div class="score-controls" v-else @click="nowBuy">
			<i class="icon iconfont icon-goumai"></i><span class="text">立即兑换</span>
		</div>

		<model-win :show="showModel">
			<template slot="content">
				<i v-if="errorTip === '加入购物车成功'" class="cartSuccess-icon iconfont icon-caozuochenggong"></i>
				<div class="text">{{errorTip}}</div>
			</template>
			<template slot="btn">
				<template  v-if="isConfirm">
					<a href="javascript:void(0);" class="btn" @click="closeModelWin">{{cancelBtnText}}</a>
					<a href="javascript:void(0);" class="btn btn-last" @click="okModelWin(okType)">{{okBtnText}}</a>
				</template>
				<template  v-else>
					<a href="javascript:void(0);" class="btn" @click="closeModelWin">确定</a>
				</template>
			</template>
		</model-win>

		<!-- 页面加载状态 -->
		<transition name="fade">
			<loading-page v-if="!isLoadCompleted" page="productDetail"></loading-page>
		</transition>

		<!--图片预览-->
		<div class="preview-win" v-if="isPreview" @click="closePreview">
			<img :src="previewUrl" alt="">
		</div>

	</div>
</template>

<script>
    // 插件
    import BetterScroll from 'better-scroll';
    import wx from 'weixin-js-sdk';
    import api from '@/util/api';
    import util from '@/util/util';
    import statusCode from '@/util/statusCode';
    // 组件
    import NavHeader from '@/components/navHeader/navHeader';
    import CartControls from '@/components/cartControls/cartControls';
    import SwiperComponent from '@/components/swiper/swiper';
    // import SliderComponent from '@/components/slider/slider';
    import BtnGroup from '@/components/btnGroup/btnGroup';
    import ModelWin from '@/components/modelWin/modelWin';
    import LoadingPage from '@/components/loadingPage/loadingPage';
    export default {
        components: {
            NavHeader,
            CartControls,
            BtnGroup,
            SwiperComponent,
            LoadingPage,
            ModelWin
        },
        data() {
            return {
                path:'',
                query: {},
                scroll: null,
                productDetail: {},
                freightRange: {},
                amount: 1,
                goodsDetail: {},
                jsonPropLength: 0,
                isShowDetail: true,
                errorTip: '',
                showModel: false,
                isConfirm: false,
                okType: '',
                cancelBtnText: '继续购物',
                okBtnText: '购物车',
                isLoadCompleted: false,
                isAddCart: 1,
                result: 1,
                previewUrl:'',
                isPreview:false,
                specObj: {}
            }
        },
        mounted() {
            this.$nextTick(async () => {
                var goodsInfor = {};
                // 收集参数
                this.path = window.location.href.split('?')[0];
                if (this.$route.query.goodsId) {
                    this.query.goodsId = this.$route.query.goodsId;
                    goodsInfor.goodsId = this.query.goodsId;
                    window.sessionStorage.setItem('goodsInfor', JSON.stringify(goodsInfor));
                } else {
                    console.log(3333);
                    console.log(JSON.parse(window.sessionStorage.getItem('headerInfor')));
                    if (JSON.parse(window.sessionStorage.getItem('goodsInfor')).goodsId) {
                        this.query.goodsId = JSON.parse(window.sessionStorage.getItem('goodsInfor')).goodsId;
                    } else {
                        this.query.goodsId = JSON.parse(window.sessionStorage.getItem('headerInfor')).goodsId;
                    }
                }
                if (this.$route.query.isCart) {
                    this.query.isCart = this.$route.query.isCart;
                }
                if (this.$route.query.orderId) {
                    this.query.orderId = this.$route.query.orderId;
                }
                if (this.$route.query.redirectUrl) {
                    this.query.redirectUrl = this.$route.query.redirectUrl;
                }
                if (this.query.goodsId) {
                    this.findShareParams();
                    this.initGoodsDetail();
                    this.initFreightRange();
                    this.finish();
                    // this.checkOrder();
                    util.commonFunc(this);
                }
            });
        },
        updated() {
            this.finish();
        },
        computed: {
            getHeaders() {
                return this.$store.getters.getHeaders;
            },
            containerId() {
                return this.$store.state.containerId;
            }
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
            initGoodsDetail() {
                return new Promise((resolve, reject) =>　{
                    this.$http.get(api.product.goodsDetail, {
                        params: {
                            goodsId: this.query.goodsId
                        }
                    }).then((response) => {
                        let res = response.data;
                        if (res.code === statusCode.SUCCESS) {
                            this.goodsDetail = res.data;
                            let jsonProp = JSON.parse(this.goodsDetail.jsonProp);
                            delete this.goodsDetail.jsonProp;
                            this.goodsDetail.jsonProp = jsonProp;
                            this.jsonPropLength = this.goodsDetail.jsonProp.length;
                            let chooseJsonProp = this.goodsDetail.chooseJsonProp;
                            delete this.goodsDetail.chooseJsonProp;
                            this.goodsDetail.chooseJsonProp = chooseJsonProp;
                            this.goodsDetail = Object.assign({}, this.goodsDetail || {});

                            if (this.goodsDetail.chooseJsonProp != null) {
                                for (var i in this.goodsDetail.chooseJsonProp) {
                                    this.specObj[i] = (this.goodsDetail.chooseJsonProp[i])[0];
                                }

                                this.query.chooseJsonProp = JSON.stringify(this.specObj);
                            }
                        } else {
                            util.checkStatus(this, res, {page: 'productDetail'}, this.initGoodsDetail);

                        }
                        this.$nextTick(() => {
                            this.finish();
                            this.loadImage();
                        });
                        resolve();
                    });
                });
            },
            initFreightRange() {
                return new Promise((resolve, reject) =>　{
                    this.$http.get(api.product.getFreightRange, {
                        headers: this.getHeaders,
                        params: {
                            goodsId: this.query.goodsId
                        }
                    }).then((response) => {
                        let res = response.data;
                        if (res.code === statusCode.SUCCESS) {
                            this.freightRange = res.data;
                        } else {
                            util.checkStatus(this, res, {page: 'productDetail'}, this.initGoodsDetail);

                        }
                        resolve();
                    });
                });
            },
            edit(type) {
                if (this.isAddCart) {
                    if (type === 'add') {
                        this.amount++;
                        if (this.amount > this.goodsDetail.goodsStock) {
                            this.amount = this.goodsDetail.goodsStock;
                            this.errorTip = '数量已超过该最大的库存';
                            this.showModel = true;
                            this.isConfirm = false;
                        }
                    } else if (type === 'reduce') {
                        if (this.amount > 1) {
                            this.amount--;
                        }
                    }
                } else {
                    this.showModel = true;
                    this.isConfirm = false;
                    this.errorTip = '该商品是会员价商品，最多只能购买一件';
                }
            },
            showDetail() {
                this.isShowDetail = !this.isShowDetail;
            },
            addCart() {
                if (this.goodsDetail.status === 1) {
                    this.showModel = true;
                    this.isConfirm = false;
                    this.errorTip = '该商品已经下架';
                    return;
                }
                this.$http.get(api.cart.addCart, {
                    headers: this.getHeaders,
                    params: {
                        goodsId: this.query.goodsId,
                        amount: this.amount,
                        isSelected: 1,
                        chooseJsonProp: this.query.chooseJsonProp
                    }
                }).then((response) => {
                    let res = response.data;
                    if (res.code === statusCode.SUCCESS) {

                        this.errorTip = '加入购物车成功';
                        this.isConfirm = true;
                        this.showModel = true;
                        this.okType = this.goCart;
                    } else {
                        util.checkStatus(this, res, {}, this.addCart);
                    }
                })
            },
            nowBuy() {
                if (this.goodsDetail.status === 1) {
                    this.showModel = true;
                    this.isConfirm = false;
                    this.errorTip = '该商品已经下架';
                    return;
                }
                if ((this.containerId == 0 || this.containerId == null ) && this.goodsDetail.isopenContainer) {
                    this.showModel = true;
                    this.isConfirm = false;
                    this.errorTip = '请扫货柜码进行购买';
                    return;
                }
                this.query.amount = this.amount;
                this.$store.commit('updateDirection', 'left');
                this.$router.push({
                    path: '/createOrder',
                    query: this.query
                });
            },
            goCart() {
                this.$emit('updateDirection', 'left');
                this.$router.push({
                    path: '/cart'
                });
            },
            finish() {
                if (this.scroll) {

                    this.scroll.refresh();
                    this.scroll.finishPullUp();
                } else {

                    this.initScroll();
                }
            },
            closeModelWin() {
                this.showModel = false;
                this.isConfirm = false;
            },
            okModelWin(type) {
                type();
            },
            async loadImage() {
                let goodsImgs = this.goodsDetail.goodsImgs;
                let imageList = [];
                let detailImg = this.$refs.detailContent.getElementsByTagName('img');
                imageList = [...goodsImgs];
                for (let i = 0, len = detailImg.length; i < len; i++) {
                    imageList.push({picUrl: detailImg[i].src});
                }
                for (let i = 0, len = imageList.length; i < len; i++) {
                    await util.loadImage(imageList[i].picUrl).then(() => {
                        if (i === len - 1) {
                            this.finish();
                            this.isLoadCompleted = true;
                        }
                    });
                }
            },
            checkOrder () {
                this.$http.get(api.product.checkOrder).then((response) => {
                    let res = response.data;
                    if (res.code === statusCode.SUCCESS) {
                        let result = res.data.result;
                        if (result == 1) {
                            this.isAddCart = 0;
                            this.result = 1;
                        } else {
                            this.isAddCart = 1;
                            this.result = 0;
                        }
                    }
                });
            },
            // 自定义分享
            findShareParams () {
                this.$http.get(api.product.findShareParams,{
                    params: {
                        goodsId: this.query.goodsId,
                        thisUrl: this.path,
                    }
                }).then((response) => {
                    let res = response.data;
                    if (res.code === statusCode.SUCCESS) {
                        var goodsId = JSON.parse(window.sessionStorage.getItem('headerInfor')).goodsId;
                        if (goodsId) {
                            // 微信分享
                            wx.config({
                                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                                appId: res.data.autAppid, // 必填，公众号的唯一标识
                                timestamp: res.data.timestamp, // 必填，生成签名的时间戳
                                nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
                                signature: res.data.signature,// 必填，签名
                                jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'updateTimelineShareData', 'updateAppMessageShareData', 'hideMenuItems', 'showMenuItems'] // 必填，需要使用的JS接口列表
                            });
                            setTimeout(function () {
                                wx.hideMenuItems({
                                    menuList: ["menuItem:share:timeline", "menuItem:copyUrl", "menuItem:share:appMessage", "menuItem:share:qq", "menuItem:share:weiboApp", "menuItem:favorite", "menuItem:share:facebook", "menuItem:share:QZone", "menuItem:editTag", "menuItem:delete", "menuItem:copyUrl", "menuItem:originPage", "menuItem:readMode", "menuItem:openWithQQBrowser", "menuItem:openWithSafari", "menuItem:share:email", "menuItem:share:brand"] // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮
                                });
                            },3000);
                        } else {
                            wx.hideMenuItems({
                                menuList: ["menuItem:share:timeline", "menuItem:copyUrl", "menuItem:share:appMessage", "menuItem:share:qq", "menuItem:share:weiboApp", "menuItem:favorite", "menuItem:share:facebook", "menuItem:share:QZone", "menuItem:editTag", "menuItem:delete", "menuItem:copyUrl", "menuItem:originPage", "menuItem:readMode", "menuItem:openWithQQBrowser", "menuItem:openWithSafari", "menuItem:share:email", "menuItem:share:brand"] // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮
                            });
                            // 显示分享按钮
                            wx.showMenuItems({
                                menuList: ["menuItem:share:appMessage", "menuItem:share:timeline"]
                            });
                            wx.ready(() => {
                                // 分享到朋友圈
                                wx.onMenuShareTimeline({
                                    title: res.data.shareTitle, // 分享标题
                                    link: res.data.shareUrl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                                    imgUrl: res.data.shareImgurl, // 分享图标
                                    success: () => {
                                    }
                                });
                                // 分享给朋友
                                wx.onMenuShareAppMessage({
                                    title: res.data.shareTitle, // 分享标题
                                    desc: res.data.shareDesc, // 分享描述
                                    link: res.data.shareUrl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                                    imgUrl: res.data.shareImgurl, // 分享图标
                                    type: '', // 分享类型,music、video或link，不填默认为link
                                    dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                                    success: () => {
                                    }
                                });
                            });
                        }
                    }
                });
            },
            preview (imgUrl) {
                if (imgUrl != '') {
                    this.previewUrl = imgUrl;
                    this.isPreview = true;
                }
            },
            closePreview () {
                this.isPreview = false;
            },

            specAction (key,item) {
                for (var i in this.specObj) {
                    if (key == i) {
                        (this.specObj)[i] = item;
                        this.$forceUpdate();
                        this.$set(this.specObj,i,item);
                        this.query.chooseJsonProp = JSON.stringify(this.specObj);
                        break;
                    }
                }
            }
        }
    }
</script>

<style lang="less" rel="stylesheet" scoped>
	@import "productDetail.less";
</style>

<style lang="less" rel="stylesheet">
	.detail-content {
	img {
		max-width: 100%;
		display: block;
	}
	}
</style>