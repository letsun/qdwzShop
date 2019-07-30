<template>

    <div>
        <nav-header>
            <div class="title" slot="title">支付成功</div>
        </nav-header>
        <div class="scroll-wrapper" ref="scrollWrapper">
            <div class="wrapper">
                <div class="succ-title">
                    <i class="icon iconfont icon-caozuochenggong"></i>
                    <span class="succ-text">订单支付成功</span>
                </div>

                <div class="submit-wra">
                    <a class="submit-btn" href="javascript:void(0);" @click="router('order')">
                        查看订单
                    </a>
                </div>

                <div class="submit-wra second-wra">
                    <a class="submit-btn" href="javascript:void(0);" @click="router('index')">
                        继续购物
                    </a>
                </div>

            </div>
        </div>
        
    </div>
</template>

<script>
    // 插件
    import BetterScroll from 'better-scroll';

    // 组件
    import NavHeader from '@/components/navHeader/navHeader';


    import api from '@/util/api'
    import util from '@/util/util';

    export default {
        components: {
            NavHeader,
        },
        data() {
            return {

            }
        },
        mounted() {
            this.$nextTick(() => {

                this.initScroll();
                util.commonFunc(this);

            });
        },
        methods: {
            initScroll() {
                var scroll = new BetterScroll(this.$refs.scrollWrapper, {
                    scrollbar: {
                        fade: true
                    },
                    click: true
                });
            },
            router(type) {
                // debugger;
                if (type == 'order') {
                    this.$store.commit('updateDirection', 'left');
                    
                    let path = '';
                    if (this.$route.query.status == 2) {
                        path = '/waitSendGoodsDetail';
                    } else if (this.$route.query.status == 3) {
                        path = '/waitReceiptGoodsDetail';
                    } else if (this.$route.query.status == 4) {
                        path = '/successOrderDetail'
                    }

                    this.$router.push({path: path, query: {orderId: this.$route.query.orderId}});
                    
                } else if (type == 'index') {
                    this.$router.push('/index');
                    this.$store.commit('updateDirection', 'right');
                }
            }

        }
    }
</script>

<style lang="less" scoped rel="stylesheet">
    @import "paymentSuccess.less";
</style>