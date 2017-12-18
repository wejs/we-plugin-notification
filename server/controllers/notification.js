/**
 * notification controller
 *
 * @docs        :: http://wejs.org/docs/we/request-response.controllers
 */

module.exports = {
  getNotificationCount( req, res ) {
    if(!req.isAuthenticated()) return res.forbidden();

    let read = req.query.read || false;

    req.we.db.models.notification
    .count({
      where: {
        userId: req.user.id,
        read: Boolean (read)
      }
    })
    .then( (count)=> {
      res.send({ count: count });
      return null;
    })
    .catch(res.queryError);
  },

  /**
   * Find current user notifications
   *
   */
  find(req, res) {
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

    req.we.db.models.notification
    .findAll(res.locals.query)
    .then( (r)=> {

      res.locals.data = r;

      return req.we.db.models.notification
      .count({
        where: {
          userId: req.user.id,
          read: res.locals.query.where.read
        }
      })
      .then( (count)=> {
        res.locals.metadata.count = count;
        res.ok();
        return null;
      });
    })
    .catch(res.queryError); // findAll
  },

  create(req, res) {
    return res.notFound();
  },

  /**
   * Update notification read status attr
   */
  setNotificationRead(req, res) {
    if(!req.isAuthenticated()) return res.forbidden();

    let redirectTo = req.we.utils.getRedirectUrl(req, res);

    req.we.db.models.notification
    .findById(req.params.notificationId)
    .then( (r)=> {
      if (!r) {
        res.notFound();
        return null;
      }
      // not is owner
      if (r.userId != req.user.id) {
        res.forbidden();
        return null;
      }

      let read;
      if (req.body.isRead == 'true') {
        read = true;
      } else {
        read = false;
      }

      if (r.read == read) {
        if (redirectTo) {
          res.goTo(redirectTo);
        } else {
          res.send({ notification: r });
        }
        return null;
      }

      r.read = read;

      r.save()
      .then( ()=> {
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

        return null;
      })
      .catch(res.queryError);
    })
    .catch(res.queryError);
  },

  markAllModelNotificationAsRead(req, res) {
    if(!req.isAuthenticated()) return res.forbidden();

    const model = req.params.model;
    const modelId = req.params.modelId;

    if ( !model && !modelId ) {
      res.badRequest('model and modelId is required');
      return null;
    }

    req.we.db.models.notification
    .update({
      read: true
    },{
      where: {
        user: req.user.id,
        read: false,
        modelName: model,
        modelId: modelId
      }
    })
    .then(function updated(records) {
      if (!records || !records.length) {
        // no unread notifications
        res.send({});
      } else {
        // if success respond with updated notifications
        res.send({ notification: records });
      }
      return null;
    })
    .catch(res.queryError);
  },

  markAllNotificationAsRead(req, res) {
    if(!req.isAuthenticated()) return res.forbidden();

    let redirectTo = req.we.utils.getRedirectUrl(req, res);

    req.we.db.models.notification
    .update({
      read: true
    },{
      where: {
        userId: req.user.id,
        read: false
      }
    })
    .then(function updated() {
      if (redirectTo) {
        res.goTo(redirectTo);
      } else {
        res.send({});
      }
      return null;
    })
    .catch(res.queryError);
  },

  /**
   * Redirect user to related model
   *
   */
  linkPermanent(req, res) {
    req.we.db.models
    .findById(req.params.id)
    .then( (notification)=> {
      if ( !notification ) {
        res.notFound();
      } else {
        let url = '/' + notification.modelName + '/' + notification.modelId;
        res.goTo(url);
      }

      return null;
    })
    .catch(res.queryError);
  },

  userNotificationSettings(req, res) {
    if (!req.isAuthenticated()) return res.forbidden();

    if (!res.locals.data) res.locals.data = {};

    res.locals.Model
    .findOne({
      userId: req.user.id
    })
    .then( (record)=> {

      if (req.method == 'POST') {
        if (!record) {
          //create
          return res.locals.Model
          .create(req.body)
          .then( (record)=> {
            res.locals.data = record;
            res.ok();
            return null;
          })
          .catch(res.queryError);
        } else {
          // update
          return record.updateAttributes(req.body)
          .then( ()=> {
            res.locals.data = record;
            res.ok();
            return null;
          })
          .catch(res.queryError);
        }
      } else {
        res.locals.data = record;
        res.ok();
      }

      return null;
    })
    .catch(res.queryError);
  }
};