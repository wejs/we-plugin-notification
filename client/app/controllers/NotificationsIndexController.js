App.NotificationsIndexController = Ember.ArrayController.extend({
  breadCrumb: function(){
    return Ember.I18n.t('notifications.unread.breadcrumb');
  }.property('model'),

  sortProperties: ['createdAt'],
  sortAscending:  false,

  pageType: 'unread',

  isEmpty: function(){
    if (this.get('length')) {
      return false;
    }
    return true;
  }.property('length'),

  unreadTotal: function(){
    return this.get('length');
  }.property('length'),
  actions: {
    markAllAsRead: function() {
      var store = this.get('store');

      Ember.$.ajax({
        type: 'POST',
        url: '/api/v1/notify/mark-all-as-read',
        dataType: 'json',
        cache: false,
        contentType: 'application/json'
      }).done(function () {
        var markedCount = 0;
        // if success all notifications are set to read then ...
        // get all notifications from store
        var notifications = store.all('notification');
        notifications.forEach(function (notification) {
          // if not read set it as read in store
          if ( !notification.get('read') )  {
            store.update('notification',{
              id: notification.id,
              notified: true,
              read: true
            });
            markedCount++;
          }
        });

        if (markedCount) {
          // update notification count
          App.WeNotification.updateCount(true, markedCount);
        }
      }).fail(function (jqXHR, textStatus, errorThrown) {
        Ember.Logged.error('Error on set all notifications as read', textStatus, errorThrown);
      });
    }
  }
});
