//var notify =

module.exports = function initPlugin(sails, cb) {
  // we-plugin-notifications
  var WN = this;

  if (! sails.models.notification ) {
    return sails.log.error('Notification model not found in sails object for we-plugin-notifications');
  }

  if (! sails.models.user ) {
    return sails.log.error('User model not found in sails object for we-plugin-notifications');
  }

  // if has socket.io enabled fetch data and send the notification
  // in socket.io
  if( sails.hooks.sockets ) {
    // this event is triggered in notification.afterCreate model
    sails.on('we:model:notification:afterCreate', function(record) {

      var Notification = sails.models.notification;
      var User = sails.models.user;

      var recordsRelated = {};

      record = Notification.customToJSON(record);

      User.findOne({
        id: record.user
      })
      .exec(function(err, user){
        if ( err ) {
          return sails.log.error('Error on send push notification to user', err, record);
        }

        if ( !user ) {
          return sails.log.error('User to notify not found for notification:', record);
        }

        var locale = user.language;
        if (!locale) {
          locale = sails.config.i18n.defaultLocale;
        }

        Notification.fetchNotificationData(locale, record, recordsRelated, function() {
          recordsRelated['notification'] = record;
          sails.io.sockets.in('user_' + record.user).emit(
            'notification',
            {
              id: record.id,
              verb: 'created',
              data: record
            }
          );
        });
      })
    });
  }
  // create one notification on contact request
  sails.on('we:model:contact:requested', function(contact, actor) {
    WN.notify('contact', 'requested', contact, actor);
  });
  // create one notification on contact accept
  sails.on('we:model:contact:accepted', function(contact, actor) {
    WN.notify('contact', 'accepted', contact, actor);
  });

  // create one notification on contact accept
  sails.on('we:model:mention:afterCreate', function(mention) {
    WN.notify('mention', 'created', mention);
  });

  cb();
}