/**
 * Notifications client side lib
 */

(function (we) {

we.notification = {
  count: 0,
  countDisplay: null,
  link: null,

  init: function() {
    this.countDisplay = $('.main-menu-link-notification-count');
    this.link = $('.main-menu-notification-link');
    // only start if both elements is found
    if (this.countDisplay && this.link) this.getNewNotificationCount();
  },

  notificationsCountCheckDelay: 60000,// check every 1 min
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
    }).then(function (data){
      self.count = Number(data.count);

      self.updateNotificationsDisplay();
      // update last check time
      self.lastCheckData = new Date().toISOString();
    }).fail(function (err) {
      console.error('we.notification.js:error in getNewNotificationCount:', err);
    }).always(function () {
      self.registerNewCheck();
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