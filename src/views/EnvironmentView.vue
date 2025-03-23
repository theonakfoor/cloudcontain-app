<template>

    <!-- BEGIN Create Directory Dialog -->
    <v-dialog
          v-model="createDirectoryDialog.show"
          max-width="500"
        >
      <div class="drive-dialog">
        <h2 class="mb-2" style="font-weight: 800; font-size: 25px; margin: 0; padding: 0;">Create Directory</h2>
        <input v-model="this.createDirectoryDialog.name" class="global-input" type="text" placeholder="Directory Name" />
        <div class="global-dialog-action mt-3">
            <button class="global-dialog-action-cancel me-2" @click="this.createDirectoryDialog.show = false">Cancel</button>
            <button class="global-dialog-action-confirm" @click="createDirectory()"><v-icon icon="mdi-plus-circle-outline" class="my-auto me-2"></v-icon> Create Directory</button>
        </div>
      </div>
    </v-dialog>
    <!-- END Create Directory Dialog -->

    <!-- BEGIN Create File Dialog -->
    <v-dialog
          v-model="createFileDialog.show"
          max-width="500"
        >
      <div class="drive-dialog">
        <h2 class="mb-2" style="font-weight: 800; font-size: 25px; margin: 0; padding: 0;">Create File</h2>
        <input v-model="this.createFileDialog.name" class="global-input" type="text" placeholder="File Name" />
        <div class="global-dialog-action mt-3">
            <button class="global-dialog-action-cancel me-2" @click="this.createFileDialog.show = false">Cancel</button>
            <button class="global-dialog-action-confirm" @click="createFile()"><v-icon icon="mdi-plus-circle-outline" class="my-auto me-2"></v-icon> Create File</button>
        </div>
      </div>
    </v-dialog>
    <!-- END Create File Dialog -->

    <!-- BEGIN Progress Indicator -->
    <v-progress-linear color="#379af5" height="3" :indeterminate="this.loading"></v-progress-linear>
    <!-- END Progress Indicator -->

    <!-- BEGIN Status Overlay -->
    <div style="width: 100vw; height: 100vh; display: flex; justify-content: center; align-items: center;" v-if="[null, 401, 404, 500].includes(this.envInfo)">
      <div style="text-align: center;" v-if="this.envInfo == null">
        <v-progress-circular color="#379af5" :size="35" indeterminate></v-progress-circular>
        <p style="font-weight: 500; font-size: 20px;" class="mt-3 m-0">Loading container...{{  }}</p>
      </div>
      <div style="text-align: center;" v-if="this.envInfo == 401">
        <v-icon style="color: #e3242b; font-size: 55px;" icon="mdi-security"></v-icon>
        <p style="font-weight: 800; font-size: 25px;" class="mt-3 m-0">Oops.</p>
        <p style="font-weight: 400; font-size: 20px;" class="m-0">You don't have access to that container.</p>
        <center><button class="env-action mt-5"><v-icon icon="mdi-account-plus-outline" class="my-auto me-2"></v-icon> Request Access</button></center>
        <img src="../assets/images/cloudcontain.svg" width="150" class="mt-5" @click="this.home()" />
      </div>
      <div style="text-align: center;" v-if="this.envInfo == 404 || this.envInfo == 500">
        <v-icon style="color: #379af5; font-size: 55px;" icon="mdi-package-variant"></v-icon>
        <p style="font-weight: 800; font-size: 25px;" class="mt-3 m-0">Uh oh.</p>
        <p style="font-weight: 400; font-size: 20px;" class="m-0">It looks like that container doesn't exist. Maybe an old link?</p>
        <img src="../assets/images/cloudcontain.svg" width="150" class="mt-5" @click="this.home()" />
      </div>
    </div>
    <!-- END Status Overlay -->
    
    <!-- BEGIN Nav Bar -->
    <div class="env-bar" v-if="![null, 401, 404, 500].includes(this.envInfo)">
      <!-- BEGIN Logo -->
      <img src="../assets/images/cloudcontain.svg" width="150" class="my-auto" @click="this.home()" />
      <!-- END Logo -->
      <!-- BEGIN Environment Details -->
      <div style="display: flex; flex-direction: row;" class="my-auto">
        <div class="env-name">
          <h4 style="margin: 0; font-weight: 400; outline: none; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 200px;">{{ this.envInfo.name }}</h4>
          <v-icon icon="mdi-chevron-down" class="ms-1 my-auto" style="color: #bfbfbf"></v-icon>
        </div>
        <v-tooltip text="Open Hunter" location="bottom">
          <template v-slot:activator="{ props }">
            <div class="env-logs ms-2 my-auto" v-bind="props"><v-icon class="mx-auto my-auto" icon="mdi-crosshairs-gps" style="font-size: 24px; margin: 0; padding: 0;"></v-icon></div>
          </template>
        </v-tooltip>
        <v-tooltip text="Execute Container" location="bottom">
          <template v-slot:activator="{ props }">
            <div class="env-execute-small ms-2 my-auto" v-bind="props"><v-icon class="mx-auto my-auto" icon="mdi-play-speed" style="font-size: 24px; margin: 0; padding: 0;"></v-icon></div>
          </template>
        </v-tooltip>
      </div>
      <!-- END Environment Details -->
      <!-- BEGIN Controls / Account -->
      <div style="display: flex; flex-direction: row;" class="my-auto">
        <button class="env-action"><v-icon icon="mdi-account-group-outline" class="my-auto me-2"></v-icon> Share</button>
        <button class="env-action ms-2"><v-icon icon="mdi-progress-upload" class="my-auto me-2"></v-icon> Deploy</button>
        <div class="env-avatar ms-2">
          <v-avatar color="#d3d3d3" size="x-small" class="my-auto" style="font-size: 10px;">
            TN
          </v-avatar>
          <v-icon icon="mdi-chevron-down" class="my-auto ms-1" style="color: #bfbfbf"></v-icon>
        </div>
      </div>
      <!-- END Controls / Account -->
    </div>
    <!-- END Nav Bar -->

    <!-- BEGIN Environment Content -->
    <div class="env-content" v-show="![null, 401, 404, 500].includes(this.envInfo)">

      <!-- BEGIN Editor -->
      <div class="env-editor" id="editor">

        <!-- BEGIN Empty Display -->
        <div class="env-editor-empty" v-if="this.tabs.length == 0">
          <div style="text-align: center;">
            <v-icon style="color: #bfbfbf; font-size: 55px;" icon="mdi-atom-variant"></v-icon>
            <p style="font-weight: 800; font-size: 25px;" class="mt-3 m-0">No file selected.</p>
            <p style="font-weight: 400; font-size: 20px;" class="m-0 mb-5">Open or create a file to get started.</p>
            <div style="display: flex; justify-content: center;">
              <button class="env-action light me-2"><v-icon icon="mdi-folder-file-outline" class="my-auto me-2"></v-icon> Open File</button>
              <button class="env-action light me-2"><v-icon icon="mdi-file-plus-outline" class="my-auto me-2"></v-icon> Create File</button>
              <button class="env-action light"><v-icon icon="mdi-cloud-upload" class="my-auto me-2"></v-icon> Upload File</button>
            </div>
          </div>
        </div>
        <!-- END Empty Display -->

        <!-- BEGIN Editor Tabs -->
        <div class="env-editor-tabs" v-if="this.tabs.length > 0">
          <template v-for="tab in this.tabs">
            <div :class="{'env-editor-tab': true, 'me-2':true, 'active': this.activeTab.fileId == tab.fileId}" @click="openTab(tab.fileId)">
              <span class="tab-label small">
                {{ tab.name }}
              </span>
              <v-icon icon="mdi-close" class="my-auto me-1" style="color: #bfbfbf; font-size: 12px;" @click="closeTab(tab.fileId, $event)"></v-icon>
            </div>
          </template>
          <v-menu location="bottom">
            <template v-slot:activator="{ props }">
              <span class="env-editor-plus my-auto" v-bind="props">
                <v-icon icon="mdi-plus-circle-multiple" style="font-size: 18px;"></v-icon>
              </span>
            </template>
            <div class="env-tab-menu mt-1">
              <p style="color: #bfbfbf; margin: 0; font-weight: 700; font-size: 12px; margin-left: 10px; margin-bottom: 5px;">Tab Options</p>
              <div class="env-menu-option">
                Create new file
                <v-icon icon="mdi-file-plus-outline" class="my-auto" style="color: #bfbfbf; font-size: 18px;"></v-icon>
              </div>
              <div class="env-menu-option">
                Open existing file
                <v-icon icon="mdi-folder-file-outline" class="my-auto" style="color: #bfbfbf; font-size: 18px;"></v-icon>
              </div>
              <div class="env-menu-option">
                Open all files
                <v-icon icon="mdi-file-multiple-outline" class="my-auto" style="color: #bfbfbf; font-size: 18px;"></v-icon>
              </div>
              <hr class="my-2" color="#d3d3d3">
              <div class="env-menu-option red">
                Close all tabs
                <v-icon icon="mdi-close-circle-multiple-outline" class="my-auto" style="font-size: 18px;"></v-icon>
              </div>
            </div>
          </v-menu>
        </div>
        <!-- END Editor Tabs -->

        <!-- BEGIN Source Trail -->
        <div class="env-editor-file-details" v-if="this.tabs.length > 0">
          <div class="env-editor-source-trail my-auto">

            <v-icon class="my-auto" icon="mdi-server-outline" style="color: #bfbfbf;" @click="openFolder('~', $event)"></v-icon> 
            <v-icon class="my-auto" icon="mdi-menu-right" style="color: #bfbfbf;"></v-icon> 

            <template v-for="path in this.activeTab.path">
              <span class="env-editor-source-trail-item my-auto" @click="openFolder(path.folderId, $event)">
                <v-icon class="my-auto" icon="mdi-folder-outline" style="color: #bfbfbf;"></v-icon> 
                <p class="ms-1 my-auto" style="margin: 0; padding: 0; font-weight: 600;">{{ path.name }}</p>
              </span>
              <v-icon class="my-auto" icon="mdi-menu-right" style="color: #bfbfbf;"></v-icon> 
            </template>

            <span class="env-editor-source-trail-item my-auto">
              <v-icon class="my-auto" icon="mdi-cube-outline" style="color: #379af5;"></v-icon> 
              <p class="ms-1 my-auto" style="margin: 0; padding: 0; font-weight: 600;">{{ this.activeTab.name }}</p>
            </span>

          </div>
          <div class="env-editor-source-save my-auto">

            <div style="display: flex; justify-content: start;" v-if="this.activeTab.saving && this.activeTab.saving != null">
              <v-progress-circular class="my-auto" color="#379af5" indeterminate size="15" width="2"></v-progress-circular>
              <p class="ms-2 my-auto" style="margin: 0; padding: 0;">Syncing changes...</p>
            </div>

            <div style="display: flex; justify-content: start;" v-if="!this.activeTab.saving && this.activeTab.saving != null">
              <v-icon class="my-auto" color="#00A550" icon="mdi-check-all"></v-icon>
              <p class="ms-2 my-auto" style="margin: 0; padding: 0;">Saved {{ this.moment(this.activeTab.lastModified).fromNow() }}</p>
            </div>

          </div>
        </div>
        <!-- END Source Trail -->

        <!-- BEGIN Code Pad -->
        <template v-for="tab in this.tabs" v-if="this.tabs.length > 0">
          <div class="env-editor-pad" v-show="this.activeTab.fileId == tab.fileId">
            <div :id="`env-editor-pad-${tab.fileId}`"></div>
          </div>
        </template>
        <!-- END Code Pad-->

      </div>
      <!-- END Editor -->

      <!-- BEGIN Sidebar Controls -->
      <div class="env-sidebar" id="env-sidebar">

        <!-- BEGIN Sidebar Tabs -->
        <div class="env-sidebar-tabs">
          <div :class="{'env-sidebar-tab': true, 'active': this.sidebarTab == 1}" @click="this.sidebarTab = 1">
            <span class="tab-label">
              File Manager
            </span>
          </div>
          <div :class="{'env-sidebar-tab': true, 'active': this.sidebarTab == 0}" @click="this.sidebarTab = 0">
            <span class="tab-label">
              Console
            </span>
          </div>
        </div>
        <!-- END Sidebar Tas -->

        <!-- BEGIN Sidebar Tab Content -->
        <div class="env-sidebar-content">
          <!-- BEGIN File Manager Content -->
          <div class="env-sidebar-content-files" v-if="this.sidebarTab == 1">
            
            <!-- BEGIN Sticky Header -->
            <div class="pa-3" style="background: white; position: sticky; top: 0; z-index: 990;">
              <div style="display: flex; flex-direction: row; width: 100%;">
                <input class="env-sidebar-content-files-searchbar" placeholder="Search container files" />
                <v-tooltip text="Create File" location="bottom">
                  <template v-slot:activator="{ props }">
                    <div @click="openCreateFile()" class="env-sidebar-content-files-create ms-2 my-auto" v-bind="props"><v-icon class="my-auto mx-auto" icon="mdi-file-plus" style="font-size: 24px; margin: 0; padding: 0;"></v-icon></div>
                  </template>
                </v-tooltip>
                <v-tooltip text="Create Directory" location="bottom">
                  <template v-slot:activator="{ props }">
                    <div @click="openCreateDirectory()" class="env-sidebar-content-files-create ms-2 my-auto" v-bind="props"><v-icon class="my-auto mx-auto" icon="mdi-folder-plus" style="font-size: 24px; margin: 0; padding: 0;"></v-icon></div>
                  </template>
                </v-tooltip>
              </div>

              <v-tooltip text="Copy Current Location" location="bottom">
                <template v-slot:activator="{ props }">
                  <div class="env-sidebar-content-files-path mt-2" v-bind="props" @click="copyPath()">
                    <v-icon class="my-auto" icon="mdi-server-outline" @click="openFolder('~', $event)"></v-icon> 

                    <template v-for="folder in this.currentDirectory.path" v-if="this.currentDirectory.path.length > 0">
                      <v-icon class="my-auto" icon="mdi-menu-right" style="color: #bfbfbf;"></v-icon> 
                      <span class="env-editor-source-trail-item sidebar my-auto" @click="openFolder(folder.folderId, $event)">{{ folder.name }}</span> 
                    </template>

                    <v-icon class="my-auto" icon="mdi-menu-right" style="color: #bfbfbf;" v-if="this.currentDirectory.path.length == 0"></v-icon> 
                    <span style="color: #bfbfbf" class="env-editor-source-trail-item sidebar my-auto" v-if="this.currentDirectory.path.length == 0">(this container)</span> 
                  </div>
                </template>
              </v-tooltip>
            </div>
            <!-- END Sticky Header -->

            <div class="pa-3 pt-0">
              <p style="color: #bfbfbf; margin: 0; font-weight: 700;">Directories</p>

              <v-row class="mb-2">
                <template v-for="folder in this.currentDirectory.directories">
                  <v-col cols="4">
                    <div @click="openFolder(folder.folderId, $event)" style="display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 10px; text-align: center;">
                      <div class="env-sidebar-content-files-directory">
                        <v-icon icon="mdi-folder-outline" style="font-size: 60px; color: #379af5"></v-icon> 
                      </div>
                      <p style="margin: 0; padding: 0; font-size: 15px;">{{ folder.name }}</p>
                      <p style="margin: 0; padding: 0; font-size: 12px; color: #bfbfbf; font-weight: 800;">500MB</p>
                    </div>
                  </v-col>
                </template>
              </v-row>

              <div style="display: flex; justify-content: center;" v-if="this.currentDirectory.directories.length == 0">
                <p class="my-5" style="color: #bfbfbf;">No sub-directories exist in this directory.</p>
              </div>

              <p style="color: #bfbfbf; margin: 0; font-weight: 700;">Files</p>

              <template v-for="file in this.currentDirectory.files">
                <div class="env-sidebar-content-files-file mt-2" @click="(!this.loading) ? openFile(file.fileId) : null">
                  <div style="display: flex; flex-direction: row; justify-content: flex-start;">
                    <v-icon class="my-auto me-1" icon="mdi-cube-outline" style="color: #379af5;"></v-icon>
                    <p class="my-auto" style="font-size: 15px;">{{ file.name }}</p>
                  </div>
                  <p class="my-auto" style="color: #bfbfbf; font-size: 13px;">{{ this.moment(file.lastModified).format("MMM Do [at] h:mma") }} <v-icon class="env-sidebar-content-files-file-options my-auto" icon="mdi-dots-vertical"></v-icon></p>
                </div>
              </template>

              <div style="display: flex; justify-content: center;" v-if="this.currentDirectory.files.length == 0">
                <p class="my-5" style="color: #bfbfbf;">No files exist in this directory.</p>
              </div>

              <div class="mt-5" style="display: flex; justify-content: center;">
                <p style="color: #bfbfbf; border: 1px solid #d3d3d3; border-radius: 5px; padding: 5px 15px; width: auto;">Total directory size &mdash; <strong>1.3GB</strong></p>
              </div>
            </div>

          </div>
          <!-- END File Manager Content -->

          <!-- BEGIN Console Content -->
          <div class="env-sidebar-content-console pa-3" v-if="this.sidebarTab == 0">
            
            <div class="env-sidebar-content-console-output" v-if="this.consoleHistory.length > 0">
              
            </div>

            <div v-if="this.consoleHistory.length == 0">
              <p class="mb-2">The output history of this container will appear here when you execute your project.</p>
              <button class="env-execute"><v-icon icon="mdi-play-speed" class="my-auto me-2"></v-icon>Execute Container</button>            
            </div>

          </div>
          <!-- END Console Content -->

        </div>
        <!-- END Sidebar Tab Content -->

        <!-- BEGIN Sidebar Footer -->
        <div class="env-sidebar-footer">
          &copy; {{ new Date().getFullYear() }} cloudcontain.net by <strong>Theo Nakfoor</strong> &bull; <a href="#">Terms of Use</a>
        </div>
        <!-- END Sidebar Footer -->

      </div>
      <!-- END Sidebar Controls -->

    </div>
    <!-- END Environment Content -->

</template>

<script>
import {basicSetup} from "codemirror"
import {EditorView} from "@codemirror/view"
import {javascript} from "@codemirror/lang-javascript"
import {java} from "@codemirror/lang-java"
import { useAuth0 } from '@auth0/auth0-vue';
import moment from "moment";

export default {
  data() {
    const { logout, user, isAuthenticated } = useAuth0();
    return {
      loading: true,
      envInfo: null,
      sidebarTab: 0,
      currentDirectory: null,
      createDirectoryDialog: {
        show: false,
        name: null
      },
      createFileDialog: {
        show: false,
        name: null
      },
      tabs: [],
      activeTab: null,
      consoleHistory: [],
      logout: () => {
          logout();
      },
      user,
      isAuthenticated
    }
  },
  async mounted() {
    this.envInfo = await this.$store.dispatch('container/getContainer', {
        containerId: this.$route.params.containerId,
        accessToken: await this.$auth0.getAccessTokenSilently()
    });
    await this.loadDirectory("~");
  },
  methods: {
    openTab(fileId) {
      this.activeTab = this.tabs.find(tab => tab.fileId == fileId);;
    },
    openCreateDirectory() {
      this.createDirectoryDialog.name = null;
      this.createDirectoryDialog.show = true;
    },
    openCreateFile() {
      this.createFileDialog.name = null;
      this.createFileDialog.show = true;
    },
    closeTab(fileId, event = null) {
      if(event != null) { event.stopPropagation(); }
      let idx = this.tabs.findIndex(openTab => openTab.fileId == fileId);
      this.tabs.splice(idx, 1);
      if(this.activeTab.fileId == fileId) {
        this.activeTab = this.tabs.length > 0 ? this.tabs[0] : null;
      }
    },
    async loadDirectory(folderId) {
      this.loading = true;
      this.currentDirectory = await this.$store.dispatch('folder/getFolder', {
          folderId: folderId,
          containerId: this.$route.params.containerId,
          accessToken: await this.$auth0.getAccessTokenSilently()
      });
      this.loading = false;
    },
    async openFolder(folderId, event = null) {
      if(event != null) { event.stopPropagation(); }
      await this.loadDirectory(folderId);
    },
    async createDirectory() {
      this.loading = true;
      await this.$store.dispatch('folder/createFolder', {
          name: this.createDirectoryDialog.name,
          folderId: this.currentDirectory.folderId,
          containerId: this.$route.params.containerId,
          accessToken: await this.$auth0.getAccessTokenSilently()
      });
      await this.loadDirectory(this.currentDirectory.folderId);
      this.loading = false;
      this.createDirectoryDialog.show = false;
    },
    async createFile() {
      this.loading = true;
      await this.$store.dispatch('file/createFile', {
          name: this.createFileDialog.name,
          folderId: this.currentDirectory.folderId,
          containerId: this.$route.params.containerId,
          accessToken: await this.$auth0.getAccessTokenSilently()
      });
      await this.loadDirectory(this.currentDirectory.folderId);
      this.loading = false;
      this.createFileDialog.show = false;
    },
    async openFile(fileId) {
      if(this.tabs.some(tab => tab.fileId == fileId)) {
        this.activeTab = this.tabs.find(tab => tab.fileId == fileId);
      } else {
        this.loading = true;
        let file = await this.$store.dispatch('file/getFile', {
            fileId: fileId,
            containerId: this.$route.params.containerId,
            accessToken: await this.$auth0.getAccessTokenSilently()
        });
        let content = await this.$store.dispatch('file/readContent', {
            fileId: fileId,
            containerId: this.$route.params.containerId,
            accessToken: await this.$auth0.getAccessTokenSilently()
        });
        file.timeoutId = null;
        file.saving = null;
        this.tabs.push(file);
        // Wait 5ms for DOM to load before rendering editor
        let tab = this.tabs.find(tab => tab.fileId == fileId);
        setTimeout(() => {
          tab.pad = new EditorView({
              doc: content,
              parent: document.getElementById(`env-editor-pad-${fileId}`),
              extensions: [
                basicSetup,
                java(),
                EditorView.domEventHandlers({
                  keyup: async (event, view) => {
                    let target = this.tabs.find(t => t.fileId == fileId);
                    clearTimeout(target.timeoutId);
                    target.timeoutId = setTimeout(async () => {
                      await this.saveFile(target.fileId, view.state.doc);
                    }, 1000);
                  }
                })
              ]
          });
        }, 5);
        this.activeTab = tab;
        this.loading = false;
      }
    },
    async saveFile(fileId, doc) {
      let tab = this.tabs.find(tab => tab.fileId == fileId);
      tab.saving = true;
      let response = await this.$store.dispatch('file/updateContent', {
          fileId: tab.fileId,
          containerId: this.$route.params.containerId,
          content: doc.toString(),
          accessToken: await this.$auth0.getAccessTokenSilently()
      });
      tab.lastModified = response.lastModified;
      if(this.currentDirectory.files.some(file => file.fileId == fileId))
        this.currentDirectory.files.find(file => file.fileId == fileId).lastModified = response.lastModified;
      tab.saving = false;
    },
    copyPath() {
      navigator.clipboard.writeText(`~/${this.currentDirectory.path.map(folder => (folder.name.includes(" ") ? `"${folder.name}"`: folder.name)).join("/")}${(this.currentDirectory.path.length > 0 ? "/" : "")}`);
    },
    moment(date) {
      return moment.utc(date).local();
    },
    home() {
      window.open(`/drive`, "_self");
    }
  }
}
</script>