
module.exports = {
  getUsersToNotify: function getUsersToNotify(modelName, action, model, actorId, callback){
    var usersToNotify = [];

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

    // run query with assync
    async.parallel(queryGetters,
    // optional callback
    function(err, results){
      if (err) {
        return callback(err, null);
      }

      // for each result
      for (var i = results.length - 1; i >= 0; i--) {
        // for each user
        for (var j = results[i].length - 1; j >= 0; j--) {
          usersToNotify.push(results[i][j]);
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
