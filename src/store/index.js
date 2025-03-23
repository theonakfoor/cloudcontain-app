import { createStore } from 'vuex'

import containerModule from './modules/container'
import userModule from './modules/user'
import folderModule from './modules/folder'
import fileModule from './modules/file'
import file from './modules/file'

export default createStore({
    modules: {
        container: containerModule,
        folder: folderModule,
        file: fileModule,
        user: userModule
    },
    state: {
        user: null
    },
    mutations: {
        SET_USER(state,user) {
            state.user = user;
        }
    },
    actions: {

    },
    getters: {
        
    }
});
