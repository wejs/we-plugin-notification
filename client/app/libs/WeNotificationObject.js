/**
 * We.js notification object for controll notifications
 *
 *
 */
window.WeNotification = Ember.Object.extend({
  notificationCount: 0,

  readNotificationCount: 0,

  notificationHost: '',

  defaultTitle: '',
  // flag to check if user is on page
  isActiveTab: true,

  newMessageAudio: null,
  notificationAudioUrl: '/core/sounds/new-message.mp3',
  playNotificationSound: function() {
    if (this.get('newMessageAudio') && !this.get('isActiveTab')) {
      this.get('newMessageAudio').play();
    }
  },

  titleNotificator: function() {
    $('title').text(this.formatTitle());
  }.observes('notificationCount'),

  formatTitle: function() {
    if (!this.get('notificationCount')) {
      return this.get('defaultTitle')
    }
    return '('+this.get('notificationCount')+') | ' + this.get('defaultTitle')
  },

  hasBrowserNotificationsPermissions: false,

  authenticatedUser: function(){
    return App.get('currentUser');
  }.property('App.currentUser'),

  init: function() {
    var self = this;
    we.events.on('sails:created:notification', function (){
      self.incrementProperty('notificationCount');

      // TODO add suport to browser notifications
      // var title = 'Novo conteúdo';
      // var icon = '/core/images/we-logo-branco-small.png';

      // if ( message.data.model == 'post' ) {
      //   if( message.data.action == 'created' ) {
      //     title = 'Novo conteúdo';
      //     icon = '/core/images/we-logo-branco-small.png';
      //   }
      // }

      // if ( message.data.model == 'post' ) {
      //   if( message.data.action == 'created' ) {
      //     title = 'Novo conteúdo';
      //     icon = '/core/images/we-logo-branco-small.png';
      //   }
      // }

      // self.createNotification(title, {
      //   icon: icon,
      //   body: message.data.textClean,
      //   onclick: function(){
      //     console.warn('clicou na notificação');
      //   }
      // });
    });

    we.events.on('sails:updated:notification', function updateCount(message) {
      // id is array ...
      if (
       message.data &&
       message.data instanceof Array
      ) {
        message.data.forEach(function (notification) {
          self.updateCount(notification.read);
        })
      } else {
        self.updateCount(message.data.read);
      }
    });
    // Let's check if the browser supports notifications
    if (!('Notification' in window)) {
      console.info('This browser does not support desktop notification');
      return;
    }

    // store default page title
    this.set('defaultTitle', $('title').text() );
    // and set new title
    $('title').text(self.formatTitle());

    var permission = this.hasPermissions();
    if( permission ) {
      if( permission === 'granted') {
        // can notify
      } else {
        this.requestPermission();
      }
    }

    if (Audio) {
      this.set('newMessageAudio', new Audio(this.get('notificationAudioUrl')));
    }

    we.events.on('sails:created:message', function updateCount(message) {
      if ( message.data.fromId != App.get('currentUser.id') ) {
        self.playNotificationSound();
      }
    });

    self.setPageChangeMecanism();

  },

  /**
   * Function to get unread notification count from server
   *
   * return {object}  jquery Ajax object
   */
  loadNotificationCount: function() {
    var self = this;

    if( !App.get('currentUser.id') ) {
      return;
    }

    return $.ajax({
      url: '/api/v1/current-user/notification-count',
      data: {
        read: false
      }
    }).then(function(result){
      if (result.count) {
        self.set('notificationCount', result.count);
      }
      return result;
    });
  },

  /**
   * Function to get read notification count from server
   *
   * return {object}  jquery Ajax object
   */
  loadReadNotificationCount: function() {
    var self = this;

    if( !App.get('auth.isAuthenticated') ) {
      return;
    }

    return $.ajax({
      url: this.get('notificationHost') + '/api/v1/current-user/notification-count',
      data: {
        read: true
      }
    }).then(function(result){
      if (result.count) {
        self.set('readNotificationCount', result.count);
      }
      return result;
    });
  },

  updateCount: function(read, count) {
    if( !count ) {
      count = 1
    }
    if (read) {
      this.decrementProperty('notificationCount', count);
      this.incrementProperty('readNotificationCount', count);
    } else {
      this.incrementProperty('notificationCount', count);
      this.decrementProperty('readNotificationCount', count);
    }

  },

  createNotification: function(title, configs) {
    if (this.hasPermissions()) {
      var notification = new Notification(title,configs);
      return notification;
    }
  },

  requestPermission: function(){
    // request the permission
    Notification.requestPermission(function (permission) {
      // Whatever the user answers, we make sure we store the information
      if (!('permission' in Notification)) {
        Notification.permission = permission;
      }
    });
  },

  hasPermissions: function hasPermissions() {
    // Let's check if the user is okay to get some notification
    if (window.Notification.permission === 'granted') {
      // If it's okay let's create a notification
      return 'granted';
    } else if(window.Notification.permission !== 'denied'){
      // need to ask the user for permission
      return window.Notification.permission;
    }
    // permission denited by user
    return false;
  },

  markModelNotificationAsRead: function(store, modelName, modelId) {
    if( !App.get('auth.isAuthenticated') ) {
      return;
    }

    return $.ajax({
      type: 'POST',
      url: this.get('notificationHost') + '/api/v1/notify/' + modelName + '/' + modelId + '/mark-all-as-read'
    });
  },
  setPageChangeMecanism: function() {
    var self = this;
    // Set the name of the hidden property and the change event for visibility
    var hidden, visibilityChange;
    if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
      hidden = 'hidden';
      visibilityChange = 'visibilitychange';
    } else if (typeof document.mozHidden !== 'undefined') {
      hidden = 'mozHidden';
      visibilityChange = 'mozvisibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
      hidden = 'msHidden';
      visibilityChange = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
      hidden = 'webkitHidden';
      visibilityChange = 'webkitvisibilitychange';
    }

    // If the page is hidden, pause the video;
    // if the page is shown, play the video
    function handleVisibilityChange() {
      if (document[hidden]) {
        self.set('isActiveTab', false);
      } else {
        self.set('isActiveTab', true);
      }
    }

    // Warn if the browser doesn't support addEventListener or the Page Visibility API
    if (typeof document.addEventListener === 'undefined' ||
      typeof document[hidden] === 'undefined') {
      // TODO change to one jquery event
      window.onfocus = function () {
        self.set('isActiveTab', true);
      };
      window.onblur = function () {
        self.set('isActiveTab', false);
      };
    } else {
      // Handle page visibility change
      document.addEventListener(visibilityChange, handleVisibilityChange, false);
    }
  }
});
