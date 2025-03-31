import Api from "@/services/api";

export default {
    namespaced: true,
    state: {
    },
    mutations: {
    },
    actions: {
        async executeJob({commit}, data) {
            try {
                let response = await Api().post(`containers/${data.containerId}/execute`, null, {
                    headers: {
                        'Authorization': `Bearer ${data.accessToken}`
                    }
                });
                return response;
            } catch(error) {
                return error.response;
            }
        },
        async listJobs({commit}, data) {
            let response = await Api().get(`containers/${data.containerId}/jobs`, {
                headers: {
                    'Authorization': `Bearer ${data.accessToken}`
                }
            });
            return response.data;
        }
    },
    getters: {

    }
}