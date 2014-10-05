
module.exports = {
  created: function setCommentNotifications(model, action, comment, actor) {
    // get related post
    Post.findOne({id: comment.post })
      .populate('sharedIn')
      .populate('wembed')
    .exec(function (err, commentedModel) {
      if (err) {
        return sails.log.error('Error on get post related to comment',err);
      }
      // do nothing if no post found
      if (!commentedModel) {
        sails.log.warn('Post related to comment not found', comment);
        return;
      }

      // set default data
      commentedModel = commentedModel.toJSON();

      // get users how are following the commented resource
      Follow.getUsersFollowing('post', commentedModel.id)
      .exec(function (err, users) {
        if (err) {
          return sails.log.error('Error on get Follow.getUsersFollowing for post related to comment',err);
        }

        if (!users) return;

        // for each user to notify ...
        users.forEach( function(user) {
          // dont notify user creator
          if ( user.userId === actor.idInProvider) {
            return;
          }

          var locale = user.language;
          if (!locale) {
            locale = sails.config.i18n.defaultLocale;
          }

          // small teaser text
          comment.bodyTeaser = comment.bodyClean.substr(0, 30);

          var newNotification = {
            user: user.userId,
            model: model,
            modelId: comment.id,
            action: action,
            actor: actor.id,

            locale: locale,

            targetModelType: 'post',
            targetModelId: commentedModel.id,
            displayName: actor.displayName,
            contentType: commentedModel.contentType,
            relatedContentTeaser: commentedModel.bodyTeaser,
            targetContentTeaser: comment.bodyTeaser
          }

          if ( commentedModel.sharedIn && commentedModel.sharedIn[0] ) {
            newNotification.groupId = commentedModel.sharedIn[0].id;
            newNotification.groupName = commentedModel.sharedIn[0].name;
          }

          Notification.create(newNotification)
          .exec(function(error) {
            if (error) {
              return sails.log.error('Error on getUsersFromSharedWithField Notification.create', error);
            }
          });
        });
      });
    })
  }
}
