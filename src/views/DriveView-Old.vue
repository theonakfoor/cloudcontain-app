<template>

    <!-- BEGIN Create Container Dialog -->
    <v-dialog
      v-model="createContainerDialog.show"
      max-width="600"
    >
      <div class="drive-dialog">
        <h2 class="mb-2" style="font-weight: 800; font-size: 25px; margin: 0; padding: 0;">Create Container</h2>
        <input v-model="this.createContainerDialog.name" class="global-input" type="text" placeholder="Container Name" />
        <div class="global-dialog-action mt-3">
            <button class="global-dialog-action-cancel me-2" @click="this.createContainerDialog.show = false">Cancel</button>
            <button class="global-dialog-action-confirm" @click="createContainer()"><v-icon icon="mdi-plus-circle-outline" class="my-auto me-2"></v-icon> Create</button>
        </div>
      </div>
    </v-dialog>
    <!-- END Create Container Dialog -->

    <!-- BEGIN Delete Container Dialog -->
    <v-dialog
      v-model="deleteContainerDialog"
      max-width="500"
    >
        <div class="drive-dialog">
            <h2 class="mb-2" style="font-weight: 800; font-size: 25px; margin: 0; padding: 0;">Delete Container</h2>
            <p class="m-0" style="font-size: 18px;">Are you sure you want to delete <strong>{{ this.toDelete.name }}</strong>?</p>
            <div class="global-dialog-action mt-3">
                <button class="global-dialog-action-cancel me-2" @click="this.deleteContainerDialog = false">Cancel</button>
                <button class="global-dialog-action-danger" @click="confirmDelete()"><v-icon icon="mdi-delete-empty-outline" class="my-auto me-2"></v-icon> Delete Container</button>
            </div>
        </div>
    </v-dialog>
    <!-- END Delete Container Dialog -->

    <!-- BEGIN Progress Indicator -->
    <v-progress-linear model-value="0" color="#379af5" height="3" :indeterminate="this.loading"></v-progress-linear>
    <!-- END Progress Indicator -->

    <!-- BEGIN Nav Bar -->
    <div class="env-bar">
        <!-- BEGIN Logo -->
        <img src="../assets/images/cloudcontain.svg" width="150" class="my-auto" />
        <!-- END Logo -->

        <!-- BEGIN Drive Searchbar -->
        <div class="drive-search">
            <input class="drive-searchbar" placeholder="Search your containers" />
            <v-tooltip text="Search" location="bottom">
                <template v-slot:activator="{ props }">
                    <div class="drive-search-small ms-2 my-auto" v-bind="props"><v-icon class="mx-auto my-auto" icon="mdi-magnify" style="font-size: 24px; margin: 0; padding: 0;"></v-icon></div>
                </template>
            </v-tooltip>
        </div>
        <!-- END Drive Searchbar -->

        <!-- BEGIN Controls / Account -->
        <v-tooltip text="Your Account" location="bottom">
        <template v-slot:activator="{ props: tooltip }">
            <v-menu location="bottom">
                <template v-slot:activator="{ props: menu }">
                    <div class="env-avatar ms-2 my-auto" v-bind="{ ...tooltip, ...menu }">
                        <v-avatar color="#d3d3d3" size="x-small" class="my-auto" style="font-size: 10px;">
                            TN
                        </v-avatar>
                        <v-icon icon="mdi-chevron-down" class="my-auto ms-1" style="color: #bfbfbf"></v-icon>
                    </div>
                </template>
                <div class="env-tab-menu">
                    <div style="background: rgba(191, 191, 191, 0.25); border-radius: 5px; display: flex; justify-content: flex-start; padding: 10px; margin-bottom: 10px;">
                        <v-avatar color="#d3d3d3" size="45" class="my-auto me-2" style="font-size: 18px;">
                        TN
                        </v-avatar>
                        <div class="my-auto">
                            <p style="margin: 0; padding: 0; font-weight: 600;">{{ this.user.given_name }} {{ this.user.family_name }}</p>
                            <p style="margin: 0; padding: 0; font-size: 12px">{{ this.user.email }}</p>
                        </div>
                    </div>
                    <p style="color: #bfbfbf; margin: 0; font-weight: 700; font-size: 12px; margin-left: 10px; margin-bottom: 5px;">Account Options</p>
                    <div class="env-menu-option">
                        Account Settings
                        <v-icon icon="mdi-account-outline" class="my-auto" style="color: #bfbfbf; font-size: 18px;"></v-icon>
                    </div>
                    <hr class="my-2" color="#d3d3d3">
                    <div class="env-menu-option red" @click="this.logout()">
                        Log Out
                        <v-icon icon="mdi-logout" class="my-auto" style="font-size: 18px;"></v-icon>
                    </div>
                </div>
            </v-menu>
        </template>
        </v-tooltip>
        <!-- END Controls / Account -->
    </div>
    <!-- END Nav Bar -->

    <!-- BEGIN Drive Content -->
    <div class="drive-content">

        <!-- BEGIN Sidebar -->
        <div class="drive-content-sidebar">
            
            <div class="pa-3">

                <button class="drive-create-new mb-3" @click="this.openCreateContainerDialog()"><v-icon icon="mdi-plus" class="my-auto me-2"></v-icon>Create Container</button> 

                <div :class="{'drive-content-sidebar-option': true, 'active': (this.tab == 0)}">
                    Home
                    <v-icon icon="mdi-home" class="my-auto" style="color: #bfbfbf; font-size: 20px;"></v-icon>
                </div>

                <hr class="my-2" color="#d3d3d3">

                <div :class="{'drive-content-sidebar-option': true, 'active': (this.tab == 1), 'mb-2': true}">
                    Your Containers
                    <v-icon icon="mdi-package-variant-closed" class="my-auto" style="color: #bfbfbf; font-size: 20px;"></v-icon>
                </div>

                <div :class="{'drive-content-sidebar-option': true, 'active': (this.tab == 2), 'mb-5': true}">
                    Shared with You
                    <v-icon icon="mdi-account-multiple-outline" class="my-auto" style="color: #bfbfbf; font-size: 20px;"></v-icon>
                </div>

                <v-progress-linear :model-value="10 * this.recentContainers.length" color="#379af5" height="5" style="border-radius: 5px;"></v-progress-linear>
                <center><p class="mt-2" style="color: #bfbfbf; font-weight: 400;">{{ this.recentContainers.length }}/10 containers used</p></center>
            </div>

            <!-- BEGIN Sidebar Footer -->
            <div class="env-sidebar-footer">
                &copy; {{ new Date().getFullYear() }} cloudcontain.net &bull; <a href="#">Terms of Use</a>
            </div>
            <!-- END Sidebar Footer -->

        </div>
        <!-- END Sidebar -->

        <!-- BEGIN Tabs -->
        <div class="drive-content-tabs pa-5">

            <!-- BEGIN Home Tab -->
            <div v-if="this.tab == 0">

                <h2 class="m-0"><strong>Welcome back, {{ this.user.given_name }}.</strong></h2>
                <p class="m-0 mb-5">What do you want to work on this {{ (this.time < 12) ? "morning" : (this.time >= 12 && this.time < 18) ? "afternoon" : "evening" }}?</p>
                
                <div style="width: 100%;" class="mb-5">
                    <div class="mb-2" style="display: flex; width: 100%; justify-content: space-between;">
                        <p class="drive-content-label my-auto">Recent Containers</p>
                        <v-tooltip text="Refresh Containers" location="left">
                            <template v-slot:activator="{ props }">
                                <button class="drive-content-refresh my-auto" @click="this.loadContainers()" :disabled="this.loading" v-bind="props"><v-icon icon="mdi-refresh"></v-icon></button>
                            </template>
                        </v-tooltip>
                    </div>
                    <template v-if="this.recentContainers.length > 0" v-for="container in this.recentContainers">
                        <div class="drive-content-container-thumb" @click="openContainer(container.containerId)">
                            <div class="drive-content-container-thumb-name">
                                <div>
                                    <p class="m-0 p-0" style="font-size: 18px;">{{ container.name }}</p>
                                    <p class="m-0 p-0" style="font-size: 15px; color: #bfbfbf; font-weight: 600;">Created {{ this.getTimeSince(container.created) }}</p>
                                </div>
                                <v-icon class="my-auto me-1" icon="mdi-package-variant-closed" style="color: #379af5; font-size: 40px;"></v-icon>
                            </div>
                            <div class="drive-content-container-thumb-footer">
                                <div style="display: flex;">
                                    <div class="me-3" style="display: flex; justify-content: start;">
                                        <v-icon class="drive-content-container-thumb-icon my-auto me-1" icon="mdi-lock-outline"></v-icon>
                                        Private
                                    </div>
                                    <div class="me-3" style="display: flex; justify-content: start;">
                                        <v-icon class="drive-content-container-thumb-icon my-auto me-1" icon="mdi-server-outline"></v-icon>
                                        512MB
                                    </div>
                                </div>
                                <v-menu location="bottom">
                                    <template v-slot:activator="{ props }">
                                        <v-icon class="env-sidebar-content-files-file-options my-auto" icon="mdi-dots-vertical" style="font-size: 20px; color: #bfbfbf;" v-bind="props" @click="openContainerOptions"></v-icon>
                                    </template>
                                    <div class="env-tab-menu mt-1">
                                        <p style="color: #bfbfbf; margin: 0; font-weight: 700; font-size: 12px; margin-left: 10px; margin-bottom: 5px;">Container Options</p>
                                        <div class="env-menu-option">
                                            Rename container
                                            <v-icon icon="mdi-form-textbox" class="my-auto" style="color: #bfbfbf; font-size: 22px;"></v-icon>
                                        </div>
                                        <div class="env-menu-option">
                                            Share container
                                            <v-icon icon="mdi-account-group-outline" class="my-auto" style="color: #bfbfbf; font-size: 22px;"></v-icon>
                                        </div>
                                        <hr class="my-2" color="#d3d3d3">
                                        <div class="env-menu-option red" @click="openDeleteContainerDialog(container)">
                                            Delete container 
                                            <v-icon icon="mdi-delete-empty-outline" class="my-auto" style="font-size: 22px;"></v-icon>
                                        </div>
                                    </div>
                                </v-menu>
                            </div>
                        </div>
                    </template>
                    <div v-if="this.recentContainers.length == 0 && this.loading" style="width: 100%; text-align: center;">
                        Fetching containers...
                        <v-progress-circular
                        class="ms-1"
                        color="#379af5"
                        indeterminate
                        ></v-progress-circular>
                    </div>
                    <div v-if="this.recentContainers.length == 0 && !this.loading" style="width: 100%; background: rgba(191, 191, 191, 0.08); padding: 10px; text-align: center; border-radius: 5px;">
                        You currently have no recent containers
                    </div>
                </div>
            </div>
            <!-- END Home Tab -->

        </div>
        <!-- END Tabs -->

    </div>
    <!-- END Drive Content -->

</template>

<script>
import { useAuth0 } from '@auth0/auth0-vue';
import moment from "moment";
export default {
    data() {
        const { logout, user, isAuthenticated } = useAuth0();
        return {
            loading: true,
            tab: 0,
            time: new Date().getHours(),
            recentContainers: [],
            createContainerDialog: {
                show: false,
                name: null,
                isPublic: false,
                type: "java"
            },
            deleteContainerDialog: false,
            toDelete: null,
            createContainerName: null,
            logout: () => {
                logout();
            },
            user,
            userInfo: null,
            isAuthenticated
        }
    },
    async mounted() {
        await this.loadContainers();
        this.loading = false;

        this.userInfo = await this.$store.dispatch('user/getUserInfo', {
            accessToken: await this.$auth0.getAccessTokenSilently()
        });
    },
    methods: {
        openDeleteContainerDialog(container) {
            this.toDelete = container;
            this.deleteContainerDialog = true;
        },
        openCreateContainerDialog() {
            this.createContainerDialog.name = null;
            this.createContainerDialog.show = true;
        },
        async loadContainers() {
            this.loading = true;
            this.recentContainers = await this.$store.dispatch('container/listContainers', {
                accessToken: await this.$auth0.getAccessTokenSilently()
            });
            this.loading = false;
        },
        async createContainer() {
            this.loading = true;
            let containerId = await this.$store.dispatch('container/createContainer', {
                name: this.createContainerDialog.name,
                accessToken: await this.$auth0.getAccessTokenSilently()
            })
            await this.loadContainers();
            this.createContainerDialog.show = false;
            this.loading = false;
            window.open(`/env/${containerId}`, '_blank');
        },
        openContainer(containerId) {
            window.open(`/env/${containerId}`, "_self");
        },
        openContainerOptions(event) {
            event.stopPropagation();
        },
        async confirmDelete() {
            this.loading = true;
            let response = await this.$store.dispatch('container/deleteContainer', {
                containerId: this.toDelete.containerId,
                accessToken: await this.$auth0.getAccessTokenSilently()
            });
            await this.loadContainers();
            if(response == 200) {
                this.deleteContainerDialog = false;
            } else {
                alert("Error deleting container. Try again later.");
            }
            this.loading = false;
        },
        getTimeSince(date) {
            return moment.utc(date).fromNow();
        }
    }
}
</script>