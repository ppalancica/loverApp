'use strict';

app.controller('AuthCtrl', function(Auth, $state) {

  var auth = this;

  auth.login = function() {
    console.log('Login clicked');

    // var user = Auth.login();
    // console.log(user.facebook);
    return Auth.login().then(function(result) {
      // console.log(result.user);
      $state.go('app.home');
    });
  };

  auth.logout = function() {
    Auth.logout();
  };
});
