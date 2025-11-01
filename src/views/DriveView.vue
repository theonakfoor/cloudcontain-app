<template>

    <!-- BEGIN Create Container Dialog -->
    <v-dialog
      v-model="createContainerDialog.show"
      max-width="600"
    >
      <div class="drive-dialog">
        <h2 class="mb-4" style="font-weight: 800; font-size: 25px; margin: 0; padding: 0;">Create Container</h2>
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
      v-model="deleteContainerDialog.show"
      max-width="500"
    >
        <div class="drive-dialog">
            <h2 class="mb-4" style="font-weight: 800; font-size: 25px; margin: 0; padding: 0;">Delete Container</h2>
            <p class="m-0" style="font-size: 18px;">Are you sure you want to delete <strong>{{ this.deleteContainerDialog.toDelete.name }}</strong>?</p>
            <div class="global-dialog-action mt-3">
                <button class="global-dialog-action-cancel me-2" @click="this.deleteContainerDialog.show = false">Cancel</button>
                <button class="global-dialog-action-danger" @click="confirmDelete()"><v-icon icon="mdi-delete-empty-outline" class="my-auto me-2"></v-icon> Delete Container</button>
            </div>
        </div>
    </v-dialog>
    <!-- END Delete Container Dialog -->

    <!-- BEGIN Progress Indicator -->
    <v-progress-linear model-value="0" color="#379af5" height="3" :indeterminate="this.loading"></v-progress-linear>
    <!-- END Progress Indicator -->

    <!-- BEGIN Nav Bar -->
    <div class="env-bar" style="border: 0;">
        <!-- BEGIN Logo -->
        <img src="../assets/images/cloudcontain.svg" width="150" class="my-auto" @click="this.home()" />
        <!-- END Logo -->

        <!-- BEGIN Drive Searchbar -->
        <div class="drive-search">
            <input class="drive-searchbar" placeholder="Search your containers" v-model="this.search.query" @keyup.enter="searchContainers"  />
            <v-tooltip text="Search" location="bottom">
                <template v-slot:activator="{ props }">
                    <div class="drive-search-small ms-2 my-auto" v-bind="props" @click="searchContainers"><v-icon class="mx-auto my-auto" icon="mdi-magnify" style="font-size: 24px; margin: 0; padding: 0;"></v-icon></div>
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
                            {{ this.user.given_name[0].toUpperCase() }}{{ this.user.family_name[0].toUpperCase() }}
                        </v-avatar>
                        <v-icon icon="mdi-chevron-down" class="my-auto ms-1" style="color: #bfbfbf"></v-icon>
                    </div>
                </template>
                <div class="env-tab-menu">
                    <div style="background: rgba(191, 191, 191, 0.25); border-radius: 5px; display: flex; justify-content: flex-start; padding: 10px; margin: 10px;">
                        <v-avatar color="#d3d3d3" size="45" class="my-auto me-2" style="font-size: 18px;">
                        {{ this.user.given_name[0].toUpperCase() }}{{ this.user.family_name[0].toUpperCase() }}
                        </v-avatar>
                        <div class="my-auto">
                            <p style="margin: 0; padding: 0; font-weight: 600;">{{ this.user.given_name }} {{ this.user.family_name }}</p>
                            <p style="margin: 0; padding: 0; font-size: 12px">{{ this.user.email }}</p>
                        </div>
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

    <div class="drive-content">

        <div class="drive-sidebar">
            <div>
                <button class="drive-create-new" @click="this.openCreateContainerDialog()" :disabled="!this.loading && this.userInfo.containers >= 3"><v-icon icon="mdi-plus" class="my-auto me-2"></v-icon>Create Container</button> 
            
                <div :class="{'drive-content-sidebar-option': true, 'active': (this.tab == 0), 'mt-4': true}" @click="this.tab = 0">
                    Home
                    <v-icon icon="mdi-home" class="my-auto" style="color: #bfbfbf; font-size: 20px;"></v-icon>
                </div>

                <v-skeleton-loader type="list-item-two-line" v-if="this.loading"></v-skeleton-loader>

                <div class="mt-4" style="width: 100%; display: flex; justify-content: center;" v-if="!this.loading">
                    <div :class="{'drive-container-usage-indicator': true, 'active': (this.userInfo.containers >= 1)}"></div>
                    <div :class="{'drive-container-usage-indicator': true, 'active': (this.userInfo.containers >= 2)}"></div>
                    <div :class="{'drive-container-usage-indicator': true, 'active': (this.userInfo.containers >= 3)}" style="margin-right: 0 !important;"></div>
                </div>

                <div class="mt-2" style="width: 100%; text-align: center;" v-if="!this.loading">
                    <p style="color: #bfbfbf">{{ this.userInfo.containers }} of 3 <strong>Free</strong> Containers used</p>
                </div>
            </div>
            <div>
                <img src="../assets/images/cloudcontain-gray.svg" width="100" style="margin: 0; padding: 0;" />
                <p style="color: #d3d3d3; margin: 0; padding: 0; font-size: 14px;">&copy; {{ new Date().getFullYear() }} cloudcontain.net by <strong>Theo Nakfoor</strong></p> 
                <a href="/terms" style="font-size: 12px;">Privacy Policy</a> <a href="/terms" style="font-size: 12px;">Terms of Service</a>
            </div>
        </div>

        <div class="drive-drive">
            <div class="drive-drive-content" v-if="this.tab == 0">
                <!-- BEGIN Loading Overlay -->
                <div v-if="this.loading" style="width: 100%; height: 100%; display: flex; justify-content: center; align-items: center;">
                    <div style="text-align: center;">
                        <v-progress-circular
                            indeterminate
                            color="#379af5"
                            size="35"
                            width="3"
                        ></v-progress-circular>
                        <p class="mt-3">Loading your containers...</p>
                    </div>
                </div>
                <!-- END Loading Overlay -->
                <template v-if="!this.loading">
                    <!-- BEGIN Welcome Message -->
                    <div style="width: 100%; padding: 40px 20px; text-align: center;">
                        <h2 class="m-0">Welcome back, <span class="gradient-text"><strong>{{ this.user.given_name }}</strong></span></h2>
                        <p class="m-0 mb-5" style="font-size: 20px;">What do you want to work on this {{ (this.time < 12) ? "morning" : (this.time >= 12 && this.time < 18) ? "afternoon" : "evening" }}?</p>
                    </div>
                    <!-- END Welcome Message -->

                    <!-- BEGIN Recent Containers -->
                    <p class="drive-content-label" style="margin: 0 !important; margin-bottom: 5px !important;">Recent Containers</p>

                    <div style="display: flex; flex-direction: row; overflow-x: auto; flex: 1;" v-if="this.recentContainers.data.length > 0">
                        <template v-for="container in this.recentContainers.data">
                            <div class="mb-2 me-2" style="display: inline-block; width: 350px; min-width: 350px; padding: 10px; background: rgba(191, 191, 191, 0.25); border-radius: 5px; cursor: pointer;" @click="openContainer(container.containerId)">
                                <div class="drive-content-container-thumb-name" style="border-bottom: 0 !important; margin: 0 !important; padding-bottom: 0 !important;">
                                    <div>
                                        <p class="m-0 p-0" style="font-size: 18px;">{{ container.containerName }}</p>
                                        <p class="m-0 p-0" style="font-size: 15px; color: #bfbfbf; font-weight: 600;">Last accesed {{ this.getTimeSince(container.created) }}</p>
                                    </div>
                                    <v-icon class="my-auto me-1" icon="mdi-package-variant-closed" style="color: #379af5; font-size: 40px;"></v-icon>
                                </div>
                            </div>
                        </template>
                    </div>

                    <div style="width: 100%; padding: 20px; text-align: center; color: #bfbfbf;" v-if="this.recentContainers.data.length == 0 && this.recentContainers.show">
                        No recent containers
                    </div>
                    <!-- END Recent Containers -->

                    <!-- BEGIN Recent Jobs -->
                    <p class="drive-content-label mt-2" style="margin: 0 !important; margin-bottom: 5px !important;">Recent Jobs</p>
                    
                    <div style="display: flex; flex-direction: row; overflow-x: auto; flex: 1;" v-if="this.recentJobs.data.length > 0">
                        <template v-for="job in this.recentJobs.data">
                            <div class="mb-2 me-2" style="display: inline-block; width: 350px; min-width: 350px; padding: 10px; background: rgba(191, 191, 191, 0.25); border-radius: 5px; cursor: pointer;" @click="openContainer(job.containerId)">

                                <div style="display: flex; justify-content: space-between;">
                                    <!-- BEGIN Job Info -->
                                    <div class="my-auto">
                                        <p style="margin: 0; padding: 0; font-size: 14px;">Job <strong>&bull;&bull;&bull;{{ job.jobId.slice(-5) }}</strong></p>
                                        <p style="margin: 0; padding: 0; font-size: 12px; color: #999999; font-weight: 700;" v-if="['STARTING_NODE', 'NODE_STARTED', 'PENDING'].includes(job.status)">Queued {{ this.moment(job.queued).fromNow() }}</p>
                                        <p style="margin: 0; padding: 0; font-size: 12px; color: #999999; font-weight: 700;" v-if="['STARTED', 'CLONING', 'CONTAINERIZING', 'RUNNING', 'CLEANING'].includes(job.status)">Started {{ this.moment(job.started).fromNow() }}</p>
                                        <p style="margin: 0; padding: 0; font-size: 12px; color: #999999; font-weight: 700;" v-if="['COMPLETED', 'FAILED', 'BUILD_FAILED'].includes(job.status)">Finished {{ this.moment(job.ended).fromNow() }}</p>
                                    </div>
                                    <!-- END Job Info -->
                                    <!-- BEGIN Job Status -->
                                    <div style="display: flex; justify-content: start;">
                                        <div class="env-sidebar-job-status my-auto" v-if="false"></div>
                                        <div :class="{'spinner-grow':true, 'finished':(['COMPLETED', 'FAILED', 'BUILD_FAILED'].includes(job.status)), 'my-auto':true, 'node': (['STARTING_NODE', 'NODE_STARTED'].includes(job.status)), 'pending':(job.status == 'PENDING'), 'success': (['STARTED', 'CLONING', 'CONTAINERIZING', 'RUNNING', 'CLEANING', 'COMPLETED'].includes(job.status)), 'failed': (job.status == 'FAILED' || job.status == 'BUILD_FAILED')}" role="status" style="width: 10px; height: 10px;"></div>
                                        <span class="my-auto ms-2" v-if="job.status == 'STARTING_NODE'">Provisioning node</span>
                                        <span class="my-auto ms-2" v-if="job.status == 'NODE_STARTED'">Node provisioned</span>
                                        <span class="my-auto ms-2" v-if="job.status == 'PENDING'">Job pending</span>
                                        <span class="my-auto ms-2" v-if="job.status == 'STARTED'">Job started</span>
                                        <span class="my-auto ms-2" v-if="job.status == 'CLONING'">Cloning files</span>
                                        <span class="my-auto ms-2" v-if="job.status == 'CONTAINERIZING'">Containerizing</span>
                                        <span class="my-auto ms-2" v-if="job.status == 'RUNNING'">Job running</span>
                                        <span class="my-auto ms-2" v-if="job.status == 'CLEANING'">Cleaning up</span>
                                        <span class="my-auto ms-2" v-if="job.status == 'COMPLETED'">Job completed</span>
                                        <span class="my-auto ms-2" v-if="job.status == 'FAILED'">Job failed</span>
                                        <span class="my-auto ms-2" v-if="job.status == 'BUILD_FAILED'">Build failed</span>
                                    </div>
                                    <!-- END Job Status -->
                                </div>

                                <div style="width: 100%; background: #f2f2f2; border-radius: 5px; font-size: 15px; padding: 5px; text-align: center; margin-top: 5px;">
                                    {{ job.containerName }}
                                </div>

                            </div>
    
                        </template>
                    </div>

                    <div style="width: 100%; padding: 20px; text-align: center; color: #bfbfbf;" v-if="this.recentJobs.data.length == 0 && this.recentJobs.show">
                        No recent jobs
                    </div>
                    <!-- END Recent Jobs -->

                    <!-- BEGIN All Containers -->
                    <p class="drive-content-label mt-2" style="margin: 0 !important; margin-bottom: 5px !important;">All Containers</p>

                    <template v-if="this.containers.data.length > 0" v-for="container in this.containers.data">
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
                                        <v-icon class="drive-content-container-thumb-icon my-auto me-1" icon="mdi-lock" v-if="!container.public"></v-icon>
                                        <v-icon class="drive-content-container-thumb-icon my-auto me-1" icon="mdi-earth" v-if="container.public"></v-icon>
                                        {{ container.public ? "Public" : "Private" }}
                                    </div>
                                    <div class="me-3" style="display: flex; justify-content: start;">
                                        <v-icon class="drive-content-container-thumb-icon my-auto me-1" icon="mdi-server-outline"></v-icon>
                                        {{ this.formatBytes(container.size) }}
                                    </div>
                                </div>
                                <v-menu location="bottom">
                                    <template v-slot:activator="{ props }">
                                        <v-icon class="env-sidebar-content-files-file-options my-auto" icon="mdi-dots-vertical" style="font-size: 20px; color: #bfbfbf;" v-bind="props" @click="openContainerOptions"></v-icon>
                                    </template>
                                    <div class="env-tab-menu mt-1">
                                        <div class="env-menu-option red" @click="openDeleteContainerDialog(container)">
                                            Delete container 
                                            <v-icon icon="mdi-delete-empty-outline" class="my-auto" style="font-size: 22px;"></v-icon>
                                        </div>
                                    </div>
                                </v-menu>
                            </div>
                        </div>
                    </template>

                    <div style="width: 100%; padding: 20px; display: flex; align-items: center; justify-content: center; color: #bfbfbf;" v-if="this.containers.data.length == 0 && this.containers.show">
                        <div style="text-align: center;">
                            You haven't created any containers yet
                        </div>
                    </div>

                </template>
                <!-- END All Containers -->
            </div>

            <div class="drive-drive-content" v-if="this.search.results != null && this.tab != 0">
                <h3 class="m-0">Search Results</h3>
                <p>Found <strong>{{ this.search.results.total }}</strong> matching containers.</p>

                <template v-if="this.search.results.total > 0" v-for="container in this.search.results.containers">
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
                                    <v-icon class="drive-content-container-thumb-icon my-auto me-1" icon="mdi-lock" v-if="!container.public"></v-icon>
                                    <v-icon class="drive-content-container-thumb-icon my-auto me-1" icon="mdi-earth" v-if="container.public"></v-icon>
                                    {{ container.public ? "Public" : "Private" }}
                                </div>
                                <div class="me-3" style="display: flex; justify-content: start;">
                                    <v-icon class="drive-content-container-thumb-icon my-auto me-1" icon="mdi-server-outline"></v-icon>
                                    {{ this.formatBytes(container.size) }}
                                </div>
                            </div>
                            <v-menu location="bottom">
                                <template v-slot:activator="{ props }">
                                    <v-icon class="env-sidebar-content-files-file-options my-auto" icon="mdi-dots-vertical" style="font-size: 20px; color: #bfbfbf;" v-bind="props" @click="openContainerOptions"></v-icon>
                                </template>
                                <div class="env-tab-menu mt-1">
                                    <div class="env-menu-option red" @click="openDeleteContainerDialog(container)">
                                        Delete container 
                                        <v-icon icon="mdi-delete-empty-outline" class="my-auto" style="font-size: 22px;"></v-icon>
                                    </div>
                                </div>
                            </v-menu>
                        </div>
                    </div>
                </template>

                <center><button class="env-load-more mt-4 mb-10" :disabled="this.loading" @click="this.loadMoreSearch()" v-if="this.search.results.hasMore">Load More</button></center>

                <div style="width: 100%; padding: 20px; display: flex; align-items: center; justify-content: center; color: #bfbfbf;" v-if="this.search.results.total == 0">
                    <div style="text-align: center;">
                        No results found for the given query.
                    </div>
                </div>

            </div>
        </div>
    </div>

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
            recentContainers: {
                show: true,
                data: []
            },
            recentJobs: {
                show: true,
                data: []
            },
            containers: {
                show: true,
                data: []
            },
            search: {
                query: null,
                results: null,
            },
            createContainerDialog: {
                show: false,
                name: null,
                isPublic: false,
                type: "java"
            },
            deleteContainerDialog: {
                show: false,
                toDelete: null
            },
            logout: () => {
                logout();
            },
            user,
            userInfo: null,
            isAuthenticated
        }
    },
    async mounted() {
        await this.loadRecentContainers();
        await this.loadRecentJobs();
        await this.loadContainers();
        this.userInfo = await this.$store.dispatch('user/getUserInfo', {
            accessToken: await this.$auth0.getAccessTokenSilently()
        });
        this.loading = false;
    },
    methods: {
        openDeleteContainerDialog(container) {
            this.deleteContainerDialog.toDelete = container;
            this.deleteContainerDialog.show = true;
        },
        openCreateContainerDialog() {
            this.createContainerDialog.name = null;
            this.createContainerDialog.show = true;
        },
        async loadContainers() {
            this.loading = true;
            this.containers.data = await this.$store.dispatch('container/listContainers', {
                offset: 0,
                accessToken: await this.$auth0.getAccessTokenSilently()
            });
            this.loading = false;
        },
        async loadRecentJobs() {
            this.loading = true;
            this.recentJobs.data = await this.$store.dispatch('job/listRecentJobs', {
                accessToken: await this.$auth0.getAccessTokenSilently()
            });
            this.loading = false;
        },
        async loadRecentContainers() {
            this.loading = true;
            this.recentContainers.data = await this.$store.dispatch('container/listRecentContainers', {
                accessToken: await this.$auth0.getAccessTokenSilently()
            });
            this.loading = false;
        },
        async createContainer() {
            this.createContainerDialog.show = false;
            this.loading = true;
            let containerId = await this.$store.dispatch('container/createContainer', {
                name: this.createContainerDialog.name,
                accessToken: await this.$auth0.getAccessTokenSilently()
            })
            await this.loadContainers();
            this.userInfo.containers += 1;
            this.loading = false;
        },
        async searchContainers() {
            if(this.search.query != null && this.search.query.trim() != "") {
                this.loading = true;
                this.tab = 1;
                let response = await this.$store.dispatch('container/searchContainers', {
                    query: this.search.query,
                    offset: 0,
                    accessToken: await this.$auth0.getAccessTokenSilently()
                });
                if(response.status == 200)
                    this.search.results = response.data;
                else
                    this.showErrorDialog("An unknown error occured while searching files. Please try again later.");
                this.loading = false;
            } else {
                this.tab = 0;
                this.search.results = null;
            }
        },
        async loadMoreSearch() {
            this.loading = true;
            let response = await this.$store.dispatch('container/searchContainers', {
                query: this.search.query,
                accessToken: await this.$auth0.getAccessTokenSilently(),
                offset: this.search.results.containers.length
            });
            if(response.status == 200) {
                this.search.results.containers = this.search.results.containers.concat(response.data.containers);
                this.search.results.hasMore = response.data.hasMore;
            } else {
                this.showErrorDialog("An unknown error occured while searching files. Please try again later.");
            }
            this.loading = false;
        },
        openContainer(containerId) {
            window.open(`/env/${containerId}`, "_self");
        },
        openContainerOptions(event) {
            event.stopPropagation();
        },
        async confirmDelete() {
            this.deleteContainerDialog.show = false;
            this.loading = true;
            let response = await this.$store.dispatch('container/deleteContainer', {
                containerId: this.deleteContainerDialog.toDelete.containerId,
                accessToken: await this.$auth0.getAccessTokenSilently()
            });
            await this.loadContainers();
            if(response == 204) {
                this.userInfo.containers -= 1;
            } else {
                alert("Error deleting container. Try again later.");
            }
            this.loading = false;
        },
        getTimeSince(date) {
            return moment.utc(date).fromNow();
        },
        formatBytes(bytes) {
            const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
            if (bytes === 0) return '0B';
            const i = Math.floor(Math.log(bytes) / Math.log(1024));
            const value = Math.ceil(bytes / Math.pow(1024, i));
            return `${value}${units[i]}`;
        },
        moment(date) {
            return moment.utc(date).local();
        },
        home() {
            window.open(`/`, "_self");
        },
    }
}
</script>