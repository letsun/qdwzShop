import api from '@/util/api';

const setCompanyInformation = (that, store, isClearSession = true) => {

	return new Promise((resolve, reject) => {

		that.$http.get(api.company.getCompInfo, {
			headers: store.getters.getHeaders
		}).then((response) => {
			let res = response.data;

			if (res.code === 200) {
				let session = window.sessionStorage;
				let companyInformation = res.data;

				// 重置headerInfor
				if (isClearSession) {
					session.removeItem('companyInformation');
				}
				
				if (session.getItem('companyInformation') !== null) {
					companyInformation = JSON.parse(session.getItem('companyInformation'));	
				} else {	
					session.setItem('companyInformation', JSON.stringify(companyInformation));
				}

				store.commit('updateCompanyInformation', companyInformation);

				resolve();

			} else {
				// alert(res.msg);
				resolve(res.msg);
			}
		});


	});
}

export default setCompanyInformation;