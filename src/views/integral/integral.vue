<template>

    <div>
        <nav-header back="true">
            <div class="title" slot="title">我的积分</div>
        </nav-header>

        <div class="scroll-wrapper" ref="scrollWrapper">
            <div class="wrapper">
                <template v-if="scoreList.length > 0">
                    <ul class="coupon-list">
                        <li class="item" v-for="(item, index) in scoreList" :key="index">
                            <a href="javascript:void(0);">
                                <div class="title">{{item.score}}</div>
                                <div class="btn">{{item.score > 0 ? '已领取' : '已使用'}}</div>
                                <div class="time">{{item.createDate}}</div>
                            </a>
                        </li>
                    </ul>
                    <!-- 下拉加载更多 -->
                    <loading-tip :loadingTip="loadingTip" :isShow="scoreList.length >= pageNum" :hasNext="hasNext"></loading-tip>
                </template>
                <template v-else>
                    <div class="no-order-wrapper">
                        <no-record iconType="noRecord" text="暂无记录"></no-record>
                    </div>
                </template>

            </div>
        </div>
        
        <!-- 页面加载状态 -->
        <transition name="fade">
            <loading-page v-if="!isLoadCompleted" page="score"></loading-page>
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
                pageNum: 15,
                pageSize: 1,
                hasNext: false,
                loadingTip: '下拉加载更多',
                scroll: null,
                scoreList: [],
                isLoadCompleted: false,
            }
        },
        mounted() {
            this.$nextTick(() => {

                this.initScroll();
                this.initScore();
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
                        
                        this.initScore();
                    } else {
                        this.loadingTip = '已经没有更多了';
                    }
                });
            },
            initScore() {

                this.$http.get(api.integral.findScoreList,{
                    headers: this.getHeaders,
                    params: {
                        pageNum: this.pageNum,
                        pageSize: this.pageSize,
                    }
                }).then((response) => {
                    let res = response.data;

                    if (res.code === statusCode.SUCCESS) {
                        this.isLoadCompleted = true;
                        this.scoreList = [...this.scoreList, ...res.data.scoreList];
                        this.hasNext = res.data.hasNext; 
                        this.loadingTip = '下拉加载更多';
                    } else {
                        util.checkStatus(this, res, {}, this.initScore);
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
            okModelWin() {
                this.showModel = false;
            }
        }
    }
</script>

<style lang="less" scoped rel="stylesheet">
    @import "integral.less";

</style>