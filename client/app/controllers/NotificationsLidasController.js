App.NotificationsLidasController = Ember.ArrayController.extend({
  sortProperties: ['createdAt'],
  sortAscending:  false,
  breadCrumb: function() {
    return Ember.I18n.t('notifications.read.breadcrumb');
  }.property('model'),

  readNotificationPage: true,
});
