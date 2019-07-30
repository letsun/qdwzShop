<template>

    <div>
        <nav-header>
            <div class="title" slot="title">兑换成功</div>
        </nav-header>
        <div class="scroll-wrapper" ref="scrollWrapper">
            <div class="wrapper">
                <div class="succ-title">
                    <i class="icon iconfont icon-caozuochenggong"></i>
                    <span class="succ-text">恭喜兑换成功</span>
                </div>

                <div class="succ-dec">
                    我们将在三个工作日内为你寄出商品请注意查收
                </div>

                <div class="submit-wra">
                    <submit-btn @clickEvent="backHome">返回首页</submit-btn>
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
    import SubmitBtn from '@/components/submitBtn/submitBtn';

    import api from '@/util/api'
    import util from '@/util/util';

    export default {
        components: {
            NavHeader,
            SubmitBtn,
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
                    click: true
                });
            },
            backHome() {
                this.$store.commit('updateDirection', 'right');
                this.$router.push({path: '/index'});
            }
        }
    }
</script>

<style lang="less" scoped rel="stylesheet">
    @import "exchangeSuccess.less";

</style>