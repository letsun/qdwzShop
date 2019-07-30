// 当前环境名称
console.log(process.env.NODE_ENV);

let ip = '';

if (process.env.NODE_ENV === 'development') {
	ip = 'http://192.168.1.20:8085';
} else if (process.env.NODE_ENV === 'dev') {
	ip = 'http://192.168.1.20:8085';
} else if (process.env.NODE_ENV === 'test') {
	ip = 'https://test-api.lxcyhd.com';
} else if (process.env.NODE_ENV === 'production') {
	ip = 'https://api.lxcyhd.com';
}

export default ip;
