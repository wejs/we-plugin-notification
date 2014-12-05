/**
 * We.js notifications lib
 * @type {Object} node module
 */
var WN = {};

// plugin init function
WN.init = require('./init.js');

var notificators = {};

WN.notify = function(modelName, action, record, actor, data) {
  var notificator = WN.getNotificator(modelName, action);
  sails.log.warn('notificator',modelName, action, notificator)
  if (notificator) {
    notificator(modelName, action, record, actor, data);
  } else {
    sails.log.verbose('Notificator not found',modelName, action, record, actor, data);
  }
}

// -- register and getter to set custom notifications

/**
 * Get one notification function
 *
 * @param  {string} modelName  modelName ex.: post
 * @param  {string} action     action ex.: created
 * @return {function|null}
 */
WN.getNotificator = function(modelName, action) {
  if( notificators[modelName] && notificators[modelName][action] ) {
    return notificators[modelName][action];
  }
  return null;
}

/**
 * Register or override one notification function
 *
 * @param  {string} modelName  modelName ex.: post
 * @param  {string} action     action ex.: created
 * @param  {function} action   function used to send the notification
 * @return {null}
 */
WN.registerNotificator = function (modelName, action, fn) {
  if ( !notificators[modelName] ) {
    notificators[modelName] = {};
  }
  notificators[modelName][action] = fn;
}

// load text formaters
WN.format = require('./format.js');
// load email feature
WN.email = require('./email.js');
// load follow feature
WN.follow = require('./follow.js');

// pre register default notifications
notificators.contact = require('./notifications/contact.js');
notificators.post = require('./notifications/post.js');
notificators.comment = require('./notifications/comment.js');
notificators.mention = require('./notifications/mention.js');

module.exports = WN;
