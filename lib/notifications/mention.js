/**
 * Mention notifications functions
 */

module.exports = {
  created: function(model, action, mention) {
    // [howMentioned] mencionou você no post [postName]
    User.findOne({idInProvider: mention.whoMentioned})
    .exec(function (err, howMentioned) {
      if(err) {
        return sails.log.error('notification:mention:created:User.findOne. whoMentioned', err);
      }

      if( !howMentioned ) {
        return sails.log.warn('howMentioned not found on notification:mention:created', mention);
      }

      User.findOne({
        id: mention.userMentioned
      })
      .exec(function (err, userMentioned) {
        if(err) {
          return sails.log.error('notification:mention:created:User.find. whoMentioned', err);
        }

        if( !userMentioned ) {
          return sails.log.error('notification:mention:created:User.find mentioned user not found', mention)
        }

        var newNotification = {
          user: mention.userMentioned,
          model: 'mention',
          modelId: mention.id,
          action: 'created',
          actor: howMentioned.id,

          locale: userMentioned.language,

          targetModelType: mention.modelName,
          targetModelId: mention.modelId,
          displayName: howMentioned.displayName,
          contentType: null,
          relatedContentTeaser: null
        }

        Notification.create(newNotification)
        .exec(function (error) {
          if (error) {
            return sails.log.error('Error on create notification for user mention', error);
          }
        });
      })
    })
  }
};
