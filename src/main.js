// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import axios from 'axios'
import App from './App'
import directive from './directive/directive'
import router from './router'
import store from './store/store';
import currency from './util/currency';
import format from './util/format';

import setCompanyInformation from '@/util/setCompanyInformation';

Vue.config.productionTip = false;

Vue.prototype.$http = axios;

Vue.filter('currency', currency);
Vue.filter('format', format);

Vue.directive('adaptiveSrc', directive.adaptiveSrc);

/* eslint-disable no-new */
new Vue({
	el: '#app',
	router,
	store,
	components: {
		App
	},
	template: '<App/>',
	computed: {
		getHeaders() {
            return this.$store.getters.getHeaders;
        },
        mallType() {
			return this.$store.state.mallType;
		},
		companyInformation() {
			return this.$store.state.companyInformation;
		}
	},
	beforeCreate() {
		console.log('main.js:beforeCreate');
	},
	created() {
		console.log('main.js:created');
	},
	async beforeMount() {
		console.log('main.js:beforeMount');
		
		this.$store.dispatch('getInfor');

		await setCompanyInformation(this, this.$store);

		// 根据商城类型，更换网页标题
		document.title = this.companyInformation.shopName ? `${this.companyInformation.shopName}` : '商城';
	},
	mounted() {
		console.log('main.js:mounted');

		this.$nextTick(() => {
			console.log('main.js:mounted nextTick');
		});

		axios.defaults.headers = Object.assign({}, this.getHeaders || {});

		this.$http.interceptors.request.use((xhr) => {
			// console.log('request init...');
			// xhr.withCredentials = true;
			return xhr;
		});

		this.$http.interceptors.response.use((response) => {
			// console.log('response init...');
			return response;
		});
	}
})