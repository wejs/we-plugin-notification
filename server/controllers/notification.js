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
  findCurrentUserNotifications: function findRecords (req, res) {
    if (!req.isAuthenticated()) return res.forbidden();

    if (req.params.read === 'all') {
      res.locals.query.read = null;
    } else {
      res.locals.query = Boolean(req.params.read);
    }

    res.locals.query.user = req.params.user;

    req.we.db.models.notification.findAll(res.locals.query)
    .then(function (r){
      res.locals.data = r;
      res.ok();
    }).catch(req.queryError);
  },

  /**
   * Update notification read status attr
   */
  setNotificationRead: function setNotificationRead (req, res) {
    if(!req.isAuthenticated()) return req.forbidden();

    req.we.db.models.notification.findById(req.params.notificationId)
    .then(function(r){
      if (!r) return res.notFound();

      if (req.params.isRead == 'true') {
        r.read = true;
      } else {
        r.read = false;
      }

      r.save().then(function(){
        res.send({ notification: r });
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