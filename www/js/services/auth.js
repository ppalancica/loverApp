'use strict';

// app.factory('Auth', function(FURL, $firebaseAuth, $firebaseObject, $state) {
// app.factory('Auth', function($firebaseAuth, $firebaseObject, $state) {
// app.factory('Auth', function($firebaseAuth, $firebaseObject, $state, $http) {
app.factory('Auth', function($firebaseAuth, $firebaseObject, $state, $http, $q) {

  // var ref = new Firebase(FURL);
  // var auth = $firebaseAuth(ref);
  var ref = firebase.database().ref();

  var auth = $firebaseAuth();

  var Auth = {

    createProfile: function(uid, profile) {
      // var profile = {
      //   name: auth.displayName,
      //   gender: auth.cachedUserProfile.gender,
      //   email: auth.email,
      //   avatar: auth.profileImageURL,
      //   birthday: auth.cachedUserProfile.birthday,
      //   location: auth.cachedUserProfile.location.name
      // };

      return ref.child('profiles').child(uid).set(profile);
    },

    getProfile: function(uid) {
      return $firebaseObject(ref.child('profiles').child(uid));
    },

    // login: function() {
    //   return auth.$authWithOAuthPopup('facebook', {
    //     remember: "sessionOnly",
    //     scope: "public_profile, email, user_location, user_birthday, user_photo, user_about_me"
    //   });
    // },
    // login: function() {
    //   return auth.$signInWithPopup('facebook');
    // },
    login: function() {
      var provider = new firebase.auth.FacebookAuthProvider();
      // provider.addScope('public_profile, email, user_location, user_birthday, user_photos, user_about_me');
      provider.addScope('public_profile, email, user_location, user_birthday, user_photos');

      return auth.$signInWithPopup(provider)

        .then(function(result) {

          var accessToken = result.credential.accessToken;
          var user = Auth.getProfile(result.user.uid).$loaded();

          user.then(function(profile) {
            //console.log('user = ' + user);
            if (profile.name == undefined) {

              // var info = result.user.providerData[0];
              // var profile = {
              //   name: info.displayName,
              //   email: info.email,
              //   avatar: info.photoURL,
              // }
              // Auth.createProfile(result.user.uid, profile);

              var genderPromise = $http.get('https://graph.facebook.com/me?fields=gender&access_token=' + accessToken);
              var birthdayPromise = $http.get('https://graph.facebook.com/me?fields=birthday&access_token=' + accessToken);
              var locationPromise = $http.get('https://graph.facebook.com/me?fields=location&access_token=' + accessToken);
              var bioPromise = $http.get('https://graph.facebook.com/me?fields=about&access_token=' + accessToken);
              var imagesPromise = $http.get('https://graph.facebook.com/me/photos/uploaded?fields=source&access_token=' + accessToken);
              var promises = [genderPromise, birthdayPromise, locationPromise, bioPromise, imagesPromise];

              $q.all(promises).then(function(data) {
                var info = result.user.providerData[0];
                var profile = {
                  name: info.displayName,
                  email: info.email,
                  avatar: info.photoURL,
                  gender: data[0].data.gender ? data[0].data.gender : "",
                  birthday: data[1].data.birthday ? data[1].data.birthday : "",
                  age: data[1].data.birthday ? Auth.getAge(data[1].data.birthday) : "",
                  location: data[2].data.location ?  data[2].data.location.name : "",
                  bio: data[3].data.about ? data[3].data.about : "",
                  images: data[4].data.data
                }
                //console.log('profile = ' + profile);
                Auth.createProfile(result.user.uid, profile);
              });
            }
          });
        });
    },

    // logout: function() {
    //   return auth.$unauth();
    // }
    logout: function() {
      return auth.$signOut();
    },

    // getAbout: function(access_token) {
    //   return $http.get('https://graph.facebook.com/me?fields=bio&access_token=' + access_token);
    // },
    //
    // getImages: function(access_token) {
    //   return $http.get('https://graph.facebook.com/me/photos/uploaded?fields=source&access_token=' + access_token);
    // },

    getAge: function(birthday) {
      return new Date().getFullYear() - new Date(birthday).getFullYear();
    },

    requireAuth: function() {
      // return auth.$requireAuth();
      return auth.$requireSignIn();
    }
  }

  // auth.$onAuth(function(authData) {
  //   if (authData) {
  //     console.log('Logged in!');
  //   } else {
  //     $state.go('login');
  //     console.log('You need to login.');
  //   }
  // });

  auth.$onAuthStateChanged(function(authData) {
    if (authData) {
        console.log('Logged in!');

        // Auth.getAbout(authData.facebook.accessToken).then(function(object) {
        //   console.log(object.data.bio);
        // });
        //
        // Auth.getImages(authData.facebook.accessToken).then(function(object) {
        //   console.log(object.data.data);
        // });
    } else {
        $state.go('login');
        console.log('You need to login.');
    }
  });

  return Auth;
});
