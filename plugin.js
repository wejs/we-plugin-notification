/**
 * We.js notification plugin config
 */

module.exports = function loadPlugin(projectPath, Plugin) {
  var plugin = new Plugin(__dirname);

  // set plugin configs
  // plugin.setConfigs({
  // });

  // set plugin routes
  plugin.setRoutes({
    'get /link-permanent/notification/:id': {
      controller    : 'notification',
      model         : 'notification',
      action        : 'linkPermanent',
      permission    : true
    },
    // get current user notification count
    'get /api/v1/current-user/notification-count': {
      controller    : 'notification',
      action        : 'getNotificationCount',
      permission    : true
    },
    'post /api/v1/notify/mark-all-as-read': {
      controller    : 'notification',
      model         : 'notification',
      action        : 'markAllNotificationAsRead',
      permission    : true
    },
    'post /api/v1/notify/:model/:modelId/mark-all-as-read': {
      controller    : 'notification',
      model         : 'notification',
      action        : 'markAllModelNotificationAsRead',
      permission    : true
    },

    'get /api/v1/notify/notification': {
      controller    : 'notification',
      model         : 'notification',
      action        : 'findCurrentUserNotifications',
      permission    : true
    },

    'post /api/v1/notify/:notificationId/:isRead': {
      controller    : 'notification',
      model         : 'notification',
      action        : 'setNotificationRead',
      permission    : true
    }
  });

  return plugin;
}