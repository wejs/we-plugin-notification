/**
 * We.js notification plugin config
 */

module.exports = function loadPlugin(projectPath, Plugin) {
  const plugin = new Plugin(__dirname);

  plugin.setConfigs({
    notification: {
      /**
       * time to wait after an notification is created to send in  notification email
       * @type {Object}
       */
      waitMinutesForSendEmail: 30
    }
  });

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
      model         : 'notificationSettings',
      action        : 'userNotificationSettings',
      layoutName    : 'fullwidth',
      template      : 'notification/settings',
      titleHandler  : 'i18n',
      titleI18n     : 'notification.user.settings',
      permission    : true
    },
    'post /notification-settings': {
      controller    : 'notification',
      model         : 'notificationSettings',
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

  plugin.hooks.on('we-plugin-menu:after:set:core:menus', function(data, done){
    const req = data.req;
    const res = data.res;

    // set user menu
    if (req.isAuthenticated()) {
      res.locals.userMenu.addLink({
        id: 'notifications',
        href: '/notification',
        text: '<span class="glyphicon glyphicon-bell"></span>'+
              '<span class="main-menu-link-notification-count badge"></span> '+
              '<span class="main-menu-notification-text">'+
                res.locals.__('notification.find') +
              '</span>',
        class: 'main-menu-notification-link',
        weight: 0
      });
    }

    done();
  });

  /**
   * Send email notifications to all users
   */
  plugin.sendUsersEmailNotifications = function sendUsersEmailNotifications(we, done) {
    const afterCreatedAt = we.utils.moment();

    afterCreatedAt.subtract(we.config.notification.waitMinutesForSendEmail, 'm');

    let usersToReceive = {};

    we.db.models.notification
    .findAll({
      where: {
        emailSend: false,
        read: false,
        createdAt: {
          $lt: afterCreatedAt.format('YYYY-MM-DD HH:mm:ss')
        },
        $and: [
          ['settings.followingEmailNotifications != false OR settings.followingEmailNotifications is NULL', [] ]
        ]
      },
      orderBy: [
        [ 'userId', 'DESC'],
        [ 'createdAt', 'DESC']
      ],
      include: [
        { as: 'settings', model: we.db.models.notificationSettings }
      ]
    })
    .then( (notifications)=> {
      // group by user id
      for (let i = notifications.length - 1; i >= 0; i--) {
        if (!usersToReceive[notifications[i].userId]) {
          usersToReceive[notifications[i].userId] = {
            id: notifications[i].userId,
            notifications: [],
            notificationsIds: []
          };
        }

        usersToReceive[notifications[i].userId].notifications.push(notifications[i]);
        usersToReceive[notifications[i].userId].notificationsIds.push(notifications[i].id);
      }

      // for each user
      we.utils.async.eachSeries(usersToReceive, ( userToReceive, done)=> {

        we.db.models.user
        .findById(userToReceive.id)
        .then( (user)=> {
          if(!user) return done();

          let email = user.email;

          if (userToReceive.notifications[0] &&
            userToReceive.notifications[0].settings &&
            userToReceive.notifications[0].settings.email
          ) {
            email = userToReceive.notifications[0].settings.email;
          }

          we.email.sendEmail('userNotifications', {
            email: email,
            subject: we.i18n.__('notification.user.email.subject', {
              user: user,
              siteName: we.config.appName
            })
          },
          // template data
          {
            user: user,
            notifications: userToReceive.notifications,
            we: we,
            locale: user.locale || null
          }, (err)=> {
            if (err) {
              we.log.error(err);
              done();
            } else {
              we.log.info('Send '+userToReceive.notifications.length+' notifications in one email to:', email);
              // update all notifications
              we.db.models.notification
              .update({
                emailSend: true
              }, {
                where: {
                  id: userToReceive.notificationsIds
                }
              })
              .then( ()=> {
                done();
                return null;
              })
              .catch( (err)=> {
                we.log.error(err);

                done();
                return null;
              });
            }
          });
        })
        .catch(done);
      }, done);

      return null;
    })
    .catch(done);
  }

  plugin.addJs('we.notification', {
    type: 'plugin', weight: 15, pluginName: 'we-plugin-notification',
    path: 'files/public/we.notification.js'
  });
  plugin.addCss('we.notification', {
    type: 'plugin', weight: 15, pluginName: 'we-plugin-notification',
    path: 'files/public/we.notification.css'
  });

  return plugin;
}