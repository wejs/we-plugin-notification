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

      title: {
        type: we.db.Sequelize.STRING,
        allowNull: false
      },
      text: {
        type: we.db.Sequelize.TEXT,
        allowNull: false
      },
      // Status: salved | unpublished | deleted ...
      status: {
        type: we.db.Sequelize.STRING,
        defaultValue: 'salved'
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
      },

      modelName: {
        type: we.db.Sequelize.STRING
      },
      modelId: {
        type: we.db.Sequelize.INTEGER
      },

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
            throw new Error('invalid error in notification configuration value: ', object);
          }
        }
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
      }
    },
    options: {
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