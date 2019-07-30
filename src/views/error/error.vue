<template>
	<div>
		
		<div class="scroll-wrapper">
			<div class="container">
				<i class="icon iconfont icon-weixin"></i>
				<div class="text">{{$route.query.errorMsg}}</div>
			</div>
			
		</div>

	</div>
</template>

<script>

	export default {}
</script>

<style lang="less" scoped rel="stylesheet">
	@import "error.less";
</style>