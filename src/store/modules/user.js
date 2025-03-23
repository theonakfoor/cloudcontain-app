import Api from "@/services/api";

export default {
    namespaced: true,
    state: {
    },
    mutations: {
    },
    actions: {
        async getUserInfo({commit}, data) {
            let response = await Api().get(`user`, {
                headers: {
                    'Authorization': `Bearer ${data.accessToken}`
                }
            });
            return response.data;
        },
    },
    getters: {

    }
}