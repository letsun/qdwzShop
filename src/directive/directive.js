import util from '@/util/util';

let directive = {}

// 图片自适应容器指令
directive.adaptiveSrc = {
	inserted(el, binding) {
		let parent = el.parentNode;

		let containerW = parent.offsetWidth;
		let containerH = parent.offsetHeight;

		let src = binding.value;
		let arg = binding.arg;

		let image = new Image();
		let element = null;
		let timer = null;

		// debugger;

		if (typeof arg !== 'undefined') {

			try {
				element = util.getParentElementByTagName(el, arg);
			} catch (e) {
				console.log(`not found ${arg}`);
			}
			
		}

		parent.style.position = 'relative';

		el.src = '/static/images/loading.gif';
		el.style.position = 'absolute';

		image.onload = () => {
			let imageW = image.width;
			let imageH = image.height;

			// 实际尺寸
			let width = 0;
			let height = 0;

			// debugger;
			if (imageW < containerW && imageH < containerH) {
				width = imageW;
				height = imageH;
			} else {

				if (containerW / containerH <= imageW / imageH) {
					width = containerW; //以框的宽度为标准
					height = containerW * (imageH / imageW);
				} else {
					width = containerH * (imageW / imageH);
					height = containerH; //以框的高度为标准
				}
			}

			el.src = src;

			el.style.width = width + 'px';
			el.style.height = height + 'px';
			el.style.left = (containerW - width) * 0.5 + 'px';
			el.style.top = (containerH - height) * 0.5 + 'px';
			
			if (element) {
				clearTimeout(timer);
				timer = setTimeout(() => {
					element.style.opacity = 1;
				}, 2);
			}

		}

		image.src = src;
	}
}


export default directive;