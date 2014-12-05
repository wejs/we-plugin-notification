var async = require('async');

module.exports = {
  getUsersToNotify: function getUsersToNotify(modelName, action, model, actorId, callback){
    var usersToNotify = {};
    var queryGetters = [];

    // on create dont get model followers
    if ( action !== 'created') {
      // users following the content
      queryGetters.push(function(cb) {
        Follow.getUsersFollowing(modelName, model.id)
        .exec(function(err, users){
          if(err) return cb(err);
          return cb(null, users);
        });
      });
    }

    // users following the content creator
    queryGetters.push(function(cb) {
      // TODO skip creator
      // users following the creator
      Follow.getUsersFollowing('user', model.creator)
      .exec(function(err, users){
        if(err) return cb(err);
        return cb(null, users);
      });
    });

    // Group
    if( model.sharedIn ) {
      var groupId;
      if(typeof model.sharedIn === 'object' ) {
        groupId = model.sharedIn.id
      } else {
        groupId = model.sharedIn;
      }

      // users how follow the groups
      queryGetters.push(function(cb) {
        // TODO skip creator
        // users following the group
        Follow.getUsersFollowing('group', groupId)
        .exec(function (err, users) {
          if(err) return cb(err);
          return cb(null, users);
        });
      });
    }

    // run query with assync
    async.parallel(queryGetters, function(err, results){
      if (err) {
        return callback(err, null);
      }
      var uid;
      // for each result
      for (var i = results.length - 1; i >= 0; i--) {
        // for each user format and filter
        for (var j = results[i].length - 1; j >= 0; j--) {
          uid = results[i][j].userId;
          // filter notifications to only notify one time and group overrides follow user notification
          if( results[i][j].model === 'group') {
            usersToNotify[uid] = {
              id: uid,
              notificationType: results[i][j].model,
              flag: results[i][j]
            };
          } else {
            if(!usersToNotify[uid] || usersToNotify[uid].notificationType !== 'group') {
              usersToNotify[uid] = {
                id: uid,
                notificationType: results[i][j].model,
                flag: results[i][j]
              };
            }
          }
        }
      }
      callback(null, usersToNotify);
    });

  },
  getUsersFromSharedWithField: function getUsersFromSharedWithField(post, callback){
    if(post.sharedWith && post.sharedWith.length > 0){
      User.find()
      .where({
        id: post.sharedWith,
        active: true
      })
      .exec(function(err, users){
        if(err){
          sails.log.error('Error on getUsersFromSharedWithField ',err);
          return callback(err,null);
        }

        callback(null, users);
      });
    }else{
      callback(null, []);
    }
  }
}
