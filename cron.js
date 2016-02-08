module.exports = function (we, done) {
  we.plugins['we-plugin-notification'].sendUsersEmailNotifications(we, done);
}