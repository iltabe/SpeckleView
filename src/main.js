import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import VueTimeago from 'vue-timeago'
import VeeValidate from 'vee-validate'

import App from './App.vue'
import Store from './store/store.js'

import 'vuetify/dist/vuetify.min.css'
import 'vue-material-design-icons/styles.css'

window.Store = Store

import { EventBus } from './event-bus'

Vue.use( Vuex )
Vue.use( Vuetify, {
  theme: {
    primary: '#0080FF',
    secondary: '#26c2f2',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107'
  },
  iconfont: 'md',
} )
Vue.use( VeeValidate )

Vue.use( VueTimeago, {
  name: 'timeago',
  locale: 'en-US',
  locales: {
    'en-US': require( 'vue-timeago/locales/en-US.json' )
  }
} )

Vue.component( 'editable', {
  template: '<div contenteditable="true" @input="update"></div>',
  props: [ 'content' ],
  mounted: function ( ) {
    this.$el.innerText = this.content;
  },
  methods: {
    update: function ( event ) {
      this.$emit( 'update', event.target.innerText );
    }
  }
} )

new Vue( {
  store: Store,
  el: '#app',
  render: h => h( App ),
  mounted( ) {
    // Populate with existing accounts
    this.$store.dispatch( 'getHostApplication' )
    this.$store.dispatch( 'getUserAccounts' )
    this.$store.dispatch( 'getFileStreams' )

    EventBus.$on( 'client-purge', ( ) => {
      // console.log( 'purge-purge' )
      this.$store.commit( 'PURGE_CLIENTS' )
    } )

    EventBus.$on( 'client-add', ( streamId, data ) => {
      this.$store.commit( 'ADD_CLIENT', JSON.parse( data ) )
    } )

    EventBus.$on( 'client-metadata-update', ( streamId, data ) => {
      // console.log( 'client-metadata-update', streamId, data )
      this.$store.commit( 'SET_METADATA', { streamId: streamId, stream: JSON.parse( data ) } )
    } )

    EventBus.$on( 'client-log', ( streamId, data ) => {
      // console.log( 'client-log', streamId, data )
      this.$store.commit( 'APPEND_LOG', { streamId: streamId, data: JSON.parse( data ) } )
    } )

    EventBus.$on( 'client-error', ( streamId, data ) => {
      // console.log( 'client-error', streamId, data )
      this.$store.commit( 'APPEND_LOG', { streamId: streamId, data: JSON.parse( data ) } )
      this.$store.commit( 'SET_ERROR', { streamId: streamId, data: JSON.parse( data ) } )
    } )

    EventBus.$on( 'client-children', ( streamId, data ) => {
      // console.log( 'client-children', streamId, data )
      this.$store.commit( 'SET_CLIENT_CHILDREN', { streamId: streamId, data: JSON.parse( data ) } )
    } )

    EventBus.$on( 'client-is-loading', ( streamId, data ) => {
      // console.log( 'client-is-loading', streamId, data )
      this.$store.commit( 'SET_LOADING', { streamId: streamId, status: true } )
    } )

    EventBus.$on( 'client-done-loading', ( streamId, data ) => {
      // console.log( 'client-done-loading', streamId, data )
      this.$store.commit( 'SET_LOADING', { streamId: streamId, status: false } )
    } )

    EventBus.$on( 'client-progress-message', ( streamId, data ) => {
      // console.log( 'client-progress-message', streamId, data )
      this.$store.commit( 'SET_PROGRESS_MESSAGE', { streamId: streamId, message: data } )
    } )

    EventBus.$on( 'client-expired', ( streamId, data ) => {
      // console.log( 'client-expired', streamId, data )
      this.$store.commit( 'SET_EXPIRED', { streamId: streamId, status: true } )
    } )

    EventBus.$on( 'client-ws-message', ( streamId, data ) => {
      // console.log( 'client-ws-message', streamId, data )
    } )

    EventBus.$on( 'client-error', ( streamId, data ) => {
      // console.log( 'client-error', streamId, data )
      this.$store.commit( 'SET_ERROR', { streamId: streamId, data: JSON.parse( data ) } )
    } )

    EventBus.$on( 'object-selection', ( streamId, data ) => {
      // console.log( data )
      // console.log( 'object-selection', data, JSON.parse( atob( data ) ) )
      if ( data == '[]' ) this.$store.commit( 'SET_SELECTION', { selectionInfo: [ ] } )
      else this.$store.commit( 'SET_SELECTION', { selectionInfo: JSON.parse( atob( data ) ) } )
    } )

    EventBus.$on( 'set-gl-load', ( streamId, state ) => {
      this.$store.commit( 'SET_GL_LOAD', state === 'true' )
    } )

    EventBus.$on( 'refresh-accounts', () => {
      this.$store.dispatch( 'getUserAccounts' )
    })

    // tell .net that the app is ± ready.
    Interop.appReady( )
  }
} )

window.EventBus = EventBus // expose globally for .net
window.Store = Store // expose globally for .net?