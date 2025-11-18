import Api from "@/services/api";

export default {
    namespaced: true,
    state: {
    },
    mutations: {
    },
    actions: {
        async getContainer({commit}, data) {    
            try {
                let response = await Api().get(`containers/${data.containerId}`, {
                    headers: {
                        'Authorization': `Bearer ${data.accessToken}`
                    }
                });
                return response.data;
            } catch (error) {
                return error.response.status;
            }
        },
        async createContainer({commit}, data) {
            let response = await Api().post(`containers`, {
                name: data.name
            }, {
                headers: {
                    'Authorization': `Bearer ${data.accessToken}`
                }
            });
            return response.data.containerId;
        },
        async updateContainer({commit}, data) {
            let response = await Api().put(`containers/${data.containerId}`, data.updates, {
                headers: {
                    'Authorization': `Bearer ${data.accessToken}`
                }
            });
            return response.status;
        },
        async deleteContainer({commit}, data) {
            let response = await Api().delete(`containers/${data.containerId}`, {
                headers: {
                    'Authorization': `Bearer ${data.accessToken}`
                }
            });
            return response.status;
        },
        async listContainers({commit}, data) {
            let response = await Api().get(`containers?offset=${data.offset}`, {
                headers: {
                    'Authorization': `Bearer ${data.accessToken}`
                }
            });
            return response.data;
        },
         async listRecentContainers({commit}, data) {
            let response = await Api().get(`containers/recent`, {
                headers: {
                    'Authorization': `Bearer ${data.accessToken}`
                }
            });
            return response.data;
        },
        async searchContainers({commit}, data) {  
            try {
                let response = await Api().post(`containers/search?offset=${data.offset}`, {
                    query: data.query
                }, {
                    headers: {
                        'Authorization': `Bearer ${data.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                return response;
            } catch(error) {
                return error.response;
            }
        },
    },
    getters: {

    }
}