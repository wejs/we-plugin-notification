(function($, Ember, App){

  App.NotificationsItemController = Ember.ObjectController.extend({
    linkBaseClass: '',
    loadingRelatedModel: false,

    notificationType: '',

    itemClass: function(){
      if(this.get('read')){
        return this.get('linkBaseClass') + ' read';
      }else{
        return this.get('linkBaseClass') + ' unread';
      }
    }.property('read'),

    linkStatusText: function(){
      if(this.get('read')){
        return 'Não Lida';
      }else{
        return 'Lida';
      }
    }.property('read'),
    status: 'salved',

    text: function() {
      return  ''
    }.property('relatedModel.id', 'actor.displayName'),

    init: function(){
      this._super();
      var self = this;

      var model = self.get('model.model');
      var modelId = self.get('model.modelId');
      var action = self.get('model.action');

      if (!this.get('model.relatedModel')) {
        self.set('loadingRelatedModel', true);

        if (model && modelId) {
          this.get('store').find(model, modelId).then(function(relatedModel){
            self.set('model.relatedModel', relatedModel);
            self.set('loadingRelatedModel', false);

            if ( model == 'contact') {
              if( relatedModel.get('status') ) {
                self.set(relatedModel.get('status'), true);
              }
            }
          });
        }
      }

      var notificationType = model + '_' + action;

      self.set('notificationType', notificationType);

      self.set(notificationType, true);
    },

    actions: {
      changeNotificedStatus: function(){
        if(this.get('read')){
          this.send('marcarComoNaoLida');
        }else{
          this.send('marcarComoLida');
        }
      },
      marcarComoLida: function() {
        var model = this.get('model');
        model.set('read', true);
        model.save()
        .catch (function(resp) {
          Ember.Logger.error('Error on update notiifcation',model, resp);
        });
      },
      marcarComoNaoLida: function(){
        var model = this.get('model');
        model.set('read', false);
        model.save()
        .catch (function(resp){
          Ember.Logger.error('Error on update notiifcation',model, resp);
        });
      },
      onClickInText: function() {
        var model = this.get('model');
        var modelName = model.get('model');
        var modelId = model.get('modelId');
        var targetModelType = model.get('targetModelType');
        var targetModelId = model.get('targetModelId');

        // if not read save as read
        if( !model.get('read') ) {
          model.set('read', true);
          model.save();
        }

        if ( modelName == 'contact') {
          modelName = 'user';
        }

        if ( modelName == 'comment') {
          modelName = 'post';
        }

        if( targetModelType && targetModelId ) {
          return this.transitionToRoute( targetModelType, targetModelId );
        }

        if( modelName && modelId ) {
          return this.transitionToRoute( modelName, modelId );
        }

      }
    }
  });

})(jQuery, Ember, App);
