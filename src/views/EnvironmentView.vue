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
    <v-progress-linear color="#379af5" height="3" :indeterminate="this.loading || this.pageLoading"></v-progress-linear>
    <!-- END Progress Indicator -->

    <!-- BEGIN Status Overlay -->
    <div style="width: 100vw; height: 100vh; display: flex; justify-content: center; align-items: center;" v-if="[null, 401, 404, 500].includes(this.envInfo) || this.pageLoading">
      <div style="text-align: center;" v-if="this.envInfo == null || this.pageLoading">
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
    <div class="env-bar" v-if="![null, 401, 404, 500].includes(this.envInfo) && !this.pageLoading">
      <!-- BEGIN Logo -->
      <img src="../assets/images/cloudcontain.svg" width="150" class="my-auto" @click="this.home()" />
      <!-- END Logo -->
      <!-- BEGIN Environment Details -->
      <div style="display: flex; flex-direction: row;" class="my-auto">
        <div class="env-name">
          <h4 class="my-auto" style="margin: 0; font-weight: 400; outline: none; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 200px; font-size: 15px">{{ this.envInfo.name }}</h4>
          <v-icon icon="mdi-chevron-down" class="ms-1 my-auto" style="color: #bfbfbf"></v-icon>
        </div>
        <v-tooltip text="Open Hunter" location="bottom">
          <template v-slot:activator="{ props }">
            <button class="env-logs ms-2 my-auto" v-bind="props"><v-icon class="mx-auto my-auto" icon="mdi-crosshairs-gps" style="font-size: 24px; margin: 0; padding: 0;"></v-icon></button>
          </template>
        </v-tooltip>
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
    <div class="env-content" v-show="![null, 401, 404, 500].includes(this.envInfo) && !this.pageLoading">

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
            
            <!-- BEGIN Content Display -->
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
                    <v-icon class="my-auto me-1" :icon="(this.envInfo.entryPoint == file.fileId) ? 'mdi-location-enter' : 'mdi-cube-outline'" style="color: #379af5;"></v-icon>
                    <p class="my-auto" style="font-size: 15px;">{{ file.name }} <span v-if="this.envInfo.entryPoint == file.fileId" style="color: #379af5;" class="ms-1">(Entry Point)</span></p>
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
            <!-- END Content Display -->

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
                          <div class="me-3" style="align-self: flex-start; background: rgba(191, 191, 191, 0.5); font-size: 12px; padding: 1px 5px; border-radius: 5px; min-width: 85px; text-align: center;">{{ this.moment(output.timestamp).format("h:mm:ss a") }}</div>
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
      loading: false,
      pageLoading: true,
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
      jobs: [],
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
    }
    this.pageLoading = false;
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
      let response = await this.$store.dispatch('file/createFile', {
          name: this.createFileDialog.name,
          folderId: this.currentDirectory.folderId,
          containerId: this.$route.params.containerId,
          accessToken: await this.$auth0.getAccessTokenSilently()
      });
      if(response.isEntry)
        this.envInfo.entryPoint = response.fileId;
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
      this.loading = true;
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
      this.loading = false;
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
    initPusherConnection() {
      let pusher = new Pusher('1b48cf0e39f77099506c', {
        cluster: 'us3'
      });
      let channel = pusher.subscribe(this.envInfo.containerId);
      channel.bind('job-status', (data) => {
        let job = this.jobs.find(job => job.jobId == data.jobId);
        if(job != null) {
          job.status = data.status;
          if(data.status == 'STARTED')
            job.started = data.timestamp;
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
          }, 75);
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
    hasActiveJob() {
      return this.jobs.some(job => !['COMPLETED', 'FAILED', 'BUILD_FAILED'].includes(job.status));
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