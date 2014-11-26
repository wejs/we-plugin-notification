/**
 * Notification routes
 *
 * @type {Object}
 */
module.exports.routes = {

  // link permanent
  'get /link-permanent/notification/:id': {
    controller    : 'notification',
    action        : 'linkPermanent'
  },

  // get current user notification count
  'get /api/v1/current-user/notification-count': {
    controller    : 'notification',
    action        : 'getUnreadNotificationCount'
  },

  'post /api/v1/notify/mark-all-as-read': {
    controller    : 'notification',
    action        : 'markAllNotificationAsRead'
  },

  'post /api/v1/notify/:model/:modelId/mark-all-as-read': {
    controller    : 'notification',
    action        : 'markAllModelNotificationAsRead'
  }
}