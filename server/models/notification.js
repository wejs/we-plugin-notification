/**
 * notification
 *
 * @module      :: Model
 * @description :: notification model
 *
 */

module.exports = function (we) {
  var model = {
    definition: {
      locale: {
        type: we.db.Sequelize.STRING,
        defaultValue: 'en-us'
      },
      /**
       * The notification title / text
       * @type {Object}
       */
      title: {
        type: we.db.Sequelize.TEXT,
        allowNull: false
      },
      /**
       * Teaser or small text with something related notified content
       * @type {Object}
       */
      text: {
        type: we.db.Sequelize.TEXT,
        allowNull: true
      },
      // url to redirect
      redirectUrl: {
        type: we.db.Sequelize.STRING,
        allowNull: false
      },

      // optional modelName and modelId

      modelName: {
        type: we.db.Sequelize.STRING
      },
      modelId: {
        type: we.db.Sequelize.INTEGER
      },

      /**
       * A small text to identify your notification type
       * @type {Object}
       */
      type: {
        type: we.db.Sequelize.STRING,
        allowNull: false
      },
      // extra actions to do, like accept or declive something
      actions: {
        type: we.db.Sequelize.BLOB,
        skipSanitizer: true,
        get: function()  {
          if (this.getDataValue('actions'))
            return JSON.parse( this.getDataValue('actions') );
          return {};
        },
        set: function(object) {
          if (typeof object == 'object') {
            this.setDataValue('actions', JSON.stringify(object));
          } else {
            throw new Error('invalid error in notification action value: ', object);
          }
        }
      },

      // if send the email notification
      emailSend: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: false
      },
      // if is read
      read: {
        type: we.db.Sequelize.BOOLEAN,
        defaultValue: false
      }
    },
    // Associations
    // see http://docs.sequelizejs.com/en/latest/docs/associations
    associations: {
      // user how will be notified
      user: {
        type: 'belongsTo',
        model: 'user',
        allowNull: false
      },
      // user how did the action, leave null for system notifications
      actor: {
        type: 'belongsTo',
        model: 'user',
        allowNull: false
      },
      settings: {
        type: 'hasOne',
        model: 'notificationSettings',
        otherKey: 'userId',
        foreignKey: 'userId',
        constraints: false
      }
    },
    options: {
      // title field, for default title record pages
      titleField: 'title',
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