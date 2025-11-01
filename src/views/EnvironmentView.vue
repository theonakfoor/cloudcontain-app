<template>

    <!-- BEGIN Settings Dialog -->
    <v-dialog
          v-model="settingsDialog.show"
          max-width="800"
          max-height="500"
        >
      <div class="drive-dialog" style="height: 500px; max-height: 500px; padding: 10px;">
        <v-row style="height: 100%; margin: 0;">

          <v-col cols="4">
            <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
              <div>
                <div>
                  <div :class="{'env-content-tab': true, 'active': (this.settingsDialog.tab == 0)}" class="mb-3" @click="this.settingsDialog.tab = 0">
                    General
                    <v-icon icon="mdi-cog" class="my-auto"></v-icon>
                  </div>
                  <div :class="{'env-content-tab': true, 'active': (this.settingsDialog.tab == 1)}" class="mb-3" @click="this.settingsDialog.tab = 1">
                    Privacy
                    <v-icon icon="mdi-earth" class="my-auto" v-if="this.envInfo.public"></v-icon>
                    <v-icon icon="mdi-lock" class="my-auto" v-if="!this.envInfo.public"></v-icon>
                  </div>
                </div>
              </div>
              <p style="color: #d3d3d3; margin: 0;">Container ID {{ this.envInfo.containerId }}</p>
            </div>
          </v-col>

          <v-col cols="8">
            <div style="max-height: 450px; overflow-y: hidden !important;" v-if="this.settingsDialog.tab == 0">
              <div style="width: 100%; display: flex; flex-direction: row; justify-content: space-between; align-items: center;" class="mb-2">
                <h3 style="margin: 0;" class="my-auto"><strong>General Settings</strong></h3>
                <v-icon icon="mdi-close" class="my-auto" @click="this.settingsDialog.show = false"></v-icon>
              </div>
              <hr>
              <p style="margin: 0;" class="mb-2"><strong>Name & Description</strong></p>
              <input class="env-content-input mb-2" placeholder="Container name" style="width: 100%;" v-model="this.settingsDialog.name"/>
              <textarea rows="7" class="env-content-input mb-2" placeholder="Container description" v-model="this.settingsDialog.description" style="width: 100%; resize: none;"></textarea>
              <button class="env-action light mb-4" @click="updateContainerDetails">Update Details</button>
          
              <div style="width: 100%; display: flex; justify-content: space-between;">
                <p style="margin: 0;" class="mb-2"><strong>Storage</strong></p>
                <p style="margin: 0;" class="mb-2"><strong>{{ this.formatBytes(this.envInfo.size) }}</strong> of 5MB used</p>
              </div>
              <div class="progress mb-4" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="background: rgba(55, 154, 245, 0.2);">
                <div class="progress-bar" :style="{'width': ((this.envInfo.size / 5_000_000) * 100) + '%', 'background': '#379af5'}"></div>
              </div>
            </div>
            <div style="max-height: 450px; overflow-y: hidden !important;" v-if="this.settingsDialog.tab == 1">
              <div style="width: 100%; display: flex; flex-direction: row; justify-content: space-between; align-items: center;" class="mb-2">
                <h3 style="margin: 0;" class="my-auto"><strong>Privacy Settings</strong></h3>
                <v-icon icon="mdi-close" class="my-auto" @click="this.settingsDialog.show = false"></v-icon>
              </div>
              <hr>
              <div style="width: 100%; display: flex; flex-direction: row; justify-content: space-between; align-items:start;" class="mb-2">
                <div style="max-width: 350px;">
                  <p class="m-0"><strong>Public Container</strong></p>
                  <p class="m-0">Allow public container visibility. Only the owner will be able to modify container files, directories and details. Public users will be able to execute the project and view outputs.</p>
                </div>
                <v-switch
                  v-model="this.settingsDialog.public"
                  style="margin: 0 !important;"
                  color="#00A550"
                  hide-details
                  inset
                  @click="toggleIsPublic"
                ></v-switch>
              </div>
              <button class="env-action light mb-4" v-if="this.envInfo.public"><v-icon icon="mdi-link-variant" class="my-auto me-2"></v-icon> Copy Shareable Link</button>
              
            </div>
          </v-col>

        </v-row>
      </div>
    </v-dialog>
    <!-- END Settings Dialog -->

    <!-- BEGIN Create Directory Dialog -->
    <v-dialog
          v-model="createDirectoryDialog.show"
          max-width="500"
        >
      <div class="drive-dialog">
        <h2 class="mb-4" style="font-weight: 800; font-size: 25px; margin: 0; padding: 0;">Create Directory</h2>
        <input v-model="this.createDirectoryDialog.name" :class="{'global-input': true, 'error': (this.createDirectoryDialog.hasNameError || this.createDirectoryDialog.hasInvalidInput)}"  type="text" placeholder="Directory Name" @keyup.enter="createDirectory" />
        <p style="color: #e3242b;" class="mt-3" v-if="this.createDirectoryDialog.hasNameError"><v-icon icon="mdi-alert-circle-outline" class="my-auto"></v-icon> A sub-directory with that name already exists within this directory.</p>
        <p style="color: #e3242b;" class="mt-3" v-if="this.createDirectoryDialog.hasInvalidInput"><v-icon icon="mdi-alert-circle-outline" class="my-auto"></v-icon> Please enter a valid name for the directory.</p>
        <div class="global-dialog-action mt-3">
            <button class="global-dialog-action-cancel me-2" @click="this.createDirectoryDialog.show = false">Cancel</button>
            <button class="global-dialog-action-confirm" @click="createDirectory" :disabled="this.loading">
              <v-progress-circular width="2" indeterminate style="width: 20px; height: 20px;" class="mx-auto my-auto me-2" v-if="this.loading"></v-progress-circular>
              <v-icon icon="mdi-plus-circle-outline" class="my-auto me-2" v-if="!this.loading"></v-icon> Create Directory
            </button>
        </div>
      </div>
    </v-dialog>
    <!-- END Create Directory Dialog -->

    <!-- BEGIN Delete Directory Dialog -->
    <v-dialog
          v-model="deleteDirectoryDialog.show"
          max-width="500"
        >
        <div class="drive-dialog">
            <h2 class="mb-4" style="font-weight: 800; font-size: 25px; margin: 0; padding: 0;">Delete Directory</h2>
            <p class="m-0" style="font-size: 18px;">Are you sure you want to delete <strong>{{ this.deleteDirectoryDialog.toDelete.name }}</strong>? This action will recursively delete all files and sub-directories under this parent directory.</p>
            <p class="m-0 mt-2" style="font-size: 18px; color: #e3242b; font-weight: 600;">This action is permanent and cannot be undone.</p>
            <div class="global-dialog-action mt-3">
                <button class="global-dialog-action-cancel me-2" @click="this.deleteDirectoryDialog.show = false">Cancel</button>
                <button class="global-dialog-action-danger" @click="deleteDirectory()" :disabled="this.loading">
                  <v-progress-circular width="2" indeterminate style="width: 20px; height: 20px;" class="mx-auto my-auto me-2" v-if="this.loading"></v-progress-circular>
                  <v-icon icon="mdi-delete-empty-outline" class="my-auto me-2" v-if="!this.loading"></v-icon> Delete Directory
                </button>
            </div>
        </div>
    </v-dialog>
    <!-- END Delete Directory Dialog -->

    <!-- BEGIN Rename Directory Dialog -->
    <v-dialog
          v-model="renameDirectoryDialog.show"
          max-width="500"
        >
      <div class="drive-dialog">
        <h2 class="mb-2" style="font-weight: 800; font-size: 25px; margin: 0; padding: 0;">Rename Directory</h2>
        <p class="m-0" style="font-size: 18px;">Please enter a new name for <strong>{{ this.renameDirectoryDialog.toRename.name }}</strong> (<span style="font-family: monospace">{{ this.renameDirectoryDialog.toRename.folderId }}</span>)</p>
        <input v-model="this.renameDirectoryDialog.name" :class="{'global-input': true, 'error': (this.renameDirectoryDialog.hasNameError || this.renameDirectoryDialog.hasInvalidInput), 'mt-4': true}" type="text" placeholder="Directory Name" @keyup.enter="renameDirectory" />
        <p style="color: #e3242b;" class="mt-3" v-if="this.renameDirectoryDialog.hasNameError"><v-icon icon="mdi-alert-circle-outline" class="my-auto"></v-icon> A sub-directory with that name already exists within this directory.</p>
        <p style="color: #e3242b;" class="mt-3" v-if="this.renameDirectoryDialog.hasInvalidInput"><v-icon icon="mdi-alert-circle-outline" class="my-auto"></v-icon> Please enter a valid name for the directory.</p>
        <div class="global-dialog-action mt-3">
            <button class="global-dialog-action-cancel me-2" @click="this.renameDirectoryDialog.show = false">Cancel</button>
            <button class="global-dialog-action-confirm" @click="renameDirectory" :disabled="this.loading">
              <v-progress-circular width="2" indeterminate style="width: 20px; height: 20px;" class="mx-auto my-auto me-2" v-if="this.loading"></v-progress-circular>
              <v-icon icon="mdi-form-textbox" class="my-auto me-2" v-if="!this.loading"></v-icon> Rename Directory
            </button>
        </div>
      </div>
    </v-dialog>
    <!-- END Rename Directory Dialog -->

    <!-- BEGIN Create File Dialog -->
    <v-dialog
          v-model="createFileDialog.show"
          max-width="500"
        >
      <div class="drive-dialog">
        <h2 class="mb-4" style="font-weight: 800; font-size: 25px; margin: 0; padding: 0;">Create File</h2>
        <input v-model="this.createFileDialog.name" class="global-input" type="text" placeholder="File Name" @keyup.enter="createFile" />
        <p style="color: #e3242b;" class="mt-3" v-if="this.createFileDialog.hasNameError"><v-icon icon="mdi-alert-circle-outline" class="my-auto"></v-icon> A file with that name already exists within this directory.</p>
        <p style="color: #e3242b;" class="mt-3" v-if="this.createFileDialog.hasExtError"><v-icon icon="mdi-alert-circle-outline" class="my-auto"></v-icon> You can only save Java, Python or C (.c or .h) files.</p>
        <p style="color: #e3242b;" class="mt-3" v-if="this.createFileDialog.hasInvalidInput"><v-icon icon="mdi-alert-circle-outline" class="my-auto"></v-icon> Please enter a valid name for the file.</p>
        <div class="global-dialog-action mt-3">
            <button class="global-dialog-action-cancel me-2" @click="this.createFileDialog.show = false">Cancel</button>
            <button class="global-dialog-action-confirm" @click="createFile" :disabled="this.loading">
              <v-progress-circular width="2" indeterminate style="width: 20px; height: 20px;" class="mx-auto my-auto me-2" v-if="this.loading"></v-progress-circular>
              <v-icon icon="mdi-plus-circle-outline" class="my-auto me-2" v-if="!this.loading"></v-icon> Create File</button>
        </div>
      </div>
    </v-dialog>
    <!-- END Create File Dialog -->

    <!-- BEGIN Delete File Dialog -->
    <v-dialog
      v-model="deleteFileDialog.show"
      max-width="500"
    >
        <div class="drive-dialog">
            <h2 class="mb-4" style="font-weight: 800; font-size: 25px; margin: 0; padding: 0;">Delete File</h2>
            <p class="m-0" style="font-size: 18px;">Are you sure you want to delete <strong>{{ this.deleteFileDialog.toDelete.name }}</strong>?</p>
            <p class="m-0 mt-2" style="font-size: 18px; color: #e3242b; font-weight: 600;">This action is permanent and cannot be undone.</p>
            <div class="global-dialog-action mt-3">
                <button class="global-dialog-action-cancel me-2" @click="this.deleteFileDialog.show = false">Cancel</button>
                <button class="global-dialog-action-danger" @click="deleteFile()" :disabled="this.loading">
                  <v-progress-circular width="2" indeterminate style="width: 20px; height: 20px;" class="mx-auto my-auto me-2" v-if="this.loading"></v-progress-circular>
                  <v-icon icon="mdi-delete-empty-outline" class="my-auto me-2" v-if="!this.loading"></v-icon> Delete File
                </button>
            </div>
        </div>
    </v-dialog>
    <!-- END Delete File Dialog -->

    <!-- BEGIN Rename File Dialog -->
    <v-dialog
          v-model="renameFileDialog.show"
          max-width="500"
        >
      <div class="drive-dialog">
        <h2 class="mb-2" style="font-weight: 800; font-size: 25px; margin: 0; padding: 0;">Rename File</h2>
        <p class="m-0" style="font-size: 18px;">Please enter a new name for <strong>{{ this.renameFileDialog.toRename.name }}</strong> (<span style="font-family: monospace">{{ this.renameFileDialog.toRename.fileId }}</span>)</p>
        <input v-model="this.renameFileDialog.name" :class="{'global-input': true, 'error': (this.renameFileDialog.hasNameError || this.renameFileDialog.hasExtError || this.renameFileDialog.hasInvalidInput), 'mt-4': true}" type="text" placeholder="File Name" @keyup.enter="renameFile" />
        <p style="color: #e3242b;" class="mt-3" v-if="this.renameFileDialog.hasNameError"><v-icon icon="mdi-alert-circle-outline" class="my-auto"></v-icon> A file with that name already exists within this directory.</p>
        <p style="color: #e3242b;" class="mt-3" v-if="this.renameFileDialog.hasExtError"><v-icon icon="mdi-alert-circle-outline" class="my-auto"></v-icon> You can only save Java, Python or C (.c or .h) files.</p>
        <p style="color: #e3242b;" class="mt-3" v-if="this.renameFileDialog.hasInvalidInput"><v-icon icon="mdi-alert-circle-outline" class="my-auto"></v-icon> Please enter a valid name for the file.</p>
        <div class="global-dialog-action mt-3">
            <button class="global-dialog-action-cancel me-2" @click="this.renameFileDialog.show = false">Cancel</button>
            <button class="global-dialog-action-confirm" @click="renameFile" :disabled="this.loading">
              <v-progress-circular width="2" indeterminate style="width: 20px; height: 20px;" class="mx-auto my-auto me-2" v-if="this.loading"></v-progress-circular>
              <v-icon icon="mdi-form-textbox" class="my-auto me-2" v-if="!this.loading"></v-icon> Rename File
            </button>
        </div>
      </div>
    </v-dialog>
    <!-- END Rename File Dialog -->
  
    <!-- BEGIN Error Message Dialog -->
    <v-dialog
      v-model="errorDialog.show"
      max-width="500"
    >
        <div class="drive-dialog">
            <h2 class="mb-4" style="font-weight: 800; font-size: 25px; margin: 0; padding: 0; color: #e3242b;">Uh oh...</h2>
            <p class="m-0" style="font-size: 18px;">{{ this.errorDialog.message }}</p>
            <div class="global-dialog-action mt-4">
                <button class="global-dialog-action-cancel" @click="this.errorDialog.show = false">Acknowledge</button>
            </div>
        </div>
    </v-dialog>
    <!-- END Error Message Dialog -->

    <!-- BEGIN Progress Indicator -->
    <v-progress-linear color="#379af5" height="3" :indeterminate="this.loading || this.pageLoading"></v-progress-linear>
    <!-- END Progress Indicator -->

    <!-- BEGIN Status Overlay -->
    <div style="width: 100vw; height: 100vh; display: flex; justify-content: center; align-items: center;" v-if="[null, 401, 404, 500].includes(this.envInfo) || this.pageLoading">
      <div style="text-align: center;" v-if="this.envInfo == null || this.pageLoading">
        <v-progress-circular color="#379af5" :size="35" indeterminate></v-progress-circular>
        <p style="font-weight: 500; font-size: 20px;" class="mt-3 m-0">Loading container...</p>
      </div>
      <div style="text-align: center;" v-if="this.envInfo == 401">
        <v-icon style="color: #320064; font-size: 55px;" icon="mdi-wizard-hat"></v-icon>
        <p style="font-weight: 800; font-size: 25px;" class="mt-3 m-0">You shall not pass!</p>
        <p style="font-weight: 400; font-size: 20px;" class="m-0">You don't have access to that container.</p>
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
    <div class="env-bar" v-if="![null, 401, 404, 500].includes(this.envInfo) && !this.pageLoading">
      <!-- BEGIN Logo -->
      <img src="../assets/images/cloudcontain.svg" width="150" class="my-auto" @click="this.home()" />
      <!-- END Logo -->
      <!-- BEGIN Environment Details -->
      <div style="display: flex; flex-direction: row;" class="my-auto">
        <div class="env-name" @click="openSettingsDialog()">
          <h4 class="my-auto" style="margin: 0; font-weight: 400; outline: none; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 200px; font-size: 15px">{{ this.envInfo.name }}</h4>
          <v-icon icon="mdi-chevron-down" class="ms-1 my-auto" style="color: #bfbfbf" v-if="this.envInfo.owner == this.user.sub"></v-icon>
        </div>
        <v-tooltip text="Execute Container" location="bottom">
          <template v-slot:activator="{ props }">
            <button class="env-execute-small ms-2 my-auto" v-bind="props" :disabled="this.loading || this.hasActiveJob()" @click="this.execute()">
              <v-icon class="mx-auto my-auto" icon="mdi-play-speed" style="font-size: 24px; margin: 0; padding: 0;" v-if="!this.hasActiveJob()"></v-icon>
              <v-progress-circular color="#00A550" width="2" indeterminate style="width: 20px; height: 20px;" class="mx-auto my-auto" v-if="this.hasActiveJob()"></v-progress-circular>
            </button>
          </template>
        </v-tooltip>
      </div>
      <!-- END Environment Details -->
      <!-- BEGIN Controls / Account -->
      <div style="display: flex; flex-direction: row;" class="my-auto">
        <button class="env-action" @click="this.settingsDialog.tab = 1; this.settingsDialog.show = true;" v-if="this.envInfo.owner == this.user.sub"><v-icon icon="mdi-account-group-outline" class="my-auto me-2"></v-icon> Share</button>
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
      <!-- END Controls / Account -->
    </div>
    <!-- END Nav Bar -->

    <!-- BEGIN Environment Content -->
    <div class="env-content" v-if="![null, 401, 404, 500].includes(this.envInfo) && !this.pageLoading">

      <!-- BEGIN Editor -->
      <div class="env-editor" id="editor">

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
              <div class="env-menu-option" @click="this.sidebarTab = 1; openCreateFileDialog()" v-if="this.envInfo.owner == this.user.sub">
                Create new file
                <v-icon icon="mdi-file-plus-outline" class="my-auto" style="color: #bfbfbf; font-size: 18px;"></v-icon>
              </div>
              <div class="env-menu-option" @click="this.sidebarTab = 1;">
                Open existing file
                <v-icon icon="mdi-folder-file-outline" class="my-auto" style="color: #bfbfbf; font-size: 18px;"></v-icon>
              </div>
              <hr class="my-2" color="#d3d3d3">
              <div class="env-menu-option red" @click="this.closeAllTabs()">
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
          <div class="env-editor-pad" :id="`env-editor-pad-${tab.fileId}`" v-show="this.activeTab.fileId == tab.fileId"></div>
        </template>
        <!-- END Code Pad-->

        <!-- BEGIN Empty Display -->
        <div class="env-editor-empty" v-if="this.tabs.length == 0">
          <div style="text-align: center;">
            <v-icon style="color: #bfbfbf; font-size: 55px;" icon="mdi-atom-variant"></v-icon>
            <p style="font-weight: 800; font-size: 25px;" class="mt-3 m-0">No file selected</p>
            <p style="font-weight: 400; font-size: 20px;" class="m-0 mb-5">Open or create a file to get started</p>
            <div style="display: flex; justify-content: center;">
              <button class="env-action light me-2" @click="this.sidebarTab = 1"><v-icon icon="mdi-folder-file-outline" class="my-auto me-2"></v-icon> Open File</button>
              <button class="env-action light me-2" @click="this.sidebarTab = 1; openCreateFileDialog()" v-if="this.envInfo.owner == this.user.sub"><v-icon icon="mdi-file-plus-outline" class="my-auto me-2"></v-icon> Create File</button>
            </div>
          </div>
        </div>
        <!-- END Empty Display -->

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
                <input class="env-sidebar-content-files-searchbar" placeholder="Search all files" v-model="this.search.query" @keyup.enter="searchFiles" />
                <v-tooltip text="Create File" location="bottom">
                  <template v-slot:activator="{ props }">
                    <button @click="openCreateFileDialog()" :disabled="this.search.results != null || this.envInfo.owner != this.user.sub" class="env-sidebar-content-files-create ms-2 my-auto" v-bind="props"><v-icon class="my-auto mx-auto" icon="mdi-file-plus" style="font-size: 24px; margin: 0; padding: 0;"></v-icon></button>
                  </template>
                </v-tooltip>
                <v-tooltip text="Create Directory" location="bottom">
                  <template v-slot:activator="{ props }">
                    <button @click="openCreateDirectoryDialog()" :disabled="this.search.results != null || this.envInfo.owner != this.user.sub" class="env-sidebar-content-files-create ms-2 my-auto" v-bind="props"><v-icon class="my-auto mx-auto" icon="mdi-folder-plus" style="font-size: 24px; margin: 0; padding: 0;"></v-icon></button>
                  </template>
                </v-tooltip>
              </div>

              <div class="env-sidebar-content-files-path mt-2" v-bind="props" @click="copyPath()" v-if="this.search.results == null">
                <v-icon class="my-auto" icon="mdi-server-outline" @click="openFolder('~', $event)"></v-icon> 

                <template v-for="folder in this.currentDirectory.path" v-if="this.currentDirectory.path.length > 0">
                  <v-icon class="my-auto" icon="mdi-menu-right" style="color: #bfbfbf;"></v-icon> 
                  <span class="env-editor-source-trail-item sidebar my-auto" @click="openFolder(folder.folderId, $event)">{{ folder.name }}</span> 
                </template>

                <v-icon class="my-auto" icon="mdi-menu-right" style="color: #bfbfbf;" v-if="this.currentDirectory.path.length == 0"></v-icon> 
                <span style="color: #bfbfbf" class="env-editor-source-trail-item home sidebar my-auto" v-if="this.currentDirectory.path.length == 0">(this container)</span> 
              </div>
            </div>
            <!-- END Sticky Header -->
            
            <!-- BEGIN Explorer -->
            <div class="pa-3 pt-0" v-if="this.search.results == null">
              <p style="color: #bfbfbf; margin: 0; font-weight: 700;">Directories</p>

              <v-row class="mb-2">
                <template v-for="folder in this.currentDirectory.directories">
                  <v-col cols="4">
                    <div class="env-sidebar-content-files-directory-wrapper" 
                        @click="openFolder(folder.folderId, $event)" 
                        :draggable="folder.parent != null && this.envInfo.owner == this.user.sub"
                        @dragstart="onDragFolderStart(folder)"
                        @dragend="onDragFolderEnd"
                        @dragover.prevent="onDragOver(folder.folderId, $event)"
                        @dragleave="onDragLeave"
                        @drop="onDrop(folder.folderId, $event)">
                      <div class="env-sidebar-content-files-directory">
                        <v-icon id="folder-icon" icon="mdi-folder-outline" style="font-size: 60px; color: #379af5"></v-icon> 
                      </div>
                      <p style="margin: 0; padding: 0; font-size: 15px;">
                        {{ folder.name }}
                        <v-menu transition="slide-y-transition" v-if="folder.parent != null && this.envInfo.owner == this.user.sub">
                            <template v-slot:activator="{ props }">
                                <v-icon style="font-size: 18px; color: #bfbfbf;" class="my-auto" icon="mdi-dots-vertical" v-bind="props" @click="openOptions"></v-icon>
                            </template>
                            <div class="env-tab-menu mt-1">
                                <div class="env-menu-option" @click="openRenameDirectoryDialog(folder)">
                                    Rename directory
                                    <v-icon icon="mdi-form-textbox" class="my-auto" style="color: #bfbfbf; font-size: 22px;"></v-icon>
                                </div>
                                <hr class="my-2" color="#d3d3d3">
                                <div class="env-menu-option red" @click="openDeleteDirectoryDialog(folder)">
                                    Delete directory
                                    <v-icon icon="mdi-delete-outline" class="my-auto before-icon" style="font-size: 22px;"></v-icon>
                                    <v-icon icon="mdi-delete-empty-outline" class="my-auto after-icon" style="font-size: 22px;"></v-icon>
                                </div>
                                <hr class="my-2" color="#d3d3d3">
                                <p style="margin: 10px 0px; padding: 0px 20px; font-size: 10px; text-align: center; color: #bfbfbf;">Directory ID &mdash; {{ folder.folderId }}</p>
                            </div>
                        </v-menu>
                      </p>
                      <p style="margin: 0; padding: 0; font-size: 12px; color: #bfbfbf; font-weight: 800;" v-if="folder.parent != null">{{ this.formatBytes(folder.size) }}</p>
                    </div>
                  </v-col>
                </template>
              </v-row>

              <div style="display: flex; justify-content: center;" v-if="this.currentDirectory.directories.length == 0">
                <p class="my-5" style="color: #bfbfbf;">No sub-directories exist in this directory.</p>
              </div>

              <p style="color: #bfbfbf; margin: 0; font-weight: 700;">Files</p>

              <template v-for="file in this.currentDirectory.files">
                <div class="env-sidebar-content-files-file mt-2" 
                    @click="(!this.loading) ? openFile(file.fileId) : null" 
                    :draggable="this.envInfo.owner != this.user.sub"
                    @dragstart="onDragFileStart(file)"
                    @dragend="onDragFileEnd">
                  <div style="display: flex; flex-direction: row; justify-content: flex-start;">
                    <v-icon class="my-auto me-2" :icon="(this.envInfo.entryPoint == file.fileId) ? 'mdi-location-enter' : 'mdi-cube-outline'" style="color: #379af5;"></v-icon>
                    <p class="my-auto" style="font-size: 15px;">{{ file.name }} <span v-if="this.envInfo.entryPoint == file.fileId" style="color: #379af5;" class="ms-1">(Entry Point)</span></p>
                  </div>
                  <p class="my-auto" style="color: #bfbfbf; font-size: 13px;">
                    {{ this.moment(file.lastModified).format("MMM Do [at] h:mma") }} 
                    <v-menu transition="slide-y-transition">
                        <template v-slot:activator="{ props }">
                            <v-icon class="env-sidebar-content-files-file-options my-auto" icon="mdi-dots-vertical" v-bind="props" @click="openOptions"></v-icon>
                        </template>
                        <div class="env-tab-menu mt-1">
                            <div style="margin: 10px; padding: 5px 0px; border: 2px solid #d3d3d3; border-radius: 5px; text-align: center; font-family: monospace; background: rgba(211, 211, 211, 0.2);">
                              <strong>{{ file.name }}</strong>
                              <p style="margin: 0; font-family: 'DM Sans'">{{ getFileType(file.name) }} File &mdash; {{ this.formatBytes(file.size) }}</p>
                            </div>
                            <div class="env-menu-option" @click="openRenameFileDialog(file)" v-if="this.envInfo.owner == this.user.sub">
                                Rename file
                                <v-icon icon="mdi-form-textbox" class="my-auto" style="color: #bfbfbf; font-size: 22px;"></v-icon>
                            </div>
                            <div class="env-menu-option" @click="copyFilePath(file)">
                                Copy file path
                                <v-icon icon="mdi-content-copy" class="my-auto" style="color: #bfbfbf; font-size: 22px;"></v-icon>
                            </div>
                            <div class="env-menu-option" @click="setEntryPoint(file.fileId)" v-if="this.envInfo.entryPoint != file.fileId && this.envInfo.owner == this.user.sub">
                                Set as Entry Point
                                <v-icon icon="mdi-location-enter" class="my-auto" style="color: #bfbfbf; font-size: 22px;"></v-icon>
                            </div>
                            <hr class="my-2" color="#d3d3d3" v-if="this.envInfo.owner == this.user.sub">
                            <div class="env-menu-option red" @click="openDeleteFileDialog(file)" v-if="this.envInfo.entryPoint != file.fileId && this.envInfo.owner == this.user.sub">
                                Delete file 
                                <v-icon icon="mdi-delete-outline" class="my-auto before-icon" style="font-size: 22px;"></v-icon>
                                <v-icon icon="mdi-delete-empty-outline" class="my-auto after-icon" style="font-size: 22px;"></v-icon>
                            </div>
                            <p style="color: rgba(227, 36, 42, 0.6); margin: 10px 0px; padding: 5px 20px;" v-if="this.envInfo.entryPoint == file.fileId"><v-icon icon="mdi-alert-circle-outline" class="my-auto"></v-icon> Cannot delete Entry Point</p>
                            <hr class="my-2" color="#d3d3d3">
                            <p style="margin: 10px 0px; padding: 0px 20px; font-size: 10px; text-align: center; color: #bfbfbf;">File ID &mdash; {{ file.fileId }}</p>
                        </div>
                    </v-menu>
                  </p>
                </div>
              </template>

              <div style="display: flex; justify-content: center;" v-if="this.currentDirectory.files.length == 0">
                <p class="my-5" style="color: #bfbfbf;">No files exist in this directory.</p>
              </div>

              <div class="mt-5" style="display: flex; justify-content: center;">
                <p style="color: #bfbfbf; border: 1px solid #d3d3d3; border-radius: 5px; padding: 5px 15px; width: auto;">Total {{ (this.currentDirectory.folderId == "~") ? "container" : "directory" }} size &mdash; <strong>{{ this.formatBytes(this.currentDirectory.size) }}</strong></p>
              </div>
            </div>
            <!-- END Explorer -->

            <!-- BEGIN Search Results -->
            <div class="pa-3 pt-0" v-if="this.search.results != null">
              
              <div style="display: flex; justify-content: space-between;">
                <a @click="this.search.results = null; this.search.query = null" class="m-0 p-0 my-auto" style="text-decoration: none; cursor: pointer;"><v-icon icon="mdi-chevron-left" class="m-0"></v-icon> Back to File Explorer</a>
                <p class="m-0 p-0 my-auto">Found <strong>{{ this.search.results.total }}</strong> {{ (this.search.results.total > 1 || this.search.results.total == 0) ? "results" : "result" }}</p>
              </div>

              <p class="mt-3" style="color: #bfbfbf; margin: 0; font-weight: 700;">Files</p>

              <template v-for="file in this.search.results.files" v-if="this.search.results.files.length > 0">
                <div class="env-sidebar-content-files-file mt-2" 
                    @click="(!this.loading) ? openFile(file.fileId) : null">
                  <div style="display: flex; flex-direction: row; justify-content: flex-start;">
                    <v-icon class="my-auto me-2" :icon="(this.envInfo.entryPoint == file.fileId) ? 'mdi-location-enter' : 'mdi-cube-outline'" style="color: #379af5;"></v-icon>
                    <div class="my-auto">
                      <p class="m-0" style="font-size: 15px;">{{ file.name }} <span v-if="this.envInfo.entryPoint == file.fileId" style="color: #379af5;" class="ms-1">(Entry Point)</span></p>
                      <p class="m-0" style="font-size: 12px; overflow: hidden; max-width: 250px; text-overflow: ellipsis; white-space: no-wrap; display: block; color: #379af5; direction: rtl; text-align: left;">{{ file.key.substring(33) }}/</p>
                    </div>
                  </div>
                  <p class="my-auto" style="color: #bfbfbf; font-size: 13px;">
                    <v-menu transition="slide-y-transition">
                        <template v-slot:activator="{ props }">
                            <v-icon class="env-sidebar-content-files-file-options my-auto" icon="mdi-dots-vertical" v-bind="props" @click="openOptions"></v-icon>
                        </template>
                        <div class="env-tab-menu mt-1">
                            <div style="margin: 10px; padding: 5px 0px; border: 2px solid #d3d3d3; border-radius: 5px; text-align: center; font-family: monospace; background: rgba(211, 211, 211, 0.2);">
                              <strong>{{ file.name }}</strong>
                              <p style="margin: 0; font-family: 'DM Sans'">{{ getFileType(file.name) }} File &mdash; {{ this.formatBytes(file.size) }}</p>
                            </div>
                            <div class="env-menu-option" @click="openRenameFileDialog(file)" v-if="this.envInfo.owner == this.user.sub">
                                Rename file
                                <v-icon icon="mdi-form-textbox" class="my-auto" style="color: #bfbfbf; font-size: 22px;"></v-icon>
                            </div>
                            <div class="env-menu-option" @click="copyFilePath(file)">
                                Copy file path
                                <v-icon icon="mdi-content-copy" class="my-auto" style="color: #bfbfbf; font-size: 22px;"></v-icon>
                            </div>
                            <div class="env-menu-option" @click="setEntryPoint(file.fileId)" v-if="this.envInfo.entryPoint != file.fileId && this.envInfo.owner == this.user.sub">
                                Set as Entry Point
                                <v-icon icon="mdi-location-enter" class="my-auto" style="color: #bfbfbf; font-size: 22px;"></v-icon>
                            </div>
                            <hr class="my-2" color="#d3d3d3" v-if="this.envInfo.owner == this.user.sub">
                            <div class="env-menu-option red" @click="openDeleteFileDialog(file)" v-if="this.envInfo.entryPoint != file.fileId && this.envInfo.owner == this.user.sub">
                                Delete file 
                                <v-icon icon="mdi-delete-outline" class="my-auto before-icon" style="font-size: 22px;"></v-icon>
                                <v-icon icon="mdi-delete-empty-outline" class="my-auto after-icon" style="font-size: 22px;"></v-icon>
                            </div>
                            <p style="color: rgba(227, 36, 42, 0.6); margin: 10px 0px; padding: 5px 20px;" v-if="this.envInfo.entryPoint == file.fileId"><v-icon icon="mdi-alert-circle-outline" class="my-auto"></v-icon> Cannot delete Entry Point</p>
                            <hr class="my-2" color="#d3d3d3">
                            <p style="margin: 10px 0px; padding: 0px 20px; font-size: 10px; text-align: center; color: #bfbfbf;">File ID &mdash; {{ file.fileId }}</p>
                        </div>
                    </v-menu>
                  </p>
                </div>
              </template>

              <center><button class="env-load-more mt-4" :disabled="this.loading" @click="this.loadMoreSearch()" v-if="this.search.results.hasMore">Load More</button></center>

              <div style="display: flex; justify-content: center;" v-if="this.search.results.files.length == 0">
                <p class="my-5" style="color: #bfbfbf;">No results found for the given query.</p>
              </div>
            </div>
            <!-- END Search Results -->

          </div>
          <!-- END File Manager Content -->

          <!-- BEGIN Console Content -->
          <div class="env-sidebar-content-console pa-3" v-if="this.sidebarTab == 0">

            <!-- BEGIN Execution Button -->
            <button class="env-execute mb-3" :disabled="this.loading || this.hasActiveJob()" @click="this.execute()">
              <v-icon icon="mdi-play-speed" class="my-auto me-2"></v-icon> Execute Container
            </button>   
            <!-- END Execution Button -->
            
            <!-- BEGIN No History Alert -->
            <p v-if="this.jobs.length == 0">The output history of this container will appear here when you execute your project.</p> 
            <!-- END No History Alert -->

            <!-- BEGIN Jobs List -->
            <template v-for="job in this.jobs">

              <!-- BEGIN Individual Job -->
              <div class="env-sidebar-job mb-2 pa-2">

                <!-- BEGIN Job Progress Indicator -->
                <v-progress-linear :class="{'node': (['STARTING_NODE', 'NODE_STARTED'].includes(job.status)), 'pending':(job.status == 'PENDING'), 'success': (['STARTED', 'CLONING', 'CONTAINERIZING', 'RUNNING', 'CLEANING'].includes(job.status)), 'completed': (job.status == 'COMPLETED'), 'failed': (job.status == 'FAILED' || job.status == 'BUILD_FAILED')}" height="3" class="mb-2" :indeterminate="!['COMPLETED', 'FAILED', 'BUILD_FAILED'].includes(job.status)" style="border-radius: 5px;"></v-progress-linear>
                <!-- END Job Progress Indicator -->

                <!-- BEGIN Job Header -->
                <div class="mb-2" style="display: flex; width: 100%; padding: 5px 10px; justify-content: space-between; background: rgba(191, 191, 191, 0.25); border-radius: 5px;">
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
                <!-- END Job Header -->

                <!-- BEGIN Output Container -->
                <div style="width: 100%; background: rgba(191, 191, 191, 0.25); border-radius: 5px; padding: 5px 10px;">
                  
                  <!-- BEGIN Output Toggle -->
                  <div style="display: flex; justify-content: space-between; cursor: pointer;" @click="this.toggleOutput(job)">
                    <p class="my-auto" style="margin: 0; padding: 0; font-size: 14px;">Output</p>
                    <v-icon :icon="(job.showOutput) ? 'mdi-chevron-up' : 'mdi-chevron-down'" class="my-auto"></v-icon>
                  </div>
                  <!-- END Output Toggle -->

                  <template v-if="job.showOutput">
                    <!-- BEGIN Waiting Overlay -->
                    <!-- Show waiting message while job is in STARTING_NODE, NODE_STARTED, PENDING, STARTED, CLONING -->
                    <div v-if="!['CONTAINERIZING', 'RUNNING', 'CLEANING', 'COMPLETED', 'FAILED', 'BUILD_FAILED'].includes(job.status)" style="width: 100%; height: 200px; display: flex; justify-content: center; align-items: center; color: #999999;">
                      Waiting for run to begin
                    </div>
                    <!-- END Waiting Overlay -->

                    <!-- BEGIN Output Content -->
                    <div v-if="['CONTAINERIZING', 'RUNNING', 'CLEANING', 'COMPLETED', 'FAILED', 'BUILD_FAILED'].includes(job.status)" style="width: 100%; min-height: 200px; max-height: 500px !important; overflow-y: scroll !important;" :id="`job-output-${job.jobId}`">
                      <!-- TODO: Add 'Load More' button. Only display if job is finished (in COMPLETED, FAILED, BUILD_FAILED) -->
                      <!-- BEGIN Output Loading Overlay -->
                      <div v-if="job.output.length == 0 || job.loading" style="width: 100%; height: 200px; display: flex; justify-content: center; align-items: center; color: #999999;">
                        <v-progress-circular indeterminate></v-progress-circular>
                      </div>
                      <!-- END Output Loading Overlay -->
                      <!-- BEGIN Load More -->
                      <div class="my-2" v-if="(job.output.length < job.logCount) && !job.loading & (['COMPLETED', 'FAILED', 'BUILD_FAILED'].includes(job.status))" style="width: 100%; height: 100px; display: flex; justify-content: center; flex-direction: column; align-items: center; border: 2px solid #d3d3d3; border-radius: 5px;">
                        <p class="m-0 mb-2">...{{ job.logCount - job.output.length }} more lines available</p>
                        <button class="env-load-more" :disabled="job.loading" @click="this.loadMoreLogs(job)">Load More</button>
                      </div>
                      <!-- END Load More -->
                      <!-- BEGIN Output Lines -->
                      <template v-for="output in job.output" v-if="!job.loading">
                        <div class="env-sidebar-job-output">
                          <div :class="{'me-3': true, 'output-timestamp': true, 'err': (output.level == 'stderr')}">{{ this.moment(output.timestamp).format("h:mm:ss a") }}</div>
                          <p :class="{'my-auto': true, 'build-output': (output.level == 'build'), 'err-output': (output.level == 'stderr')}" style="margin: 0; font-size: 14px; font-family: monospace;">{{ output.content }}</p>
                        </div>
                      </template>
                      <!-- END Output Lines -->
                    </div>
                    <!-- END Output Content -->
                  </template>

                </div>
                <!-- END Output Container -->
                
                <!-- BEGIN Cold Start Alert -->
                <div class="mt-2" style="background: rgba(55, 154, 245, 0.2); color: #379af5; border: 1px solid #379af5; border-radius: 5px; padding: 5px 10px; font-size: 16px;" v-if="job.status == 'STARTING_NODE'">
                  <div style="display: flex; justify-content: start; font-weight: 800;"><v-icon class="my-auto me-1" icon="mdi-alert-circle-outline"></v-icon> <p class="m-0 my-auto" style="font-size: 17px;">Heads up</p></div> 
                  Job execution servers are provisioned on demand. Cold starts may take up to 2 minutes to begin, but subsequent executions will run significantly faster. We appreciate your patience.
                </div>
                <!-- END Cold Start Alert -->

              </div>
              <!-- END Individual Job -->

            </template>
            <!-- END Jobs List -->

            <!-- BEGIN Sidebar Footer -->
            <div class="env-sidebar-footer">
                <img src="../assets/images/cloudcontain-gray.svg" width="100" style="margin: 0; padding: 0;" />
                <p style="color: #d3d3d3; margin: 0; padding: 0; font-size: 14px;">&copy; {{ new Date().getFullYear() }} cloudcontain.net by <strong>Theo Nakfoor</strong></p> 
                <a href="/terms" style="font-size: 12px;">Privacy Policy</a> <a href="/terms" style="font-size: 12px;">Terms of Service</a>
            </div>
            <!-- END Sidebar Footer -->

          </div>
          <!-- END Console Content -->

        </div>
        <!-- END Sidebar Tab Content -->

      </div>
      <!-- END Sidebar Controls -->

    </div>
    <!-- END Environment Content -->

</template>

<script>
import * as monaco from 'monaco-editor';
import { useAuth0 } from '@auth0/auth0-vue';
import moment from "moment";

export default {
  data() {
    const { logout, user, isAuthenticated } = useAuth0();
    return {
      loading: false,
      pageLoading: true,
      envInfo: null,
      sidebarTab: 0,
      currentDirectory: null,
      draggedFile: null,
      draggedFolder: null,
      search: {
        query: null,
        results: null,
      },
      settingsDialog: {
        show: false,
        tab: 0,
      },
      createDirectoryDialog: {
        show: false,
        hasNameError: false,
        hasInvalidInput: false,
        name: null
      },
      createFileDialog: {
        show: false,
        hasNameError: false,
        hasExtError: false,
        hasInvalidInput: false,
        name: null
      },
      renameFileDialog: {
        show: false,
        hasNameError: false,
        hasExtError: false,
        hasInvalidInput: false,
        name: null,
        toRename: null
      },
      renameDirectoryDialog: {
        show: false,
        hasNameError: false,
        hasInvalidInput: false,
        name: null,
        toRename: null
      },
      deleteFileDialog: {
        show: false,
        toDelete: null
      },
      deleteDirectoryDialog: {
        show: false,
        toDelete: null
      },
      errorDialog: {
        show: false,
        message: null
      },
      tabs: [],
      activeTab: null,
      jobs: [],
      fileTypeMap: {
        "java": "java",
        "py": "python",
        "c": "c"
      },
      logout: () => {
          logout();
      },
      user,
      isAuthenticated
    }
  },
  async mounted() {
    Pusher.logToConsole = true;
    this.envInfo = await this.$store.dispatch('container/getContainer', {
        containerId: this.$route.params.containerId,
        accessToken: await this.$auth0.getAccessTokenSilently()
    });
    if(![null, 401, 404, 500].includes(this.envInfo)) {
      await this.loadJobs();
      await this.loadDirectory("~");
      this.initPusherConnection();
      this.settingsDialog.name = this.envInfo.name;
      this.settingsDialog.description = this.envInfo.description;
      this.settingsDialog.public = this.envInfo.public;
    }
    this.pageLoading = false;
  },
  methods: {
    openTab(fileId) {
      this.activeTab = this.tabs.find(tab => tab.fileId == fileId);;
    },
    closeAllTabs() {
      this.tabs = [];
    },  
    showErrorDialog(message) {
      this.errorDialog.message = message;
      this.errorDialog.show = true;
    },
    openCreateDirectoryDialog() {
      if(this.envInfo.owner == this.user.sub) {
        this.createDirectoryDialog.name = null;
        this.createDirectoryDialog.show = true;
        this.createDirectoryDialog.hasNameError = false;
        this.createDirectoryDialog.hasInvalidInput = false;
      }
    },
    openCreateFileDialog() {
      if(this.envInfo.owner == this.user.sub) {
        this.createFileDialog.name = null;
        this.createFileDialog.show = true;
        this.createFileDialog.hasExtError = false;
        this.createFileDialog.hasNameError = false;
        this.createFileDialog.hasInvalidInput = false;
      }
    },
    openSettingsDialog() {
      if(this.envInfo.owner == this.user.sub) {
        this.settingsDialog.tab = 0; 
        this.settingsDialog.show = true;
      }
    },
    closeTab(fileId, event = null) {
      if(event != null) { event.stopPropagation(); }
      let idx = this.tabs.findIndex(openTab => openTab.fileId == fileId);
      this.tabs.splice(idx, 1);
      if(this.activeTab.fileId == fileId) {
        this.activeTab = this.tabs.length > 0 ? this.tabs[0] : null;
      }
    },
    onDragFileStart(file) {
      this.draggedFile = file;
    },
    onDragFileEnd() {
      this.draggedFile = null;
    },
    onDragFolderStart(folder) {
      this.draggedFolder = folder;
    },
    onDragFolderEnd() {
      this.draggedFolder = null;
    },
    onDragOver(folderId, event) {
      if(this.draggedFile != null || (this.draggedFolder != null && this.draggedFolder.folderId != folderId)) {
        event.currentTarget.classList.add('hovered');
        event.currentTarget.querySelector("#folder-icon").classList.remove('mdi-folder-outline');
        event.currentTarget.querySelector("#folder-icon").classList.add('mdi-folder-open-outline');
      }
    },
    onDragLeave(event) {
      event.currentTarget.classList.remove('hovered');
      event.currentTarget.querySelector("#folder-icon").classList.remove('mdi-folder-open-outline');
      event.currentTarget.querySelector("#folder-icon").classList.add('mdi-folder-outline');
    },
    async onDrop(targetId, event) {
      event.currentTarget.classList.remove('hovered');
      event.currentTarget.querySelector("#folder-icon").classList.remove('mdi-folder-open-outline');
      event.currentTarget.querySelector("#folder-icon").classList.add('mdi-folder-outline');
      if(this.draggedFile != null) {
        this.loading = true;
        let fileId = this.draggedFile.fileId;
        let response = await this.$store.dispatch('file/updateFile', {
            containerId: this.$route.params.containerId,
            fileId: fileId,
            updates: {
                folder: targetId
            },
            accessToken: await this.$auth0.getAccessTokenSilently()
        });
        if(response.status == 200) {
          let tab = this.tabs.find(tab => tab.fileId == fileId);
          if(tab != null) 
            Object.assign(tab, response.data);
          await this.loadDirectory(this.currentDirectory.folderId);
          this.reloadDirectorySize();
        } else if(response.status == 409) {
          this.showErrorDialog("A file with the same name already exists in that directory.");
        }
        this.loading = false;
        this.draggedFile = null;
      } else if(this.draggedFolder != null && this.draggedFolder.folderId != targetId) {
        this.loading = true;
        let folderId = this.draggedFolder.folderId;
        let response = await this.$store.dispatch('folder/updateFolder', {
            containerId: this.$route.params.containerId,
            folderId: folderId,
            updates: {
                parent: targetId
            },
            accessToken: await this.$auth0.getAccessTokenSilently()
        });
        if(response.status == 200) {
          await this.loadDirectory(this.currentDirectory.folderId);
          const tabs = this.tabs.filter(tab => tab.path.some(path => path.folderId == folderId));
          tabs.forEach(tab => {
            const idx = tab.path.findIndex(path => path.folderId == folderId) + 1;
            tab.path.splice(0, idx);
            tab.path.splice(0, 0, ...response.data.path);
            console.log(tab.path);
          }); 
        } else if(response.status == 409) {
          this.showErrorDialog("A directory with the same name already exists in that directory.");
        }
        this.loading = false;
        this.draggedFolder = null;
      } 
    },
    async searchFiles() {
      if(this.search.query != null && this.search.query.trim() != "") {
        this.loading = true;
        let response = await this.$store.dispatch('file/searchFiles', {
            query: this.search.query,
            containerId: this.$route.params.containerId,
            offset: 0,
            accessToken: await this.$auth0.getAccessTokenSilently()
        });
        if(response.status == 200)
          this.search.results = response.data;
        else
          this.showErrorDialog("An unknown error occured while searching files. Please try again later.");
        this.loading = false;
      } else {
        this.search.results = null;
      }
    },
    async loadJobs() {
      this.loading = true;
      let jobs = await this.$store.dispatch('job/listJobs', {
          containerId: this.$route.params.containerId,
          accessToken: await this.$auth0.getAccessTokenSilently()
      });
      jobs.forEach((job) => {
        job.timeoutId = null;
        job.showOutput = false;
        job.loading = false;
        this.jobs.push(job);
      });
      this.loading = false;
    },
    async loadDirectory(folderId) {
      this.loading = true;
      this.currentDirectory = await this.$store.dispatch('folder/getFolder', {
          folderId: folderId,
          containerId: this.$route.params.containerId,
          accessToken: await this.$auth0.getAccessTokenSilently()
      });
      if(folderId != "~") {
        this.currentDirectory.directories.unshift({
          containerId: this.$route.params.containerId,
          created: null,
          folderId: this.currentDirectory.parent,
          lastModified: null,
          name: "..",
          parent: null,
          size: 0
        });
      }
      this.loading = false;
    },
    async openFolder(folderId, event = null) {
      if(event != null) { event.stopPropagation(); }
      await this.loadDirectory(folderId);
    },
    async createDirectory() {
      this.loading = true;
      this.createDirectoryDialog.hasNameError = false;
      this.createDirectoryDialog.hasInvalidInput = false;
      if(this.createDirectoryDialog.name != null && this.createDirectoryDialog.name.trim() != "") {
        let response = await this.$store.dispatch('folder/createFolder', {
            name: this.createDirectoryDialog.name,
            folderId: this.currentDirectory.folderId,
            containerId: this.$route.params.containerId,
            accessToken: await this.$auth0.getAccessTokenSilently()
        });
        if(response.status == 201) {
          await this.loadDirectory(this.currentDirectory.folderId);
          this.createDirectoryDialog.show = false;
        } else if(response.status == 409) {
          this.createDirectoryDialog.hasNameError = true;
        } else if(response.status == 400) {
          this.createDirectoryDialog.hasInvalidInput = true;
        }
      } else {
        this.createDirectoryDialog.hasInvalidInput = true;
      }
      this.loading = false;
    },
    async createFile() {
      this.loading = true;
      this.createFileDialog.hasExtError = false;
      this.createFileDialog.hasNameError = false;
      this.createFileDialog.hasInvalidInput = false;
      if(this.createFileDialog.name != null && this.createFileDialog.name.trim() != "") {
        let response = await this.$store.dispatch('file/createFile', {
            name: this.createFileDialog.name,
            folderId: this.currentDirectory.folderId,
            containerId: this.$route.params.containerId,
            accessToken: await this.$auth0.getAccessTokenSilently()
        });
        if(response.status == 201) {
          if(response.data.isEntry)
            this.envInfo.entryPoint = response.data.fileId;
          this.createFileDialog.show = false;
          await this.loadDirectory(this.currentDirectory.folderId);
          await this.openFile(response.data.fileId);
        } else if(response.status == 403) {
          this.createFileDialog.hasExtError = true;
        } else if(response.status == 409) {
          this.createFileDialog.hasNameError = true;
        } else if(response.status == 400) {
          this.createFileDialog.hasInvalidInput = true;
        }
      } else {
        this.createFileDialog.hasInvalidInput = true;
      }
      this.loading = false;
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
        // Wait 10ms for DOM to load before rendering editor
        let tab = this.tabs.find(tab => tab.fileId == fileId);
        setTimeout(() => {
          const language = this.fileTypeMap[file.name.split('.')[1]]
          const editor = monaco.editor.create(document.getElementById(`env-editor-pad-${fileId}`), {
              value: content,
              language: language,
              automaticLayout: true,
              readOnly: (this.envInfo.owner != this.user.sub),
          });
          tab.pad = editor;
          editor.onKeyUp(async (event) => {
            const content = editor.getValue();
            const target = this.tabs.find(tab => tab.fileId == fileId);
            clearTimeout(target.timeoutId);
            target.timeoutId = setTimeout(async () => {
              await this.saveFile(target.fileId, content);
            }, 1000);
          });
        }, 10);
        this.activeTab = tab;
        this.loading = false;
      }
    },
    async saveFile(fileId, doc) {
      let tab = this.tabs.find(tab => tab.fileId == fileId);
      tab.saving = true;
      this.loading = true;
      let response = await this.$store.dispatch('file/updateContent', {
          fileId: fileId,
          containerId: this.$route.params.containerId,
          content: doc.toString(),
          accessToken: await this.$auth0.getAccessTokenSilently()
      });
      if(response.status == 200) {
        tab.lastModified = response.data.lastModified;
        let target = this.currentDirectory.files.find(file => file.fileId == fileId);
        if(target != null) {  
          Object.assign(target, response.data);
          this.reloadDirectorySize();
        }
        this.envInfo.size += response.data.delta;
      } else if(response.status == 413) {
        alert("Error saving file content. The file would exceed the maximum limit of 100KB per file.")
      }
      tab.saving = false;
      this.loading = false;
    },
    async setEntryPoint(fileId) {
      this.loading = true;
      let response = await this.$store.dispatch('container/updateContainer', {
          containerId: this.$route.params.containerId,
          updates: {
              entryPoint: fileId
          },
          accessToken: await this.$auth0.getAccessTokenSilently()
      });
      if (response == 204)
        this.envInfo.entryPoint = fileId;
      this.loading = false;
    },
    reloadDirectorySize() {
      // NOTE: Could potentially integrate this code into the API response
      this.currentDirectory.size = 0
      this.currentDirectory.directories.forEach((directory) => {
        this.currentDirectory.size += directory.size;
      });
      this.currentDirectory.files.forEach((file) => {
        this.currentDirectory.size += file.size;
      });
    },
    openDeleteFileDialog(file) {
      if(this.envInfo.owner == this.user.sub) {
        this.deleteFileDialog.toDelete = file;
        this.deleteFileDialog.show = true;
      }
    },
    openDeleteDirectoryDialog(folder) {
      if(this.envInfo.owner == this.user.sub) {
        this.deleteDirectoryDialog.toDelete = folder;
        this.deleteDirectoryDialog.show = true;
      }
    },
    openRenameFileDialog(file) {
      if(this.envInfo.owner == this.user.sub) {
        this.renameFileDialog.toRename = file;
        this.renameFileDialog.name = null;
        this.renameFileDialog.show = true;
        this.renameFileDialog.hasNameError = false;
        this.renameFileDialog.hasExtError = false;
        this.renameFileDialog.hasInvalidInput = false;
      }
    },
    openRenameDirectoryDialog(folder) {
      if(this.envInfo.owner == this.user.sub) {
        this.renameDirectoryDialog.toRename = folder;
        this.renameDirectoryDialog.name = null;
        this.renameDirectoryDialog.show = true;
        this.renameDirectoryDialog.hasNameError = false;
        this.renameDirectoryDialog.hasInvalidInput = false;
      }
    },
    async deleteFile() {
      this.loading = true; 
      let targetId = this.deleteFileDialog.toDelete.fileId;
      let response = await this.$store.dispatch('file/deleteFile', {
          containerId: this.$route.params.containerId,
          fileId: targetId,
          accessToken: await this.$auth0.getAccessTokenSilently()
      });
      if(response == 204) {
        let tabIdx = this.tabs.findIndex(tab => tab.fileId == targetId);
        if (tabIdx != -1) {
          this.tabs.splice(tabIdx, 1);
          if(this.activeTab.fileId == targetId) {
            this.activeTab = this.tabs.length > 0 ? this.tabs[this.tabs.length-1] : null;
          }
        }
        if(this.search.results != null) {
          let searchIdx = this.search.results.files.findIndex(result => result.fileId == targetId);
          if (searchIdx != -1) {
            this.search.results.files.splice(searchIdx, 1);
          }
        }
        let idx = this.currentDirectory.files.findIndex(file => file.fileId == targetId);
        this.envInfo.size -= this.currentDirectory.files[idx].size;
        this.currentDirectory.files.splice(idx, 1);
        this.reloadDirectorySize();
      } else {
        this.showErrorDialog("An unknown error occurred while deleting the file. Please try again.");
      }
      this.loading = false;
      this.deleteFileDialog.show = false;
    },
    async deleteDirectory() {
      this.loading = true;
      let targetId = this.deleteDirectoryDialog.toDelete.folderId;
      let response = await this.$store.dispatch('folder/deleteFolder', {
          containerId: this.$route.params.containerId,
          folderId: targetId,
          accessToken: await this.$auth0.getAccessTokenSilently()
      });
      if(response.status == 200) {
        let idx = this.currentDirectory.directories.findIndex(folder => folder.folderId == targetId);
        this.currentDirectory.directories.splice(idx, 1);
        for(let i = this.tabs.length-1; i>=0; i--) {
          const tab = this.tabs[i];
          if(tab.path.some(path => path.folderId == targetId)) {
            this.tabs.splice(i, 1);
            if(this.activeTab.fileId == tab.fileId) 
              this.activeTab = this.tabs.length > 0 ? this.tabs[this.tabs.length-1] : null;
          }
        }
        this.envInfo.size -= response.data.delta;
        this.reloadDirectorySize();
      } else if(response.status == 409) {
        this.showErrorDialog("Cannot delete this directory since it contains the Entry Point of this container. Please move or assign a new Entry Point before deleting.");
      } else {
        this.showErrorDialog("An unknown error occurred while deleting the directory. Please try again.");
      }
      this.loading = false;
      this.deleteDirectoryDialog.show = false;
    },
    async renameFile() {
      this.loading = true;
      this.renameFileDialog.hasExtError = false;
      this.renameFileDialog.hasNameError = false;
      this.renameFileDialog.hasInvalidInput = false;
      if(this.renameFileDialog.name != null && this.renameFileDialog.name.trim() != "") {
        let fileId = this.renameFileDialog.toRename.fileId;
        let response = await this.$store.dispatch('file/updateFile', {
            containerId: this.$route.params.containerId,
            fileId: fileId,
            updates: {
                name: this.renameFileDialog.name.trim()
            },
            accessToken: await this.$auth0.getAccessTokenSilently()
        });
        if(response.status == 200) {
          let tab = this.tabs.find(tab => tab.fileId == fileId);
          if (tab != null) {
            tab.name = this.renameFileDialog.name.trim();
            tab.lastModified = response.data.lastModified;
          }
          if(this.search.results != null) {
            let searchResult = this.search.results.files.find(result => result.fileId == fileId);
            if (searchResult != null) {
              searchResult.name = this.renameFileDialog.name.trim();
              searchResult.lastModified = response.data.lastModified;
            }
          }
          let target = this.currentDirectory.files.find(file => file.fileId == fileId);
          target.name = this.renameFileDialog.name.trim();
          target.lastModified = response.data.lastModified;
          this.renameFileDialog.show = false;
        } else if(response.status == 403) {
          this.renameFileDialog.hasExtError = true;
        } else if(response.status == 409) {
          this.renameFileDialog.hasNameError = true;
        } else if(response.status == 400) {
          this.renameFileDialog.hasInvalidInput = true;
        }
      } else {
        this.renameFileDialog.hasInvalidInput = true;
      }
      this.loading = false
    },
    async renameDirectory() {
      this.loading = true;
      this.renameDirectoryDialog.hasNameError = false;
      this.renameDirectoryDialog.hasInvalidInput = false;
      if(this.renameDirectoryDialog.name != null && this.renameDirectoryDialog.name.trim() != "") {
        let folderId = this.renameDirectoryDialog.toRename.folderId;
        let response = await this.$store.dispatch('folder/updateFolder', {
            containerId: this.$route.params.containerId,
            folderId: folderId,
            updates: {
                name: this.renameDirectoryDialog.name.trim()
            },
            accessToken: await this.$auth0.getAccessTokenSilently()
        });
        if(response.status == 200) {
          const tabs = this.tabs.filter(tab => tab.path.some(path => path.folderId == folderId));
          tabs.forEach(tab => {
            let pathItem = tab.path.find(path => path.folderId == folderId);
            pathItem.name = this.renameDirectoryDialog.name.trim();
          });
          let target = this.currentDirectory.directories.find(folder => folder.folderId == folderId);
          target.name = this.renameDirectoryDialog.name.trim();
          target.lastModified = response.data.lastModified;
          this.renameDirectoryDialog.show = false;
        } else if(response.status == 409) {
          this.renameDirectoryDialog.hasNameError = true;
        } else if(response.status == 400) {
          this.renameDirectoryDialog.hasInvalidInput = true;
        }
      } else {
        this.renameDirectoryDialog.hasInvalidInput = true;
      }
      this.loading = false
    },
    async execute() {
      this.loading = true;
      let response = await this.$store.dispatch('job/executeJob', {
          containerId: this.$route.params.containerId,
          accessToken: await this.$auth0.getAccessTokenSilently()
      });
      if(response.status == 201 && !this.jobs.some(job => job.jobId == response.data.jobId)) {
        response.data.timeoutId = null;
        response.data.showOutput = true;
        this.jobs.splice(0, 0, response.data);
      }
      this.loading = false;
      this.sidebarTab = 0;
    },
    async toggleOutput(job) {
      job.showOutput = !job.showOutput;
      if(['COMPLETED', 'FAILED', 'BUILD_FAILED'].includes(job.status) && job.output.length == 0) {
        job.loading = true;
        let response = await this.$store.dispatch('job/getJobOutput', {
            jobId: job.jobId,
            containerId: this.$route.params.containerId,
            offset: 0,
            accessToken: await this.$auth0.getAccessTokenSilently()
        });
        job.output = response.data;
        job.loading = false;
        setTimeout(() => {
          const latestElement = document.getElementById(`job-output-${job.jobId}`).lastElementChild;
          latestElement.scrollIntoView({ behavior: "smooth", block: "end"});
        }, 15);
      }
    },
    async loadMoreLogs(job) {
      job.loading = true;
      let response = await this.$store.dispatch('job/getJobOutput', {
          jobId: job.jobId,
          containerId: this.$route.params.containerId,
          offset: job.output.length,
          accessToken: await this.$auth0.getAccessTokenSilently()
      });
      job.output = response.data.concat(job.output);
      job.loading = false;
    },
    async loadMoreSearch() {
      this.loading = true;
      let response = await this.$store.dispatch('file/searchFiles', {
          query: this.search.query,
          containerId: this.$route.params.containerId,
          accessToken: await this.$auth0.getAccessTokenSilently(),
          offset: this.search.results.files.length
      });
      if(response.status == 200) {
        this.search.results.files = this.search.results.files.concat(response.data.files);
        this.search.results.hasMore = response.data.hasMore;
      } else {
        this.showErrorDialog("An unknown error occured while searching files. Please try again later.");
      }
      this.loading = false;
    },
    initPusherConnection() {
      let pusher = new Pusher('1b48cf0e39f77099506c', {
        cluster: 'us3'
      });
      let channel = pusher.subscribe(this.envInfo.containerId);
      channel.bind('job-status', (data) => {
        let job = this.jobs.find(job => job.jobId == data.jobId);
        if(job != null) {
          job.status = data.status;
          if(data.status == 'STARTED') {
            job.started = data.timestamp;
          }
          if(data.status == 'COMPLETED' || data.status == 'FAILED' || data.status == 'BUILD_FAILED')
            job.ended = data.timestamp;
        }
      });
      channel.bind('job-output', (data) => {
        let job = this.jobs.find(job => job.jobId == data.jobId);
        if (job != null) {
          job.output.push({
            content: data.content,
            timestamp: data.timestamp,
            level: data.level,
          });
          clearTimeout(job.timeoutId);
          job.timeoutId = setTimeout(() => {
            const latestElement = document.getElementById(`job-output-${data.jobId}`).lastElementChild;
            latestElement.scrollIntoView({ behavior: "smooth", block: "end"});
          }, 50);
        }
      });
      channel.bind('job-queued', (data) => {
        if(!this.jobs.some(job => job.jobId == data.jobId)) {
          data.timeoutId = null;
          data.showOutput = true;
          data.loading = false;
          this.jobs.splice(0, 0, data);
        }
      });
    },
    openOptions(event) {
        event.stopPropagation();
    },
    hasActiveJob() {
      return this.jobs.some(job => !['COMPLETED', 'FAILED', 'BUILD_FAILED'].includes(job.status));
    },
    copyFilePath(file) {
      navigator.clipboard.writeText(`/job/${file.key.substring(33)}`);
    },
    getFileType(filename) {
      const extension = filename.split(".")[1];
      switch(extension.toLowerCase()) {
        case "java":
          return "Java";
        case "py":
          return "Python";
        case "c":
          return "C";
        case "h":
          return "C Header";
      }
      return null;
    },
    moment(date) {
      return moment.utc(date).local();
    },
    formatBytes(bytes) {
      const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
      if (bytes === 0) return '0B';
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      const value = Math.ceil(bytes / Math.pow(1024, i));
      return `${value}${units[i]}`;
    },
    home() {
      window.open(`/drive`, "_self");
    },
    async updateContainerDetails() {
      this.loading = true;
      let response = await this.$store.dispatch('container/updateContainer', {
          containerId: this.$route.params.containerId,
          updates: {
              name: this.settingsDialog.name,
              description: this.settingsDialog.description
          },
          accessToken: await this.$auth0.getAccessTokenSilently()
      });
      if (response == 204) {
        this.envInfo.name = this.settingsDialog.name;
        this.envInfo.description = this.settingsDialog.description;
      } 
      this.loading = false;
    },
    async toggleIsPublic() {
      this.loading = true;
      let response = await this.$store.dispatch('container/updateContainer', {
          containerId: this.$route.params.containerId,
          updates: {
              public: !this.settingsDialog.public,
          },
          accessToken: await this.$auth0.getAccessTokenSilently()
      });
      if (response == 204) {
        this.envInfo.public = this.settingsDialog.public;
      }
      this.loading = false;
    }
  }
}
</script>