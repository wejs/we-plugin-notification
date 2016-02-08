/**
 * We.js notification plugin config
 */

module.exports = function loadPlugin(projectPath, Plugin) {
  var plugin = new Plugin(__dirname);

  // set plugin routes
  plugin.setRoutes({
    'get /link-permanent/notification/:id([0-9]+)': {
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

    // get notifications
    'get /notification': {
      controller    : 'notification',
      model         : 'notification',
      action        : 'find',
      layoutName    : 'fullwidth',
      permission    : true,

      search: {
        // since search is avaible in findAll by default
        since: {
          parser: 'since',
          target: {
            type: 'field',
            field: 'createdAt'
          }
        }
      }
    },

    'post /api/v1/notify/:notificationId([0-9]+)': {
      controller    : 'notification',
      model         : 'notification',
      action        : 'setNotificationRead',
      permission    : true
    },

    'get /notification-settings': {
      controller    : 'notification',
      model         : 'notification',
      action        : 'userNotificationSettings',
      layoutName    : 'fullwidth',
      template      : 'notification/settings',
      titleHandler  : 'i18n',
      titleI18n     : 'notification.user.settings',
      permission    : true
    },
    'post /notification-settings': {
      controller    : 'notification',
      model         : 'notification',
      action        : 'userNotificationSettings',
      layoutName    : 'fullwidth',
      titleHandler  : 'i18n',
      titleI18n     : 'notification.user.settings',
      template      : 'notification/settings',
      permission    : true
    }
  });

  plugin.events.on('we:after:load:plugins', function (we) {
    we.notification = true;
  });
  return plugin;
}