var async = require('async');
var _ = require('lodash');

module.exports = {
  created: function setCommentNotifications(model, action, comment, actor) {


    // get related post
    var query = sails.models[comment.modelName].findOneById(comment.modelId)

    if ( comment.modelName === 'post') {
      query.populate('sharedIn')
      query.populate('wembed')
    }

    query.exec(function (err, commentedModel) {
      if (err) {
        return sails.log.error('Error on get post related to comment',err);
      }
      // do nothing if no post found
      if (!commentedModel) {
        sails.log.warn('Post related to comment not found', comment);
        return;
      }

      var usersToNotify = {};
      // set default data
      commentedModel = commentedModel.toJSON();

      async.parallel([
        function (cb) {
         // get users how are following the commented resource
          Follow.getUsersFollowing(comment.modelName, commentedModel.id)
          .exec(function (err, users) {
            if(err) return cb(err);
            return cb(null, users);
          });
        }
      ], function (err, results) {
        if (err) {
          return sails.log.error('Error on get Follow.getUsersFollowing for post related to comment',err);
        }

        var uid;
        // for each result
        for (var i = results.length - 1; i >= 0; i--) {
          // for each user format and filter
          for (var j = results[i].length - 1; j >= 0; j--) {
            uid = results[i][j].userId;
            usersToNotify[uid] = {
              id: uid,
              notificationType: results[i][j].model,
              flag: results[i][j]
            };
          }
        }

        if (comment.mentions) {
          for (var l = comment.mentions.length - 1; l >= 0; l--) {
            uid = comment.mentions[l].userMentioned;
            // overrides post created and group notification
            usersToNotify[uid] = {
              id: uid,
              mention: comment.mentions[l],
              notificationType: 'mention'
            }
          }
        }

        var usersArray = _.toArray(usersToNotify);
        // for each user to notify ...
        usersArray.forEach( function (user) {
          // dont notify user creator
          if ( user.id === actor.id) {
            return;
          }

          var locale = user.language;
          if (!locale) {
            locale = sails.config.i18n.defaultLocale;
          }

          // small teaser text
          comment.bodyTeaser = comment.bodyClean.substr(0, 70);

          var newNotification;

          if (user.notificationType === 'mention') {
            newNotification = {
              user: user.id,
              model: 'mention',
              modelId: user.mention.id,
              action: 'created',
              actor: actor.id,
              locale: locale,
              targetModelType: comment.modelName,
              targetModelId: commentedModel.id,
              displayName: actor.displayName,
              contentType: 'relato',
              targetContentTeaser: comment.bodyTeaser
            }
          } else {
            newNotification = {
              user: user.id,
              model: model,
              modelId: comment.id,
              action: action,
              actor: actor.id,
              locale: locale,
              targetModelType: comment.modelName,
              targetModelId: commentedModel.id,
              displayName: actor.displayName,
              targetContentTeaser: comment.bodyTeaser
            }
          }

          if( comment.modelName === 'post') {
            newNotification.contentType = commentedModel.contentType;
            newNotification.relatedContentTeaser = commentedModel.bodyTeaser;
          } else if (comment.modelName === 'relato') {
            newNotification.contentType = 'relato';
            if (commentedModel.descricaoClean) {
              newNotification.relatedContentTeaser = commentedModel.titulo;
            }
          }

          if ( commentedModel.sharedIn ) {
            newNotification.groupId = commentedModel.sharedIn.id;
            newNotification.groupName = commentedModel.sharedIn.name;
          }

          Notification.create(newNotification)
          .exec(function(error) {
            if (error) {
              return sails.log.error('Error on create notifications for comment create', error);
            }
          });
        });

      });

    })
  }
}
