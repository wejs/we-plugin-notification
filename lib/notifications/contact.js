
module.exports = {
  requested: function notifyContactRequest(modelName, action, contactModel, from, to) {

    if (!from || !to) {
      sails.log.warn('To or from user is required for notification.contact.requestd', to, from);
      return;
    }

    var locale = to.language;
    if (!locale) {
      locale = sails.config.i18n.defaultLocale;
    }

    var newNotification = {
      user: contactModel.to,
      model: 'contact',
      modelId: contactModel.id,
      action: 'requested',
      actor: from.id,

      locale: locale,

      targetModelType: 'user',
      targetModelId: from.id,
      displayName: from.displayName
    }

    Notification.create(newNotification)
    .exec(function(error) {
      if (error) {
        return sails.log.error('Error on notifyContactRequest Notification.create', error);
      }
    });

  },

  accepted: function notifyContactAccept(modelName, action, contactModel, to) {
    // load from user
    User.findOneById(contactModel.from)
    .exec(function (err, from) {
      if (err) {
        return sails.log.error('notifyContactRequest:Error on get from user',err, contactModel);
      }

      if (!to || !from) {
        return;
      }

      var locale = from.language;
      if (!locale) {
        locale = sails.config.i18n.defaultLocale;
      }

      var newNotification = {
        user: contactModel.from,
        model: 'contact',
        modelId: contactModel.id,
        action: 'accepted',
        actor: to.id,

        locale: locale,

        targetModelType: 'user',
        targetModelId: to.id,
        displayName: to.displayName,
        groupName: null,
        groupId: null,
        contentType: null,
        relatedContentTeaser: null
      }

      Notification.create(newNotification)
      .exec(function(error) {
        if (error) {
          return sails.log.error('Error on notifyContactRequest Notification.create', error);
        }
      });
    })
  }
}
