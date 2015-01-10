(function($, Ember, App){

  App.Router.map(function(match) {
    // post route map
    this.resource('notifications',{path: '/n'}, function(){
      // edit item route
      this.route('lidas');
    });
    // item route
    // this.resource('notification', { path: '/post/:post_id' }, function(){
    //   // edit item route
    //   this.route('edit');
    // });
  });

  App.NotificationsRoute = Ember.Route.extend(App.ResetScrollMixin,{
    beforeModel: function () {
      if (!App.get('auth.isAuthenticated') ) {
        return this.transitionTo('home');
      }
    },
    model: function(){
      return App.WeNotification.loadReadNotificationCount();
    }
  });

  App.NotificationsIndexRoute = Ember.Route.extend(App.ResetScrollMixin,{
    renderTemplate: function() {
      this.render('notifications/notifications');
    }
  });

  App.NotificationsLidasRoute = Ember.Route.extend(App.ResetScrollMixin,{
    renderTemplate: function() {
      this.render('notifications/lidas');
    },
    model: function() {
      this.loadNotifications();

      return this.get('store').filter('notification', function(notification) {
        if( notification.get('read') ){
          return true;
        }else{
          return false;
        }
      });
    },

    loadNotifications: function(){
      this.store.find('notification', {
        user: App.get('currentUser.id'),
        read: true
      });
    }

  });

  /**
   * Read status
   */
  App.NotificationsIndexRoute = Ember.Route.extend({
    renderTemplate: function() {
      this.render('notifications/nao-lidas');
    },
    model: function() {
      this.loadNotifications();

      return this.get('store').filter('notification', function(notification) {
        if( !notification.get('read') ){
          return true;
        }else{
          return false;
        }
      });
    },

    loadNotifications: function(){
      this.store.find('notification', {
        user: App.get('currentUser.id'),
        read: false
      });
    }

  });

})(jQuery, Ember, App);