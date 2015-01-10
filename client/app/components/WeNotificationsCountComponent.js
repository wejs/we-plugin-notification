App.WeNotificationsCountComponent = Ember.Component.extend({
  tagName: 'span',
  classNameBindings: ['notificationClassStatus', 'pullRight:pull-right'],

  highlight: true,
  pullRight: false,

  labelHighlightClass: 'label label-danger',
  labelDefaultClass: 'label label-default',

  notificationClassStatus: function() {
    if ( App.get('WeNotification.notificationCount') && this.get('highlight') ) {
      return this.get('labelHighlightClass');
    }
    return this.get('labelDefaultClass');
  }.property('App.WeNotification.notificationCount')

});