
$(function() {
  // set default notifications attrs
  App.Notification.reopen({
    user: DS.attr('string'),
    text: DS.attr('string'),
    textClean: DS.attr('string'),

    actor: DS.belongsTo('user', {async: true}),

    model: DS.attr('string'),
    action: DS.attr('string'),
    modelId: DS.attr('string'),

    relatedModel: DS.attr(),

    targetModelId: DS.attr('string'),
    targetModelType: DS.attr('string'),

    displayName: DS.attr('string'),
    locale: DS.attr('string'),
    contentType: DS.attr('string'),
    groupName: DS.attr('string'),
    groupId: DS.attr('string'),
    relatedContentTeaser: DS.attr('string'),

    // flag used to create the notification
    flagType: DS.attr('string'),

    notified: DS.attr('boolean',{
      defaultValue: false
    }),

    status: DS.attr('string'),

    read: DS.attr('boolean',{
      defaultValue: false
    }),

    createdAt: DS.attr('date')
  });

  App.NotificationAdapter = App.ApplicationRESTAdapter.extend();
});