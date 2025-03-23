import './assets/main.css'
import '@mdi/font/css/materialdesignicons.css'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Auth0
import { createAuth0 } from '@auth0/auth0-vue';

// Components
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)


app.use(router)
  .use(vuetify)
  .use(store)
  .use(
    createAuth0({
      domain: "cloudcontain.us.auth0.com",
      clientId: "YRXmainPeTpSpQlI0TQbdniPBvOsuaDB",
      authorizationParams: {
        redirect_uri: window.location.origin,
        audience: "https://api.cloudcontain.net"
      }
    })
  );
  
app.mount('#app')
