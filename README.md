# We.js Notification plugin

[![Dependency Status](https://david-dm.org/wejs/we-plugin-notification.png)](https://david-dm.org/wejs/we-plugin-notification)

> Send notifications to your users, this plugin is inspered in github notifications

## API:

> Authenticated user notifications is avaible at */notification* page or API endpoint

### How to register one new notification:

```js
// after create register one notifications
we.db.models.notification.create({
  locale: res.locals.locale,
  // use i18n to localize your notification title after save like in this example
  title: res.locals.__('post.image.create.notification.title'),
  // text related to your notification, may be one teaser
  text: 'bla, bla, bla ... text here',
  // this url is used to redirect use to related content
  // add hostname for compatibility with emails
  redirectUrl: hostname+'/post/'+record.id,
  // user id of user how will be notified
  userId: 10,
  // user how did the notified action, optional
  actorId: actor.id,
  // model name, optional
  modelName: 'post',
  // model id, optional  
  modelId: record.id,
  // type may be used for show icons or 
  // custom css in your notification
  type: 'post-created-in-group'
}).then(function (r) {
  // done!
  // continue with your logic here ...
}).catch(done);
```

## URLs

See **plugin.js** file

#### NPM Info:
[![NPM](https://nodei.co/npm/we-plugin-notification.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/we-plugin-notification/)

## License

[the MIT license](LICENSE).
