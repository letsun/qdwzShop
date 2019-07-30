<template>

    <div>
        <nav-header back="true">
            <div class="title" slot="title">我的优惠券</div>
        </nav-header>
        <ul class="tab-list">
            <li class="item" v-for="(item, index) in navList" @click="toggleStatus(item.status)" :class="{active: item.status === currentStatus}" :key="index">
                <a href="javascript:void(0)">{{item.text}}</a>
            </li>
        </ul>
        <div class="scroll-wrapper" ref="scrollWrapper">
            <div class="wrapper">
                <template v-if="couponList.length">
                    <ul class="coupon-list">
                        <li class="item" :class="{'no-use': item.status === navList[0].status, 'used': item.status === navList[1].status}" v-for="(item, index) in couponList" :key="index">
                            <div class="coupon-left" :class="{fullReduce: item.couponType === couponTypeStatus.fullReduce, coupon: item.couponType === couponTypeStatus.coupon, cashCoupon: item.couponType === couponTypeStatus.cashCoupon}">
                                <div class="title">{{couponTypeText[item.couponType]}}</div>
                                <div class="money">
                                    <template v-if="item.couponType === couponTypeStatus.cashCoupon">
                                        <span>￥</span>{{item.price}}
                                    </template>
                                    <template v-else-if="item.couponType === couponTypeStatus.coupon">
                                        {{item.discount}}<span>折</span>
                                    </template>
                                    <template v-else-if="item.couponType === couponTypeStatus.exchange">
                                        <span>￥</span>{{item.price}}
                                    </template>
                                    <template v-else-if="item.couponType === couponTypeStatus.fullReduce">
                                        <span>￥</span>{{item.reducePrice}}
                                    </template>
                                </div>
                                <div class="status">
                                    <template v-if="item.status === navList[0].status">未使用</template>
                                    <template v-else-if="item.status === navList[1].status">已使用</template>
                                    <template v-else-if="item.status === navList[2].status">已过期</template>
                                </div>
                            </div>
                            <div class="coupon-right">
                                <div class="title">{{item.name}}</div>
                                <div class="time-period">有效期至：{{item.endTime | format('yyyy-MM-dd')}}</div>
                                <div class="code">券号：{{item.couponCode}}</div>
                                <div class="status" v-if="currentStatus === navList[1].status || currentStatus === navList[2].status" :class="{'used-status': item.status === navList[1].status,'expired-status': item.status === navList[2].status}"></div>
                            </div>
                        </li>
                    </ul>
                    <!-- 下拉加载更多 -->
                    <loading-tip :loadingTip="loadingTip" :isShow="couponList.length >= pageNum" :hasNext="hasNext"></loading-tip>
                </template>
                <template v-else>
                    <div class="no-order-wrapper">
                        <no-record iconType="noRecord" text="暂无优惠券"></no-record>
                    </div>
                </template>

            </div>
        </div>
        
        <!-- 页面加载状态 -->
        <transition name="fade">
            <loading-page v-if="!isLoadCompleted" page="coupon"></loading-page>
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
    import NavHeader from '@/components/navHeader/navHeader';
    import LoadingPage from '@/components/loadingPage/loadingPage';
    import noRecord from '@/components/noRecord/noRecord';
    import LoadingTip from '@/components/loadingTip/loadingTip';
    import ModelWin from '@/components/modelWin/modelWin';

    import api from '@/util/api'
    import util from '@/util/util';
    import statusCode from '@/util/statusCode';

    // 优惠券
    const ALL = -1;         // 全部
    const CASHCOUPON = 0;   // 代金券
    const COUPON = 1;       // 折扣券
    const EXCHANGE = 2;     // 兑换券
    const FULLREDUCE = 3;   // 满减券

    // 使用状态
    const NO_USE_STATUS = 0;    // 未使用
    const USE_STATUS = 1;       // 已使用
    const EXPIRED_STATUS = 2;   // 已过期

    export default {
        components: {
            NavHeader,
            LoadingPage,
            noRecord,
            ModelWin,
            LoadingTip
        },
        data() {
            return {
                errorTip: '',
                showModel: false,
                isConfirm: false,
                okType: '',
                navList: [{
                    status: NO_USE_STATUS, 
                    text: '未使用'
                }, {
                    status: USE_STATUS, 
                    text: '已使用'
                }, {
                    status: EXPIRED_STATUS, 
                    text: '已过期'
                }],
                currentStatus: NO_USE_STATUS,
                pageNum: 5,
                pageSize: 1,
                hasNext: false,
                loadingTip: '下拉加载更多',
                scroll: null,
                couponType: CASHCOUPON, 
                couponList: [],
                couponTypeStatus: {
                    all: ALL,
                    cashCoupon: CASHCOUPON,
                    coupon: COUPON,
                    exchange: EXCHANGE,
                    fullReduce: FULLREDUCE
                },
                couponTypeText: {
                    [ALL]: '全部',
                    [CASHCOUPON]: '代金券',
                    [COUPON]: '折扣券',
                    [EXCHANGE]: '兑换券',
                    [FULLREDUCE]: '满减券'
                },
                isLoadCompleted: false
            }
        },
        mounted() {
            this.$nextTick(() => {

                this.initScroll();
                this.initCoupon('click');
                util.commonFunc(this);

            });
        },
        computed: {
            getHeaders() {
                return this.$store.getters.getHeaders;
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
                        
                        this.initCoupon();
                    } else {
                        this.loadingTip = '已经没有更多了';
                    }
                });
            },
            toggleStatus (status) {
                this.currentStatus = status;
                this.pageSize = 1;
                this.isLoadCompleted = false;
                this.loadingTip = '下拉加载更多';
                this.initCoupon('click');
            },
            initCoupon(type) {

                this.$http.get(api.coupon.findCoupon,{
                    headers: this.getHeaders,
                    params: {
                        couponType: 3,
                        pageNum: this.pageNum,
                        pageSize: this.pageSize,
                        status: this.currentStatus
                    }
                }).then((response) => {
                    let res = response.data;

                    if (res.code === statusCode.SUCCESS) {

                        if (type === 'click') {
                            this.isLoadCompleted = true;
                            this.couponList = res.data.couponList;
                        } else {
                            this.couponList = [...this.couponList, ...res.data.couponList];
                        }
                        
                        this.hasNext = res.data.hasNext; 
                        this.loadingTip = '下拉加载更多';
                    } else {

                        util.checkStatus(this, res, {}, this.initCoupon, type);
                        
                    }
                })
            },
            finish() {
                this.scroll.finishPullUp();
                this.scroll.refresh();
            },
            closeModelWin() {
                this.showModel = false;
            },
            okModelWin(type) {
                type();
            }
        }
    }
</script>

<style lang="less" scoped rel="stylesheet">
    @import "coupon.less";

</style>