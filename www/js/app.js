// Voce application initialization code
var voceApp = angular.module('starter', ['ionic','ngCordova', 'firebase']);
var fb = new Firebase("https://voce.firebaseio.com/");

.constant('ApiEndpoint', {
  url: 'http://localhost:8100/addUser'
})

// .constant('ApiEndpoint', {
//   url: 'http://localhost:3000/addUser'
// })

voceApp.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {

    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

// Voce application configuration
voceApp.config(function($stateProvider, $urlRouterProvider){
  $stateProvider.state('firebase',{
    url:'/firebase',
    templateUrl:'templates/firebase.html',
    controller: 'FirebaseController',
    cache: false
  })
  .state('secure',{
    url: '/secure',
    templateUrl: 'templates/secure.html',
    controller: 'SecureController'
  })
  .state('photo',{
    url: '/photo',
    templateUrl: 'templates/photo.html',
    controller: 'PhotoController'
  })
  .state('gallery',{
    url: '/gallery',
    templateUrl: 'templates/gallery.html',
    controller: 'GalleryController'
  })
  .state('track',{
    url: '/track',
    templateUrl: 'templates/track.html',
    controller: 'TrackController'
  })
  .state('following',{
    url: '/following',
    templateUrl: 'templates/following.html',
    controller: 'FollowingController'
  })
  .state('runway',{
    url: '/runway',
    templateUrl: 'templates/runway.html',
    controller: 'RunwayController'
  })
  $urlRouterProvider.otherwise("/firebase");
});

// Firebase login screen controller
voceApp.controller("FirebaseController", function($scope, $state, $firebaseAuth){

    var fbAuth = $firebaseAuth(fb);

    $scope.login = function(username, password){
        var url = "http://localhost:3000/addUser";
        xmlhttp = new XMLHttpRequest();
        xmlhttp.open("POST", url, true);
        xmlhttp.send();
        xmlhttp.onreadystatechange = function () {
        	if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        	   alert('Login Successful');
        	} else if (xmlhttp.status == 401) {
        	   alert('Unauthorized');
        	}
        }
    }

  $scope.register = function(username, password) {
        fbAuth.$createUser({email: username, password: password}).then(function(userData) {
            return fbAuth.$authWithPassword({
                email: username,
                password: password
            });
        }).then(function(authData) {
            $state.go("secure");
        }).catch(function(error) {
            console.error("ERROR: " + error);
        });
    }

});

function chunk(arr, size) {
  var newArr = [];
  for (var i=0; i<arr.length; i+=size) {
    newArr.push(arr.slice(i, i+size));
  }
  return newArr;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// Secure home controller ////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
voceApp.controller("SecureController", function($scope,$state, $ionicHistory){

  $ionicHistory.clearHistory();
  $scope.homeIcons = [];

  var fbAuth =  fb.getAuth();
  if(fbAuth){
    $ionicHistory.clearHistory();
    var userReference = fb.child("users/" + fbAuth.uid);
    $scope.cols = 2;
    $scope.homeIcons = chunk([{'id':'photo','value':'Submit'}, {'id':'track','value':'Track'}, {'id':'gallery','value':'Saved'}, {'id':'following','value':'Following'}, {'id':'runway','value':'Runway'}], 2);
  } else {
    $state.go('firebase');
  }

  $scope.navigateTo = function(id){
    $state.go(id);
  }

  $scope.rowClass = function(className){
      return className;
  };

});

/////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////// Photo screen controller ///////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
voceApp.controller("PhotoController", function($scope, $state, $ionicHistory, $firebaseArray, $cordovaCamera, $ionicModal){

  $scope.images = [];

  var fbAuth =  fb.getAuth();
  if(fbAuth){
    var userReference = fb.child("users/" + fbAuth.uid);
    var syncArray = $firebaseArray(userReference.child('images'));
    $scope.images = syncArray;
  } else {
    $state.go('firebase');
  }

  $scope.choosePicture = function() {
    var options = {
        quality : 75,
        destinationType : Camera.DestinationType.DATA_URL,
        sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit : true,
        encodingType: Camera.EncodingType.JPEG,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };
      $cordovaCamera.getPicture(options).then(function(imageData) {
          syncArray.$add({image: imageData}).then(function() {
              alert("Image has been uploaded");
          });
      }, function(error) {
          console.error(error);
      });
    }

    // testing
   $scope.takePicture = function() {
      var options = {
          quality : 75,
          destinationType : Camera.DestinationType.DATA_URL,
          sourceType : Camera.PictureSourceType.CAMERA,
          allowEdit : true,
          encodingType: Camera.EncodingType.JPEG,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false
      };
      $cordovaCamera.getPicture(options).then(function(imageData) {
          syncArray.$add({image: imageData}).then(function() {
              alert("Image has been uploaded");
          });
      }, function(error) {
          console.error(error);
      });
    }

    // Ionic Modal code to display images in full screen
    $scope.showImages = function(index) {
      $scope.activeSlide = index;
      $scope.showModal('templates/image-popover.html');
    }

    $scope.showModal = function(templateUrl) {
      $ionicModal.fromTemplateUrl(templateUrl, {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    }

    // Close the modal
    $scope.closeModal = function() {
        $scope.modal.hide();
        $scope.modal.remove()
    };

});

/////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////// Following home controller ////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
voceApp.controller("FollowingController", function($scope,$state, $ionicHistory){

  var fbAuth =  fb.getAuth();
  if(fbAuth){
    $ionicHistory.clearHistory();
    var userReference = fb.child("users/" + fbAuth.uid);
    $scope.cols = 2;
    $scope.homeIcons = chunk([{'id':'photo','value':'Submit'}, {'id':'track','value':'Track'}, {'id':'gallery','value':'Saved'}, {'id':'following','value':'Following'}, {'id':'runway','value':'Runway'}], 2);
  } else {
    $state.go('firebase');
  }

});

/////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// Track home controller ////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
voceApp.controller("TrackController", function($scope, $state, $ionicHistory, $firebaseArray, $cordovaCamera, $ionicModal){

    $scope.images = [];

    var fbAuth =  fb.getAuth();
    if(fbAuth){
      var userReference = fb.child("users/" + fbAuth.uid);
      var syncArray = $firebaseArray(userReference.child('images'));
      $scope.images = syncArray;
    } else {
      $state.go('firebase');
    }

    // Ionic Modal code to display images in full screen
    $scope.showImages = function(index) {
      $scope.activeSlide = index;
      $scope.showModal('templates/image-popover.html');
    }

    $scope.showModal = function(templateUrl) {
      $ionicModal.fromTemplateUrl(templateUrl, {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    }

    // Close the modal
    $scope.closeModal = function() {
        $scope.modal.hide();
        $scope.modal.remove()
    };

});

/////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// Runway home controller ///////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
voceApp.controller("RunwayController", function($scope,$state, $ionicHistory){

  var fbAuth =  fb.getAuth();
  if(fbAuth){
    $ionicHistory.clearHistory();
    var userReference = fb.child("users/" + fbAuth.uid);
    $scope.cols = 2;
    $scope.homeIcons = chunk([{'id':'photo','value':'Submit'}, {'id':'track','value':'Track'}, {'id':'gallery','value':'Saved'}, {'id':'following','value':'Following'}, {'id':'runway','value':'Runway'}], 2);
  } else {
    $state.go('firebase');
  }

});

/////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////// Gallery home controller //////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
voceApp.controller("GalleryController", function($scope,$state, $ionicHistory){

  var fbAuth =  fb.getAuth();
  if(fbAuth){
    $ionicHistory.clearHistory();
    var userReference = fb.child("users/" + fbAuth.uid);
    $scope.cols = 2;
    $scope.homeIcons = chunk([{'id':'photo','value':'Submit'}, {'id':'track','value':'Track'}, {'id':'gallery','value':'Saved'}, {'id':'following','value':'Following'}, {'id':'runway','value':'Runway'}], 2);
  } else {
    $state.go('firebase');
  }

});
