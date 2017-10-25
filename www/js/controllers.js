angular.module('starter.controllers', ['ngCordova'])

.factory("Auth", ["$firebaseAuth",
  function($firebaseAuth) {
    return $firebaseAuth();
  }
])
.factory("UserFirebase", function($firebaseArray, $firebaseStorage) {
  return {
    userDatabaseRef:function(userid){
      var ref = firebase.database().ref();
      var database = ref.child("users").child(userid).child("posts");
      return database;
    },
    userDatabase: function(userid){
      var ref = firebase.database().ref();
      var database = ref.child("users").child(userid).child("posts");
      return $firebaseArray(database);
    },
    userStorage: function(userid){
      var ref = firebase.database().ref();
      var storage = firebase.storage().ref("userPosts/"+userid);
      return $firebaseStorage(storage);
    }
  }
})
.controller('MainCtrl', function($scope, $stateParams, $state, Auth, $firebaseArray, UserFirebase) {
  $scope.firebaseUser = {};
  $scope.auth = Auth;
  $scope.auth.$onAuthStateChanged(function(firebaseUser) {
    $scope.firebaseUser = firebaseUser;
    console.log(firebaseUser);
    if(!$scope.firebaseUser){
      $state.go('login');
    }else{
      $state.go("tab.timeline");
    }
    $scope.myPosts = UserFirebase.userDatabase($scope.firebaseUser.uid);
    console.log($scope.myPosts);
    console.log($scope.firebaseUser);
    // $scope.refDatabaseUser = firebase.database().ref().child($scope.firebaseUser.uid);
    // $scope.refDatabaseObj = $firebaseArray($scope.refStorage);
    // $Scope.refStorageUser = firebase.storage().ref("userPosts/"+$scope.firebaseUser.uid);
    // $scope.refStorageUserObj = $firebaseStorage($Scope.refStorageUser);
    // $scope.refStoragePostSingle = $firebaseArray(firebase.database().ref().child($scope.firebaseUser.uid));
    console.log("inside the main controller");
  });
  
})

.controller('LoginCtrl', function($scope, $stateParams, $state, Auth) {
  $scope.user = {};
  $scope.SignIn = function (){
    Auth.$signInWithEmailAndPassword($scope.user.email, $scope.user.password).then(function(result) {
      $state.go("tab.timeline");
    });
  }
})

.controller('RegisterCtrl', function($scope, $stateParams, $state, $window, Auth) {
  $scope.user = {};

  $scope.SignUp = function (){
    Auth.$createUserWithEmailAndPassword($scope.user.email,$scope.user.password)
    .then(function(firebaseUser) {
      $scope.message = "User created with uid: " + firebaseUser.uid;
      firebaseUser.updateProfile({
        displayName: $scope.user.name
      }).then(function() {}, function(error) {
      });
      $state.go("tab.timeline");
    }).catch(function(error) {
      $window.alert(error.message);
    });
  }
})

.controller('TimelineCtrl', function($scope, $ionicModal, $cordovaCamera, $state, $timeout, UserFirebase, $firebaseObject) {
  $scope.title = 'modal';
  $scope.post = {};
  $scope.test =  [{'nome': 'Rafael'},{'nome': 'Ramon'}];
  
  console.log($scope.myPosts);
  $ionicModal.fromTemplateUrl('templates/modal-timeline.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });

  $scope.takePhoto = function () {
    var options = {
      quality: 80,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 400,
      targetHeight: 400,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
  };
  $cordovaCamera.getPicture(options).then(function (imageData) {
        $scope.post.image = "data:image/jpeg;base64," + imageData;

        // saveToFirebase($scope.imgURI);
    }, function (err) {
        // An error occured. Show a message to the user
    });
  }
  
  $scope.choosePhoto = function () {
    var options = {
      quality: 80,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 400,
      targetHeight: 400,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
  };

      $cordovaCamera.getPicture(options).then(function (imageData) {
          $scope.post.image = "data:image/jpeg;base64," + imageData;
      }, function (err) {
          // An error occured. Show a message to the user
      });
  }
  $scope.newPost = function(){
    var obj = {};
    UserFirebase.userDatabase($scope.firebaseUser.uid).$add({}).then(function(result){
      obj = $firebaseObject(UserFirebase.userDatabaseRef($scope.firebaseUser.uid).child(result.key));
      obj.description = $scope.post.description || '';
      obj.postDate = Date.now();
      obj.$save().then(function(ref) {
        ref.key === obj.$id; // true
      }, function(error) {
        console.log("Error:", error);
      });
      if($scope.post.image){
        var stringUploadTask = UserFirebase.userStorage($scope.firebaseUser.uid).$putString($scope.post.image.replace('data:image/jpeg;base64,',''), 'base64');
        stringUploadTask.$complete(function(snapshot) {
          obj.image = snapshot.downloadURL;
          obj.$save().then(function(ref) {
            ref.key === obj.$id; // true
          }, function(error) {
            console.log("Error:", error);
          });
        });
      }

       $scope.modal.hide();
    }, function(error) {
      console.log(error);
    });
    
  };
})
.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('RecipesCtrl', function($scope, $ionicModal, $cordovaCamera) {
  $scope.settings = {
    enableFriends: true
  };
     $ionicModal.fromTemplateUrl('templates/modal-recipes.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });

  $scope.takePhoto = function () {
    var options = {
      quality: 80,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 400,
      targetHeight: 400,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
  };
  $cordovaCamera.getPicture(options).then(function (imageData) {
        $scope.imgURI = "data:image/jpeg;base64," + imageData;
    }, function (err) {
        // An error occured. Show a message to the user
    });
  }
  
  $scope.choosePhoto = function () {
    var options = {
      quality: 80,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 400,
      targetHeight: 400,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
  };

      $cordovaCamera.getPicture(options).then(function (imageData) {
          $scope.imgURI = "data:image/jpeg;base64," + imageData;
      }, function (err) {
          // An error occured. Show a message to the user
      });
  }
})

.controller('ProfileCtrl', function($scope, $stateParams, $cordovaCamera, $ionicModal) {
  $scope.test = [{'nome': 'Rafael'},{'nome': 'Ramon'}];

 $ionicModal.fromTemplateUrl('templates/modal-settings.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });

  $scope.takePhoto = function () {
    var options = {
      quality: 80,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 400,
      targetHeight: 400,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
  };
  $cordovaCamera.getPicture(options).then(function (imageData) {
        $scope.imgURI = "data:image/jpeg;base64," + imageData;
    }, function (err) {
        // An error occured. Show a message to the user
    });
  }
  $scope.choosePhoto = function () {
    var options = {
      quality: 80,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 400,
      targetHeight: 400,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
  };

      $cordovaCamera.getPicture(options).then(function (imageData) {
          $scope.imgURI = "data:image/jpeg;base64," + imageData;
      }, function (err) {
          // An error occured. Show a message to the user
      });
  }
})

.controller('EventsCtrl', function($scope, $ionicModal, $cordovaCamera) {
  $scope.settings = {
    enableFriends: true
  };
  $ionicModal.fromTemplateUrl('templates/modal-events.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
  
  $scope.choosePhoto = function () {
    var options = {
      quality: 80,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      targetWidth: 400,
      targetHeight: 400,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
  };

      $cordovaCamera.getPicture(options).then(function (imageData) {
          $scope.imgURI = "data:image/jpeg;base64," + imageData;
      }, function (err) {
          // An error occured. Show a message to the user
      });
  }
})
/*
.controller('RestaurantsCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})
;*/

.controller('RestaurantsCtrl', function($scope, $ionicLoading) {

    google.maps.event.addDomListener(window, 'load', function() {
        var myLatlng = new google.maps.LatLng(37.3000, -120.4833);

        var mapOptions = {
            center: myLatlng,
            zoom: 16,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var map = new google.maps.Map(document.getElementById("map"), mapOptions);

        navigator.geolocation.getCurrentPosition(function(pos) {
            map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
            var myLocation = new google.maps.Marker({
                position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
                map: map,
                title: "My Location"
            });
        });
        $scope.map = map;
    });
});


