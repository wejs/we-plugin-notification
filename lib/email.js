/**
 * Email notification object
 * @type {Object}
 */

module.exports = {
  getUserEmailNotificationType: function(user, callback){
    // if has user config prepopulated
    if(user.configs){
      if(user.configs.emailNotificationType){
        return callback(null, user.configs.emailNotificationType);
      }else{
        return callback(null,'none');
      }
    }

    // else get user configs from db
    Configuration.find()
    .where({
      user: user.id
    })
    .exec(function(err, configs){
      if(err){
        sails.log.error('Error on get user configs',err);
        return callback(err, null);
      }
      if(configs && configs.emailNotificationType){
        callback(null, configs.emailNotificationType);
      }else{
        callback(null, 'none');
      }
    });
  },

  getNotSendNotifications: function( callback){
    sails.log.warn('TODO getNotSendNotifications');

    callback();
  },

  setNotificationAsSend: function( notification, callback){
    sails.log.warn('TODO setNotificationAsSend');

    callback();
  }
};
