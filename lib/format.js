
var S = require('string');

var formater = {};

formater.link = function(notification, sails) {
  return sails.config.hostname + '/link-permanent/notification/' + notification.id;
};

formater.contentTypeText = function(notification, sails) {
  return sails.__({
    phrase: 'post.contentType.' + notification.contentType,
    locale: notification.locale
  });
}

  /**
   * Format a notification in simple text
   *
   * @param  {object} notification notification record
   * @param  {object} sails        sails.js loaded object
   * @return {string}              formated and localized notification
   */
formater.simple = function(notification, sails) {
  if( !notification.contentTypeText ) {
    notification.contentTypeText = formater.contentTypeText(notification, sails);
  }

  return sails.__({
      phrase: 'notification.text.' + notification.model + '.' + notification.action,
      locale: notification.locale
    },
    notification
  );
}

  /**
   * Format a notification to send in email
   *
   * @param  {object} notification notification record
   * @param  {object} sails        sails.js loaded object
   * @return {string}              formated and localized notification
   */
formater.email = function(notification, sails) {
  if( !notification.contentTypeText ) {
    notification.contentTypeText = formater.contentTypeText(notification, sails);
  }

  return sails.__({
      phrase: 'notification.email.' + notification.model + '.' + notification.action,
      locale: notification.locale
    },
    notification
  );
};

  /**
   * Format a notification to send in email without HTML
   *
   * @param  {object} notification notification record
   * @param  {object} sails        sails.js loaded object
   * @return {string}              formated and localized notification
   */
formater.emailNoHTML = function(notification, sails) {
  if( !notification.contentTypeText ) {
    notification.contentTypeText = formater.contentTypeText(notification, sails);
  }

  return  S( sails.__({
      phrase: 'notification.email.' + notification.model + '.' + notification.action,
      locale: notification.locale
    },
    notification
  )).stripTags().s;
};

  /**
   * Format a email notification subject
   *
   * @param  {object} notification notification record
   * @param  {object} sails        sails.js loaded object
   * @return {string}              formated and localized subject
   */
formater.emailSubject = function(user, sails) {
  if( !user.hostname ) {
    user.hostname = sails.config.hostname;
    user.appName = sails.config.appName;
  }

  return sails.__({
      phrase: 'notifications.email.subject',
      locale: user.locale
    },
    user
  );
}

module.exports = formater;
