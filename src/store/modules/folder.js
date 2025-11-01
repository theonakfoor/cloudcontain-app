import Api from "@/services/api";

export default {
    namespaced: true,
    state: {
    },
    mutations: {
    },
    actions: {
        async getFolder({commit}, data) {    
            try {
                let response = await Api().get(encodeURIComponent(`containers/${data.containerId}/folders/${data.folderId}`), {
                    headers: {
                        'Authorization': `Bearer ${data.accessToken}`
                    }
                });
                return response.data;
            } catch(error) {
                return error.response.status;
            }
        },
        async createFolder({commit}, data) {
            try {
                let response = await Api().post(encodeURIComponent(`containers/${data.containerId}/folders/${data.folderId}`), {
                    name: data.name
                }, {
                    headers: {
                        'Authorization': `Bearer ${data.accessToken}`
                    }
                });
                return response;
            } catch(error) {
                return error.response;
            }
        },
        async updateFolder({commit}, data) {
            try {
                let response = await Api().put(encodeURIComponent(`containers/${data.containerId}/folders/${data.folderId}`), data.updates, {
                    headers: {
                        'Authorization': `Bearer ${data.accessToken}`
                    }
                });
                return response;
            } catch(error) {
                return error.response;
            }
        },
        async deleteFolder({commit}, data) {  
            try {
                let response = await Api().delete(encodeURIComponent(`containers/${data.containerId}/folders/${data.folderId}`), {
                    headers: {
                        'Authorization': `Bearer ${data.accessToken}`
                    }
                });
                return response;
            } catch(error) {
                return error.response.status;
            }
        },
    },
    getters: {

    }
}