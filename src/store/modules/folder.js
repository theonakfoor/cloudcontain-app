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
                return response.data.folderId;
            } catch(error) {
                return error.response.status;
            }
        },
        async deleteFolder({commit}, data) {  
            try {
                let response = await Api().delete(encodeURIComponent(`containers/${data.containerId}/folders/${data.folderId}`), {
                    headers: {
                        'Authorization': `Bearer ${data.accessToken}`
                    }
                });
                return response.status;
            } catch(error) {
                return error.response.status;
            }
        },
    },
    getters: {

    }
}