FlowRouter.route('/', {
  triggersEnter: [function(context, redirect) {
    redirect('/home');
  }],
  action: function(_params) {}
});


var home = FlowRouter.group({
  prefix: '/home',
  name: 'home',
  triggersEnter: [function(context, redirect) {}]
});

home.route('/', {
  action: function() {
    ReactLayout.render(App);
  }
});
