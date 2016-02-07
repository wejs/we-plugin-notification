/**
 * notification controller
 *
 * @docs        :: http://wejs.org/docs/we/request-response.controllers
 */

module.exports = {
  getNotificationCount: function getNotificationCount( req, res ) {
    if(!req.isAuthenticated()) return req.forbidden();

    var read = req.query.read || false;

    req.we.db.models.notification.count({
      where: {
        user: req.user.id,
        read: Boolean (read)
      }
    }).then(function (count) {
      return res.send({ count: count });
    }).catch(req.queryError);
  },

  /**
   * Find current user notifications
   *
   */
  find: function findRecords (req, res) {
    if (!req.isAuthenticated()) return res.forbidden();

    if (req.query.read === 'all') {
      res.locals.isNAll = true;
      res.locals.title = res.locals.__('notification.find.all');
      res.locals.query.where.read = null;
    } else if (req.query.read === 'true'){
      res.locals.isReads = true;
      res.locals.title = res.locals.__('notification.find.read');
      res.locals.query.where.read = true;
    } else {
      res.locals.query.where.read = false;
      res.locals.isUnreads = true;
      res.locals.title = res.locals.__('notification.find.unread');
    }

    res.locals.query.where.userId = req.user.id;

    req.we.db.models.notification.findAll(res.locals.query)
    .then(function (r){

      res.locals.data = r;

      req.we.db.models.notification.count({
        where: {
          userId: req.user.id,
          read: res.locals.query.where.read
        }
      }).then(function (count){
        res.locals.metadata.count = count;
        res.ok();
      }).catch(req.queryError); // count
    }).catch(req.queryError); // findAll
  },

  create: function create(req, res) {
    return res.notFound();
  },

  /**
   * Update notification read status attr
   */
  setNotificationRead: function setNotificationRead (req, res) {
    if(!req.isAuthenticated()) return req.forbidden();

    var redirectTo = req.we.utils.getRedirectUrl(req, res);

    req.we.db.models.notification.findById(req.params.notificationId)
    .then(function (r) {
      if (!r) return res.notFound();
      // not is owner
      if (r.userId != req.user.id) return res.forbidden();

      var read;
      if (req.body.isRead == 'true') {
        read = true;
      } else {
        read = false;
      }

      if (r.read == read) {
        if (redirectTo) {
          return res.goTo(redirectTo);
        } else {
          return res.send({ notification: r });
        }
      }

      r.read = read;

      r.save().then(function() {
        if (req.we.io) {
          // emit to other users devices
          req.we.io.sockets.in('user_' + req.user.id)
          .emit('notification:update:read', {
            id: r.id, read: r.read
          });
        }

        if (redirectTo) {
          res.goTo(redirectTo);
        } else {
          res.send({ notification: r });
        }
      }).catch(req.queryError);
    }).catch(req.queryError);
  },

  markAllModelNotificationAsRead: function (req, res) {
    if(!req.isAuthenticated()) return req.forbidden();

    var model = req.params.model;
    var modelId = req.params.modelId;

    if ( !model && !modelId ) {
      return req.badRequest('model and modelId is required');
    }

    req.we.db.models.notification.update({
      read: true
    },{
      where: {
        user: req.user.id,
        read: false,
        modelName: model,
        modelId: modelId
      }
    }).then(function updated(records) {
      if (!records || !records.length) {
        // no unread notifications
        return res.send({});
      }

      // if success respond with updated notifications
      res.send({ notification: records });
    }).catch(res.queryError);
  },

  markAllNotificationAsRead: function (req, res) {
    if(!req.isAuthenticated()) return req.forbidden();

    req.we.db.models.notification.update({
      read: true
    },{
      where: {
        user: req.user.id,
        read: false
      }
    }).then(function updated(records) {
      if (!records || !records.length) {
        // no unread notifications
        return res.send({});
      }
      // if success respond with 200
      res.send({});
    }).catch(req.queryError);
  },

  /**
   * Redirect user to related model
   *
   */
  linkPermanent: function linkPermanent(req, res) {
    req.we.db.models.findById(req.params.id)
    .then(function (notification){
      if ( !notification ) {
        return res.notFound();
      }

      var url = '/' + notification.modelName + '/' + notification.modelId;

      return res.goTo(url);
    }).catch(res.queryError);
  }
};