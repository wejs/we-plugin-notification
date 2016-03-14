/**
 * Notifications client side lib
 */

(function (we) {

we.notification = {
  count: 0,
  countDisplay: null,
  link: null,
  notificationsCountCheckDelay: 60000,// check every 1 min

  init: function() {
    this.countDisplay = $('.main-menu-link-notification-count');
    this.link = $('.main-menu-notification-link');
    // only start if both elements is found
    if (this.countDisplay && this.link) this.getNewNotificationCount();
  },


  lastCheckData: null,
  registerNewCheck: function registerNewCheck() {
    setTimeout(
      this.getNewNotificationCount.bind(this),
      this.notificationsCountCheckDelay
    );
  },

  getNewNotificationCount: function getNewNotificationCount() {
    var self = this;

    $.ajax({
      url: '/api/v1/current-user/notification-count'
    }).then(function onSuccessGetNewNotifications(data) {
      self.count = Number(data.count);

      self.updateNotificationsDisplay();
      // update last check time
      self.lastCheckData = new Date().toISOString();

      self.registerNewCheck();
    }).fail(function afterFailtInGetNewNotifications(err) {
      // skip new checks if user is unAuthenticated
      if (err.status != '403') {
        console.error('we.notification.js:error in getNewNotificationCount:', err);
        self.registerNewCheck();
      }
    });
  },

  updateNotificationsDisplay: function updateNotificationsDisplay() {
    if (this.count) {
      this.countDisplay.text(this.count);
      this.link.addClass('have-notifications');
    } else {
      this.countDisplay.text('');
      this.link.removeClass('have-notifications');
    }
  }
};

we.notification.init();

})(window.we);