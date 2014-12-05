var followN = require('../follow.js');
var _ = require('lodash');

module.exports = {
  created: function setPostNotifications(modelName, action, post, actor) {
    followN.getUsersToNotify(modelName, action, post, actor.id , function result(err, usersToNotify) {
      if (err) {
        return sails.log.error('Error on notificator.getUsersToNotify',err);
      }

      var uid;

      // if has users to notify ...
      if (usersToNotify) {

        if (post.mentions) {
          for (var i = post.mentions.length - 1; i >= 0; i--) {
            uid = post.mentions[i].userMentioned;
            // overrides post created and group notification
            usersToNotify[uid] = {
              id: uid,
              mention: post.mentions[i],
              notificationType: 'mention'
            }
          }
        }

        // populate post assoc data
        Post.findOneById(post.id)
        .populate('sharedIn')
        .populate('wembed')
        .exec(function (err , postRecord) {
          if( err ) {
            return sails.log.error('Error on get populated post from DB ',err);
          }

          // set default post data
          postRecord = postRecord.toJSON();

          var usersArray = _.toArray(usersToNotify);
          // for each user to notify ...
          usersArray.forEach( function (user) {
            // dont notify user creator
            if ( user.id === actor.id) {
              return;
            }

            // TODO add suport to user language
            var locale = user.language;
            if (!locale) {
              locale = sails.config.i18n.defaultLocale;
            }

            var newNotification;
            if (user.notificationType === 'mention') {
              newNotification = {
                user: user.id,
                model: 'mention',
                modelId: user.mention.id,
                action: 'created',
                actor: actor.id,

                locale: locale,

                targetModelType: 'post',
                targetModelId: post.id,
                displayName: actor.displayName,
                contentType: postRecord.contentType,
                relatedContentTeaser: postRecord.bodyTeaser
              }
            } else if(user.notificationType === 'group') {
              newNotification = {
                user: user.id,
                model: 'group',
                modelId: user.flag.modelId,
                action: action,
                actor: actor.id,

                locale: locale,

                targetModelType: 'post',
                targetModelId: post.id,
                displayName: actor.displayName,
                contentType: postRecord.contentType,
                relatedContentTeaser: postRecord.bodyTeaser
              }
            } else {
              newNotification = {
                user: user.id,
                model: modelName,
                modelId: post.id,
                action: action,
                actor: actor.id,

                locale: locale,

                targetModelType: 'post',
                targetModelId: post.id,
                displayName: actor.displayName,
                contentType: postRecord.contentType,
                relatedContentTeaser: postRecord.bodyTeaser
              }
            }

            // set group vars for all notifications
            if ( postRecord.sharedIn ) {
              newNotification.groupId = postRecord.sharedIn.id;
              newNotification.groupName = postRecord.sharedIn.name;
            }

            Notification.create(newNotification)
            .exec(function (error) {
              if (error) {
                return sails.log.error('Error on getUsersFromSharedWithField Notification.create', error);
              }
            });
          });

        })
      }
    });

    /* post example:
    { body: '<p>teste</p>',
    createdAt: Mon Jun 23 2014 04:00:18 GMT-0300 (BRT),
    updatedAt: Mon Jun 23 2014 04:00:18 GMT-0300 (BRT),
    active: true,
    creator: '53814d02e2c88c4f4937079a',
    sharedWith: [ '537c449a23b0b9cc2f5d9a7a', '538160a7e7dd93384f988a13' ],
    id: '53a7d082403f1340049fe09a' }
     */

    // // shared with you notification
    // NotificationService.getUsersFromSharedWithField(post, function(error, users) {
    //   if (error) {
    //     sails.log.error('Error on setPostNotifications getUsersFromSharedWithField', error);
    //   } else if(users) {
    //     users.forEach( function(user) {
    //       // create one notification for every user
    //       NotificationService.getUserEmailNotificationType(user, function(error, emailNotificationType) {
    //         if (error) {
    //           return sails.log.error('Error on setPostNotifications getUserEmailNotificationType', error);
    //         }

    //         var notification = {};
    //         notification.user = user.id;
    //         notification.post = post.id;
    //         notification.type = 'postCreatedSharedWithMe';
    //         notification.emailNotificationType = emailNotificationType;

    //         Notification.create( notification ).exec(function(error, notification) {
    //           if (error) {
    //             return sails.log.error('Error on getUsersFromSharedWithField Notification.create', error);
    //           }
    //         });
    //       });
    //     });
    //   }
    // });
  }
}
