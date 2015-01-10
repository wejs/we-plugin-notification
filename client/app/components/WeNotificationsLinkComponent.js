App.WeNotificationsLinkComponent = Ember.Component.extend({
  tagName: 'span',
  classNameBindings: ['hasNotifications:hasNotifications'],

  showLabel: true,

  text: 'Notifications',

  labelHighlightClass: 'label label-danger',
  labelDefaultClass: 'label label-default',

  textTranslated: function() {
    if (this.get('text'))
      return window.i18n(this.get('text'))
    return '';
  }.property(),

  notificationCount: function() {
    if ( App.get('WeNotification.notificationCount') ) {
      return App.get('WeNotification.notificationCount');
    }
    return 0;
  }.property('App.WeNotification.notificationCount'),

  hasNotifications: function() {
    if ( App.get('WeNotification.notificationCount') ) {
      return true;
    }
    return false;
  }.property('App.WeNotification.notificationCount')
});