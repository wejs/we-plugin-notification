
App.NotificationsController = Ember.Controller.extend({
  breadCrumb: function() {
    return Ember.I18n.t('notifications.breadcrumb');
  }.property('model')
});