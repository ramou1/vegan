   angular.module('starter.controllers', ['ngCordova'])

   .factory("Auth", ["$firebaseAuth",
     function($firebaseAuth) {
       return $firebaseAuth();
     }
     ])
   .factory("UserFirebase", function($firebaseArray, $firebaseStorage) {
     var ref = firebase.database().ref();
     return {
       userDatabaseRef:function(userid){
         var database = ref.child("users").child(userid).child("posts");
         return database;
       },
       userDatabase: function(userid){
         var database = ref.child("users").child(userid).child("posts");
         return $firebaseArray(database);
       },
       userStorage: function(userid){
         var storage = firebase.storage().ref("userPosts/"+userid);
         return $firebaseStorage(storage);
       },
       userRecipesDatabaseRef: function(userid){
         var database = ref.child("users").child(userid).child("recipes");
         return database;
       },
       userRecipesDatabase: function(userid){
         var database = ref.child("users").child(userid).child("recipes");
         return $firebaseArray(database);
       },
       userRecipeStorage: function(userid){
         var storage = firebase.storage().ref("userRecipes/"+userid);
         return $firebaseStorage(storage);
       },
       userEventsDatabaseRef: function(userid){
         var database = ref.child("users").child(userid).child("events");
         return database;
       },
       userEventsDatabase: function(userid){
         var database = ref.child("users").child(userid).child("events");
         return $firebaseArray(database);
       },
       userEventStorage: function(userid){
         var storage = firebase.storage().ref("userEvents/"+userid);
         return $firebaseStorage(storage);
       }
     }
   })
   .controller('MainCtrl', function($scope, $stateParams, $state, Auth, $firebaseArray, UserFirebase, $ionicLoading, $ionicPopup, $timeout) {
     $scope.firebaseUser = {};
     $scope.auth = Auth;
     $scope.auth.$onAuthStateChanged(function(firebaseUser) {
      $timeout(function(){
       $scope.firebaseUser = firebaseUser;
      },0);
       if(!$scope.firebaseUser){
         $state.go('login');
       }else{
         $state.go("tab.timeline");
       }
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

   .controller('RegisterCtrl', function($scope, $stateParams, $state, $window, Auth, $ionicPopup) {
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
         $ionicPopup.alert({
           title: 'Ops...',
           template: error.message
         });
       });
     }
   })

   .controller('TimelineCtrl', function($scope, $ionicModal, $cordovaCamera, $state, $timeout, UserFirebase, $firebaseObject, $ionicPopup) {
     $scope.title = 'modal';

   $ionicModal.fromTemplateUrl('templates/modal-comments.html', {
     scope: $scope,
     animation: 'slide-in-up'
   }).then(function(modal) {
     $scope.modal2 = modal;
   });
   $scope.openComments = function() {
     $scope.modal2.show();
   };
   $scope.closeComments = function() {
     $scope.modal2.hide();
   };
   // Cleanup the modal when we're done with it!
   $scope.$on('$destroy', function() {
     $scope.modal2.remove();
   });
   // Execute action on hide modal
   $scope.$on('modal2.hidden', function() {
   // Execute action
   });
   // Execute action on remove modal
   $scope.$on('modal2.removed', function() {
   // Execute action
   });

   
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

   .controller('RecipesCtrl', function($scope, $ionicModal, $cordovaCamera, $state, $timeout, UserFirebase, $firebaseObject, $ionicPopup) {
     $scope.settings = {
       enableFriends: true
     };
   $ionicModal.fromTemplateUrl('templates/modal-comments.html', {
     scope: $scope,
     animation: 'slide-in-up'
   }).then(function(modal) {
     $scope.modal2 = modal;
   });
   $scope.openComments = function() {
     $scope.modal2.show();
   };
   $scope.closeComments = function() {
     $scope.modal2.hide();
   };
   // Cleanup the modal when we're done with it!
   $scope.$on('$destroy', function() {
     $scope.modal2.remove();
   });
   // Execute action on hide modal
   $scope.$on('modal2.hidden', function() {
   // Execute action
   });
   // Execute action on remove modal
   $scope.$on('modal2.removed', function() {
   // Execute action
   });
   // Cleanup the modal when we're done with it!
   $scope.$on('$destroy', function() {
     $scope.modal2.remove();
   });

   })

   .controller('ProfileCtrl', function($scope, $ionicModal, $ionicLoading, $cordovaCamera, $state, $timeout, UserFirebase, $firebaseObject, $ionicPopup, $stateParams) {
      $scope.menuSelected = 'posts';
      $scope.eventsModal = '';
      $scope.recipesModal = '';
      $scope.settingsModal = '';
      $scope.postsModal = '';
      $scope.singleRecipeModal = '';
      $scope.singleEventModal = '';
      $scope.selectedRecipe = '';
      $scope.recipe = {};
      $scope.post = {};
      $scope.event = {};  
      $timeout(function(){
         if($scope.firebaseUser && $scope.firebaseUser.uid){
          $ionicLoading.show();
          $scope.myPosts = UserFirebase.userDatabase($scope.firebaseUser.uid) || {};
          $scope.myRecipes = UserFirebase.userRecipesDatabase($scope.firebaseUser.uid) || {};
          $scope.myEvents = UserFirebase.userEventsDatabase($scope.firebaseUser.uid) || {};
          $scope.myPosts.$loaded(function(data) {
            $ionicLoading.hide();
           },
           function(error) {
             $ionicPopup.alert({
               title: 'Opss....',
               template: error.message
             });
           })
         }else{
            $state.go("login");
         }
        
      },0);
      $scope.changeMenu = function(menu){
         $timeout(function(){
            $scope.menuSelected = menu;
         },0);
      }
//----------------------------Modals
      $ionicModal.fromTemplateUrl('templates/modal-timeline.html', {
         scope: $scope,
         animation: 'slide-in-up'
      }).then(function(modal) {
         $scope.postsModal = modal;
      });
      $ionicModal.fromTemplateUrl('templates/single-recipe.html', {
         scope: $scope,
         animation: 'slide-in-up'
      }).then(function(modal) {
         $scope.singleRecipeModal = modal;
      });
      $ionicModal.fromTemplateUrl('templates/modal-events.html', {
         scope: $scope,
         animation: 'slide-in-up'
      }).then(function(modal) {
         $scope.eventsModal = modal;
      });
      $ionicModal.fromTemplateUrl('templates/modal-settings.html', {
         scope: $scope,
         animation: 'slide-in-up'
      }).then(function(modal) {
         $scope.settingsModal = modal;
      });
      $ionicModal.fromTemplateUrl('templates/modal-recipes.html', {
         scope: $scope,
         animation: 'slide-in-up'
      }).then(function(modal) {
         $scope.recipesModal = modal;
      });
      $scope.openModal = function(single) {
         if(single && single == "settings"){
            $scope.settingsModal.show();
         }
         else if(single && $scope.menuSelected == 'recipes'){
            $scope.selectedRecipe = single;
            $scope.singleRecipeModal.show();
         }
         else if($scope.menuSelected == 'recipes') $scope.recipesModal.show();
         else if($scope.menuSelected == 'events') $scope.eventsModal.show();
         else $scope.postsModal.show();
      };
      $scope.closeModal = function(single) {
         if(single && single == "settings"){
            $scope.settingsModal.hide();
         }
         if(single && $scope.menuSelected == 'recipes'){
            $scope.selectedRecipe = {};
            $scope.singleRecipeModal.hide();
         }
         else if($scope.menuSelected == 'recipes') $scope.recipesModal.hide();
         else if($scope.menuSelected == 'events') $scope.eventsModal.hide();
         else $scope.postsModal.hide();
      };
         $scope.openRecipe = function(recipe) {
     
   };

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
         $scope.eventsModal.remove();
         $scope.recipesModal.remove();
         $scope.settingsModal.remove();
         $scope.postsModal.remove();
         $scope.singleRecipeModal.remove();
      });
// ------------------------------!----------------

      $scope.takePhoto = function (action) {
         var options =  {
            quality: 100,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 400,
            targetHeight: 400,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
         };
         $cordovaCamera.getPicture($scope.optionsCamera).then(function (imageData) {
            if(action == 'recipes') $scope.recipe.image =  "data:image/jpeg;base64," + imageData;
            else if(action == 'events') $scope.event.image = "data:image/jpeg;base64," + imageData;
            else $scope.post.image = "data:image/jpeg;base64," + imageData;
         }, function (err) {
         // An error occured. Show a message to the user
         });
      }

      $scope.choosePhoto = function (action) {
         var options =  {
            quality: 100,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 400,
            targetHeight: 400,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
         };
         $cordovaCamera.getPicture($scope.optionsCamera).then(function (imageData) {
            if(action == 'recipes') $scope.recipe.image =  "data:image/jpeg;base64," + imageData;
            else if(action == 'events') $scope.event.image = "data:image/jpeg;base64," + imageData;
            else $scope.post.image = "data:image/jpeg;base64," + imageData;
         }, function (err) {
         // An error occured. Show a message to the user
         });
      }
      $scope.newRecipe = function(){
         var obj = {};
         var recipe = $scope.recipe;
         UserFirebase.userRecipesDatabase($scope.firebaseUser.uid).$add({}).then(function(result){
            obj = $firebaseObject(UserFirebase.userRecipesDatabaseRef($scope.firebaseUser.uid).child(result.key));
            obj.title = $scope.recipe.title || '';
            obj.ingredients = $scope.recipe.ingredients || '';
            obj.directions = $scope.recipe.directions || '';
            obj.recipeDate = Date.now();
            obj.$save().then(function(ref) {
               ref.key === obj.$id; // true
            }, function(error) {
               console.log("Error:", error);
            });
            if($scope.recipe.image){
               var stringUploadTask = UserFirebase.userRecipeStorage($scope.firebaseUser.uid+Date.now()).$putString($scope.recipe.image.replace('data:image/jpeg;base64,',''), 'base64');
               stringUploadTask.$complete(function(snapshot) {
                  obj.image = snapshot.downloadURL;
                  obj.$save().then(function(ref) {
                  ref.key === obj.$id; // true
                  }, function(error) {
                  console.log("Error:", error);
                  });
               });
            }
            var alertPopup = $ionicPopup.alert({
               title: 'Sucesso!',
               template: "Receita Criada com Sucesso."
            });
            alertPopup.then(function(res) {
               $scope.closeModal();
               $scope.recipe = {};
            }, function(error) {
               console.log(error);
            });
         });
      };

      $scope.newPost = function(){
         var obj = {};
         var post = $scope.post;
         $scope.myPosts.$add({}).then(function(result){
            obj = $firebaseObject(UserFirebase.userDatabaseRef($scope.firebaseUser.uid).child(result.key));
            obj.description = $scope.post.description || '';
            obj.postDate = Date.now();
            obj.$save().then(function(ref) {
               ref.key === obj.$id; // true
            }, function(error) {
               console.log("Error:", error);
            });
            if($scope.post.image){
               var stringUploadTask = UserFirebase.userStorage($scope.firebaseUser.uid+Date.now()).$putString($scope.post.image.replace('data:image/jpeg;base64,',''), 'base64');
               stringUploadTask.$complete(function(snapshot) {
                  obj.image = snapshot.downloadURL;
                  obj.$save().then(function(ref) {
                     ref.key === obj.$id; // true
                  }, function(error) {
                     console.log("Error:", error);
                  });
               });
            }
            var alertPopup = $ionicPopup.alert({
               title: 'Sucesso!',
               template: "Post Criado com Sucesso."
            });
            alertPopup.then(function(res) {
               $scope.closeModal();
               $scope.post = {};
            }, function(error) {
               console.log(error);
            });
         });
      };

      $scope.newEvent = function(){
        var obj = {};
        var event = $scope.event;
        console.log($scope.myEvents);
      // UserFirebase.userEventsDatabase($scope.firebaseUser.uid).$add({}).then(function(result){
        $scope.myEvents.$add({}).then(function(result){
          obj = $firebaseObject(UserFirebase.userEventsDatabaseRef($scope.firebaseUser.uid).child(result.key));
          obj.title = $scope.event.title || '';
          obj.where = $scope.event.where || '';
          obj.when = Date.now();
          obj.description = $scope.event.description || '';
          obj.$save().then(function(ref) {
         ref.key === obj.$id; // true
         }, function(error) {
           console.log("Error:", error);
         });
         if($scope.event.image){
            var stringUploadTask = UserFirebase.userEventStorage($scope.firebaseUser.uid+Date.now()).$putString($scope.event.image.replace('data:image/jpeg;base64,',''), 'base64');
            stringUploadTask.$complete(function(snapshot) {
              obj.image = snapshot.downloadURL;
              obj.$save().then(function(ref) {
      ref.key === obj.$id; // true
      }, function(error) {
        console.log("Error:", error);
      });
            });
          }
          var alertPopup = $ionicPopup.alert({
            title: 'Sucesso!',
            template: "Evento Criado com Sucesso."
          });
          alertPopup.then(function(res) {
            $scope.closeModal();
            $scope.event = {};
          }, function(error) {
            console.log(error);
          });
        });
      };
   })
   .controller('EventsCtrl', function($scope, $ionicModal, $cordovaCamera, $state, $timeout, UserFirebase, $firebaseObject, $ionicPopup) {

     $scope.event = {};
     console.log($scope.myEvents);

      $ionicModal.fromTemplateUrl('templates/single-event.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.modal2 = modal;
      });
      $scope.openEvent = function(event) {
        $scope.selectedEvent = event;
        $scope.modal2.show();
      };
      $scope.closeEvent = function() {
        $scope.modal2.hide();
      };
      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
        $scope.modal2.remove();
      });
   })

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


