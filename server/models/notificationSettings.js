/**
 * Notification Settings model
 *
 * @module      :: Model
 * @description :: Store user notification settings
 *
 */

module.exports = function (we) {
  const model = {
    // define you model here
    // see http://docs.sequelizejs.com/en/latest/docs/models-definition
    definition: {
      followingEmailNotifications: {
        type: we.db.Sequelize.BOOLEAN,
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

      instanceMethods: {
        getUrlPath: null
      }
    }
  };

  return model;
};