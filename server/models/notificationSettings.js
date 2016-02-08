/**
 * Notification Settings model
 *
 * @module      :: Model
 * @description :: Store user notification settings
 *
 */

module.exports = function (we) {
  var model = {
    // define you model here
    // see http://docs.sequelizejs.com/en/latest/docs/models-definition
    definition: {
      followingEmailNotificatins: {
        type: we.db.Sequelize.STRING,
        defaultValue: true,
        formFieldType: 'boolean'
      },

      /**
       * Notification email, leave empty to use user account email
       * @type {Object}
       */
      email: {
        type: we.db.Sequelize.STRING,
        allowNull: true,
        formFieldType: 'email'
      }
    },
    // Associations
    // see http://docs.sequelizejs.com/en/latest/docs/associations
    associations: {
      user: {
        type: 'belongsTo', model: 'user'
      }
    },
    options: {
      // disable alias feature to this model
      enableAlias: false,

      // title field, for default title record pages
      // titleField: 'title',

      // Class methods for use with: we.db.models.[yourmodel].[method]
      classMethods: {},
      // record method for use with record.[method]
      instanceMethods: {},
      // Sequelize hooks
      // See http://docs.sequelizejs.com/en/latest/api/hooks
      hooks: {}
    }
  };

  return model;
};