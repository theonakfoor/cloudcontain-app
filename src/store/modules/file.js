import Api from "@/services/api";

export default {
    namespaced: true,
    state: {
    },
    mutations: {
    },
    actions: {
        async createFile({commit}, data) {
            try {
                let response = await Api().post(encodeURIComponent(`containers/${data.containerId}/folders/${data.folderId}/files`), {
                    name: data.name
                }, {
                    headers: {
                        'Authorization': `Bearer ${data.accessToken}`
                    }
                });
                return response.data.fileId;
            } catch(error) {
                return error.response.status;
            }
        },
        async getFile({commit}, data) {
            try {
                let response = await Api().get(encodeURIComponent(`containers/${data.containerId}/files/${data.fileId}`), {
                    headers: {
                        'Authorization': `Bearer ${data.accessToken}`
                    }
                });
                return response.data;
            } catch(error) {
                return error.response.status;
            }
        },
        async readContent({commit}, data) {
            try {
                let response = await Api().get(encodeURIComponent(`containers/${data.containerId}/files/${data.fileId}/content`), {
                    headers: {
                        'Authorization': `Bearer ${data.accessToken}`
                    }
                });
                return response.data;
            } catch(error) {
                return error.response.status;
            }
        },
        async updateContent({commit}, data) {
            try {
                let response = await Api().put(encodeURIComponent(`containers/${data.containerId}/files/${data.fileId}/content`), data.content, {
                    headers: {
                        'Authorization': `Bearer ${data.accessToken}`,
                        'Content-Type': 'text/plain'
                    }
                });
                return response.data;
            } catch(error) {
                return error.response.status;
            }
        }
    },
    getters: {

    }
}