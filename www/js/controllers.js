   angular.module('starter.controllers', ['ngCordova'])
   .controller('LoginCtrl', function($scope, $stateParams, $state, Auth) {
     $scope.user = {};
     console.log("in controller");
     $scope.SignIn = function (){
       Auth.$signInWithEmailAndPassword($scope.user.email, $scope.user.password).then(function(result) {
         $state.go("tab.timeline");
       });
     }
   })

   .controller('RegisterCtrl', function($rootScope, UserFirebase, $scope, $stateParams, $firebaseObject, $state, $window, Auth, $ionicPopup) {
     $scope.user = {};

     $scope.SignUp = function (){
       Auth.$createUserWithEmailAndPassword($scope.user.email, $scope.user.password)
       .then(function(firebaseUser) {
         $scope.message = "User created with uid: " + firebaseUser.uid;
          $rootScope.user = {
            "uid" : firebaseUser.uid,
            "name" : $scope.user.name || '',
            "birthday" :  $scope.user.birth || '',
            "new" : true
          }
          Auth.$signInWithEmailAndPassword($scope.user.email, $scope.user.password).then(function(result) {
           console.log(result);
           $state.go("tab.timeline");
         });
   
       }).catch(function(error) {
         $ionicPopup.alert({
           title: 'Ops...',
           template: error.message
         });
       });
     }
   })

   .controller('TimelineCtrl', function($rootScope, $ionicLoading, $scope, $ionicModal, $cordovaCamera, $state, $timeout, currentAuth, UserFirebase, $firebaseObject, $ionicPopup) {
      $scope.followingPosts = [];
      $timeout(function(){
         if(!currentAuth){
            $state.go('login');
         }else{
            if($rootScope.user && $rootScope.user.new){
              $rootScope.currentUser =  $firebaseObject(UserFirebase.userProfileDatabaseRef(currentAuth.uid));
              $rootScope.currentUser["uid"] = currentAuth.uid;
              $rootScope.currentUser["name"] = $rootScope.user["name"] || '';
              $rootScope.currentUser["birthday"] = $rootScope.user["birthday"] || '';
              $rootScope.currentUser.$save().then(function(ref) {   
              }, function(error) {
                console.log("Error:", error);
              })
            }
          }
      },0);
 
      
     
      $scope.doRefresh = function() {
        $scope.followingPosts = [];
        if($rootScope.currentUser.following){
          $ionicLoading.show();
          var promises = $rootScope.currentUser.following.map(function(value, key){
            return  UserFirebase.followingPostsDatabase(value).$loaded(function(dataPost){
              if(dataPost){
                return UserFirebase.userProfileDatabase(value).$loaded(function(dataUser){
                    dataPost.map(function(value, key){
                      if(dataUser["name"]) value["name"] = dataUser["name"];
                      if(dataUser["profilePhoto"]) value["profilePhoto"] = dataUser["profilePhoto"];
                      $scope.followingPosts.push(value);
                    })
                })
              }else{
                return;
              }
            })
          })
          Promise.all(promises).then(function(results) {
            $scope.$broadcast('scroll.refreshComplete');
            $ionicLoading.hide();
          })
        }
        else{
          $scope.$broadcast('scroll.refreshComplete');
        }
          
         UserFirebase.followingPostsDatabase(currentAuth.uid).$loaded(function(dataPost){
            if(dataPost){
              dataPost.map(function(value, key){
                  if($rootScope.currentUser["name"]) value["name"] = $rootScope.currentUser["name"];
                  if($rootScope.currentUser["profilePhoto"]) value["profilePhoto"] = $rootScope.currentUser["profilePhoto"];
                  return $scope.followingPosts.push(value);
                })
            }
          })
      }
     if(!$rootScope.currentUser){
        $rootScope.currentUser =  $firebaseObject(UserFirebase.userProfileDatabaseRef(currentAuth.uid));
         $rootScope.currentUser.$loaded(function(data){
          $scope.doRefresh();
        });
      }else{
        $scope.doRefresh();
    }
   
   })


   .controller('RecipesCtrl', function($scope,currentAuth,  $ionicLoading, $rootScope, $ionicModal, $cordovaCamera, $state, $timeout, UserFirebase, $firebaseObject, $ionicPopup) {

      
     
      $scope.doRefresh = function() {
        $scope.followingRecipes = [];
        if($rootScope.currentUser.following){
          $ionicLoading.show();
          var promises = $rootScope.currentUser.following.map(function(value, key){
            return  UserFirebase.followingRecipesDatabase(value).$loaded(function(dataPost){
              if(dataPost){
                return UserFirebase.userProfileDatabase(value).$loaded(function(dataUser){
                    dataPost.map(function(value, key){
                      if(dataUser["name"]) value["name"] = dataUser["name"];
                      if(dataUser["profilePhoto"]) value["profilePhoto"] = dataUser["profilePhoto"];
                      $scope.followingRecipes.push(value);
                    })
                })
              }else{
                return;
              }
            })
          })
          Promise.all(promises).then(function(results) {
            $scope.$broadcast('scroll.refreshComplete');
            $ionicLoading.hide();
          })
        }
        else{
          $scope.$broadcast('scroll.refreshComplete');
        }
          
         UserFirebase.followingRecipesDatabase(currentAuth.uid).$loaded(function(dataPost){
            if(dataPost){
              console.log(dataPost);
              dataPost.map(function(value, key){
                  if($rootScope.currentUser["name"]) value["name"] = $rootScope.currentUser["name"];
                  if($rootScope.currentUser["profilePhoto"]) value["profilePhoto"] = $rootScope.currentUser["profilePhoto"];
                  return $scope.followingRecipes.push(value);
                })
            }
          })
      }
    $scope.followingRecipes = [];
      if(!$rootScope.currentUser){
        $rootScope.currentUser =  $firebaseObject(UserFirebase.userProfileDatabaseRef(currentAuth.uid));
         $rootScope.currentUser.$loaded(function(data){
          $scope.doRefresh();
        });
      }else{
        $scope.doRefresh();
      }
   })

   .controller('ProfileCtrl', function(Auth, $scope, $ionicModal, $ionicLoading, currentAuth, $cordovaCamera, $state, $timeout, UserFirebase, $firebaseObject, $ionicPopup, $stateParams) {
      $scope.usersToFollow = [];
      console.log("here");
      $timeout(function(){
         if(!currentAuth){
            console.log("here");
            $state.go('login');
         }
      },0);
      $scope.menuSelected = 'posts';
      $scope.eventsModal = '';
      $scope.recipesModal = '';
      $scope.settingsModal = '';
      $scope.usersModal = '';
      $scope.postsModal = '';
      $scope.singleRecipeModal = '';
      $scope.singleEventModal = '';
      $scope.selectedRecipe = '';
      $scope.selectedEvent = '';
      $scope.allUsers = {};
      $scope.recipe = {};
      $scope.post = {};
      $scope.flagEdit = false;
      $scope.event = {};
      $scope.usersFold = [];
      $ionicLoading.show();
      $scope.firebaseUser = {};
      $scope.user =  $firebaseObject(UserFirebase.userProfileDatabaseRef(currentAuth.uid));
      console.log($scope.user);
      console.log(currentAuth.uid);
      $scope.myPosts = UserFirebase.userDatabase(currentAuth.uid);
      console.log($scope.myPosts);
      $scope.myRecipes = UserFirebase.userRecipesDatabase(currentAuth.uid);
      $scope.myEvents = UserFirebase.userEventsDatabase(currentAuth.uid);
      $scope.myPosts.$loaded(function(data) {
         $ionicLoading.hide();
      },
      function(error) {
         $ionicPopup.alert({
            title: 'Opss....',
            template: error.message
         });
      })
      $scope.findUsers = function(username){
        try{
          $scope.usersFold.$destroy();
        }
        catch(e){

        }
        $ionicLoading.show();
        $scope.usersFold = UserFirebase.usersSearchDatabase(username);
        $scope.usersFold.$loaded(function(data){
          console.log(data);
          $ionicLoading.hide();
        });
      };
      $scope.saveUser = function(){
        $ionicLoading.show();
        $scope.user.$save().then(function(ref) {
          $ionicLoading.hide();
          var alertPopup = $ionicPopup.alert({
             title: 'Sucesso!',
             template: "Informações salvas com sucesso!"
          });
          alertPopup.then(function(res) {
             $scope.closeModal();
             $scope.recipe = {};
          }, function(error) {
             console.log(error);
        });
      })
    }
      $scope.follow = function(userId){
        $ionicLoading.show();
        if($scope.user && $scope.user.following && $scope.user.following.indexOf(userId)!== -1){
          $scope.user.following.splice($scope.user.following.indexOf(userId), 1);
        }
        else
        {
          if($scope.user.following) $scope.user.following.push(userId);
          else $scope.user.following = [userId];
        }
        $scope.user.$save().then(function(ref) {
          $ionicLoading.hide();
          console.log($scope.user.following);
          $ionicPopup.alert({
             title: 'Sucesso!',
             template: "Operação efetuada com sucesso."
          });
        }, function(error) {
          console.log("Error:", error);
        });
      }
      $scope.deleteItem = function(objectId, objectType){
        var confirmPopup = $ionicPopup.confirm({
         title: 'CONFIRMAÇÃO',
         template: 'Você tem certeza que deseja deletar est'+(objectType == "post" ? "e post" : (objectType == "event" ? 'e evento' : 'a receita'  ))+"?"
       });

       confirmPopup.then(function(res) {
         if(res) {
           if(objectType == 'post') $scope.myPosts.$remove(objectId);
           else if(objectType == 'event') $scope.myEvents.$remove(objectId);
           else $scope.myRecipes.$remove(objectId);
         }
       });
         
      }

     //  $scope.confirmPresence = function (){
     //    var confirmed += 1;
     //    $scope.event.confirmed = confirmed;
     // }

      $scope.changeMenu = function(menu){
         $timeout(function(){
            $scope.menuSelected = menu;
         },0);
      }

//----------------------------Modals
      $ionicModal.fromTemplateUrl('templates/single-event.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.singleEventModal = modal;
      });
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
      $ionicModal.fromTemplateUrl('templates/modal-users.html', {
         scope: $scope,
         animation: 'slide-in-up'
      }).then(function(modal) {
         $scope.usersModal = modal;
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
         else if(single && single == "users"){
            $scope.usersModal.show();
         }
         else if(single && $scope.menuSelected == 'recipes'){
            $scope.selectedRecipe = single;
            $scope.singleRecipeModal.show();
         }
         else if(single && $scope.menuSelected == 'events'){
            $scope.selectedEvent = single;
            $scope.singleEventModal.show();
         }
         else if($scope.menuSelected == 'recipes') $scope.recipesModal.show();
         else if($scope.menuSelected == 'events') $scope.eventsModal.show();
         else $scope.postsModal.show();
      };
      $scope.closeModal = function(single) {
         if(single && single == "settings"){
            $scope.settingsModal.hide();
         }
         if(single && single == "users"){
            $scope.usersModal.hide();
         }
         if(single && $scope.menuSelected == 'recipes'){
            $scope.selectedRecipe = {};
            $scope.singleRecipeModal.hide();
         }
         if(single && $scope.menuSelected == 'events'){
            $scope.selectedEvent = {};
            $scope.singleEventModal.hide();
         }
         else if($scope.menuSelected == 'recipes') $scope.recipesModal.hide();
         else if($scope.menuSelected == 'events') $scope.eventsModal.hide();
         else $scope.postsModal.hide();
      };

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
         $scope.eventsModal.remove();
         $scope.recipesModal.remove();
         $scope.settingsModal.remove();
         $scope.usersModal.remove();
         $scope.postsModal.remove();
         $scope.singleRecipeModal.remove();
      });
// ------------------------------!----------------

      $scope.takePhoto = function (action) {
         var options =  {
            quality: 100,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 600,
            targetHeight: 600,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
         };
         $cordovaCamera.getPicture(options).then(function (imageData) {
            if(action == 'recipes') $scope.recipe.image =  "data:image/jpeg;base64," + imageData;
            else if(action == 'events') $scope.event.image = "data:image/jpeg;base64," + imageData;
            else if(action == 'userProfilePhoto'){
               var stringUploadTask = UserFirebase.userProfileStorage(currentAuth.uid).$putString(imageData, 'base64');
                  stringUploadTask.$complete(function(snapshot) {
                     $scope.user["profilePhoto"] = snapshot.downloadURL;

                     $scope.user.$save().then(function(ref) {
                        console.log("sucesso");
                     }, function(error) {
                     console.log("Error:", error);
                  });
               });
            }
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
           targetWidth: 600,
           targetHeight: 600,
           popoverOptions: CameraPopoverOptions,
           saveToPhotoAlbum: false
         };
         $cordovaCamera.getPicture(options).then(function (imageData) {
            if(action == 'recipes') $scope.recipe.image =  "data:image/jpeg;base64," + imageData;
            else if(action == 'events') $scope.event.image = "data:image/jpeg;base64," + imageData;
            else if(action == 'userProfilePhoto'){
              $ionicLoading.show();
               var stringUploadTask = UserFirebase.userProfileStorage(currentAuth.uid).$putString(imageData, 'base64');
                  stringUploadTask.$complete(function(snapshot) {
                     $scope.user["profilePhoto"] = snapshot.downloadURL;
                     $scope.user.$save().then(function(ref) {
                        $ionicLoading.hide();
                        var alertPopup = $ionicPopup.alert({
                           title: 'Sucesso!',
                           template: "Foto de perfil alterada com sucesso."
                        });
                        alertPopup.then(function(res) {
                           $scope.closeModal();
                           $scope.recipe = {};
                        }, function(error) {
                           console.log(error);
                        });
                     }, function(error) {
                        var alertPopup = $ionicPopup.alert({
                           title: 'Opsss!',
                           template: "Erro, por favor, verifique sua conexão com a internet."
                        });
                  });
               });
            }
            else $scope.post.image = "data:image/jpeg;base64," + imageData;
         }, function (err) {
         // An error occured. Show a message to the user
         });
      }
      $scope.newRecipe = function(){
         var obj = {};
         var recipe = $scope.recipe;
         $ionicLoading.show();
         UserFirebase.userRecipesDatabase(currentAuth.uid).$add({"recipeDate": Date.now()}).then(function(result){
            obj = $firebaseObject(UserFirebase.userRecipesDatabaseRef(currentAuth.uid).child(result.key));
            if($scope.recipe.image){
               var stringUploadTask = UserFirebase.userRecipeStorage(currentAuth.uid+Date.now()).$putString($scope.recipe.image.replace('data:image/jpeg;base64,',''), 'base64');
               stringUploadTask.$complete(function(snapshot) {
                  obj.image = snapshot.downloadURL;
                  obj.title = $scope.recipe.title || '';
                  obj.ingredients = $scope.recipe.ingredients || '';
                  obj.directions = $scope.recipe.directions || '';
                  obj.userId = currentAuth.uid;
                  obj.$save().then(function(ref) {
                    $ionicLoading.hide();
                    var alertPopup = $ionicPopup.alert({
                       title: 'Sucesso!',
                       template: "Receita Criada com Sucesso."
                    });
                    alertPopup.then(function(res) {
                       $scope.closeModal();
                       $scope.recipe = {};
                    }, function(error) {
                      $ionicLoading.hide();
                       console.log(error);
                    });
                  }, function(error) {
                    $ionicLoading.hide();
                  console.log("Error:", error);
                  });
               });
            }
            else
            {
              obj.title = $scope.recipe.title || '';
              obj.ingredients = $scope.recipe.ingredients || '';
              obj.directions = $scope.recipe.directions || '';
              obj.userId = currentAuth.uid;
              obj.$save().then(function(ref) {
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                   title: 'Sucesso!',
                   template: "Receita Criada com Sucesso."
                });
                alertPopup.then(function(res) {
                   $scope.closeModal();
                   $scope.recipe = {};
                }, function(error) {
                    $ionicLoading.hide();
                   console.log(error);
                });
              }, function(error) {
                $ionicLoading.hide();
                 console.log("Error:", error);
              });
            }


         });
      };
      $scope.logout = function(){
        try{
          $scope.firebaseUser.$destroy();
          $scope.myEvents.$destroy();
          $scope.myRecipes.$destroy();
          $scope.myPosts.$destroy();
          $scope.user.$destroy();
        }catch(e){

        }

        Auth.$signOut().then(function() {
          $scope.settingsModal.hide();
          $scope.usersModal.hide();
          $state.go('login');
        }, function(error) {
          console.log("Error signing out:", error);  
        });
      }
      $scope.newPost = function(){
         var obj = {};
         var post = $scope.post;
         $ionicLoading.show();
         UserFirebase.userDatabase(currentAuth.uid).$add({"postDate" : Date.now()}).then(function(result){
            obj = $firebaseObject(UserFirebase.userDatabaseRef(currentAuth.uid).child(result.key));


            if($scope.post.image){
               var stringUploadTask = UserFirebase.userStorage(currentAuth.uid+Date.now()).$putString($scope.post.image.replace('data:image/jpeg;base64,',''), 'base64');
               stringUploadTask.$complete(function(snapshot) {
                  obj.image = snapshot.downloadURL;
                  obj.description = $scope.post.description || '';
                  obj.userId = currentAuth.uid;
                  obj.$save().then(function(ref) {
                   $ionicLoading.hide();
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
                  }, function(error) {
                     console.log("Error:", error);
                     $ionicLoading.hide();
                  });
               });
            }
            else
            {
              obj.description = $scope.post.description || '';
              obj.userId = currentAuth.uid;
              obj.$save().then(function(ref) {
                 $ionicLoading.hide();
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
              }, function(error) {
                $ionicLoading.hide();
                 console.log("Error:", error);
              });
            }

         });
      };

      $scope.newEvent = function(){
        var obj = {};
        $ionicLoading.show();
        UserFirebase.userEventsDatabase(currentAuth.uid).$add({}).then(function(result){
          obj = $firebaseObject(UserFirebase.userEventsDatabaseRef(currentAuth.uid).child(result.key));

         if($scope.event.image){
            var stringUploadTask = UserFirebase.userEventStorage(currentAuth.uid+Date.now()).$putString($scope.event.image.replace('data:image/jpeg;base64,',''), 'base64');
            stringUploadTask.$complete(function(snapshot) {
              obj.title = $scope.event.title || '';
              obj.where = $scope.event.where || '';
              obj.userId = currentAuth.uid;
              obj.when = $scope.event.when || '';
              obj.description = $scope.event.description || '';
              obj.image = snapshot.downloadURL;
              obj.$save().then(function(ref) {
                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                title: 'Sucesso!',
                template: "Evento Criado com Sucesso."
                });
                alertPopup.then(function(res) {
                  $scope.event = {};
                  $ionicLoading.hide();
                  $scope.closeModal();
                }, function(error) {
                  console.log(error);
                });
              }, function(error) {
                $ionicLoading.hide();
                console.log("Error:", error);
              });
            });
          }
          else
          {
            obj.title = $scope.event.title || '';
            obj.where = $scope.event.where || '';
            obj.userId = currentAuth.uid;
            obj.when = $scope.event.when || '';
            obj.description = $scope.event.description || '';
            obj.$save().then(function(ref) {
             $ionicLoading.hide();
              var alertPopup = $ionicPopup.alert({
                title: 'Sucesso!',
                template: "Evento Criado com Sucesso."
              });
              alertPopup.then(function(res) {
                $scope.event = {};
                $ionicLoading.hide();
                $scope.closeModal();
              }, function(error) {
                console.log(error);
              });
             }, function(error) {
              $ionicLoading.hide();
               console.log("Error:", error);
            });
          }


        });
      };
      $scope.$on('$stateChangeStart', function(){
        if($scope.modal) $scope.modal.remove();
      });
   })
   .controller('EventsCtrl', function($scope, $ionicLoading, $rootScope,currentAuth, $ionicModal, $cordovaCamera, $state, $timeout, UserFirebase, $firebaseObject, $ionicPopup) {


     
      $scope.doRefresh = function() {
        $scope.followingEvents = [];
        if($rootScope.currentUser.following){
          $ionicLoading.show();
          var promises = $rootScope.currentUser.following.map(function(value, key){
            return  UserFirebase.followingEventsDatabase(value).$loaded(function(dataPost){
              if(dataPost){
                return UserFirebase.userProfileDatabase(value).$loaded(function(dataUser){
                    dataPost.map(function(value, key){
                      if(dataUser["name"]) value["name"] = dataUser["name"];
                      if(dataUser["profilePhoto"]) value["profilePhoto"] = dataUser["profilePhoto"];
                      $scope.followingEvents.push(value);
                    })
                })
              }else{
                return;
              }
            })
          })
          Promise.all(promises).then(function(results) {
            $scope.$broadcast('scroll.refreshComplete');
            $ionicLoading.hide();
          })
        }
        else{
          $scope.$broadcast('scroll.refreshComplete');
        }
          
         UserFirebase.followingEventsDatabase(currentAuth.uid).$loaded(function(dataPost){
            if(dataPost){
              dataPost.map(function(value, key){
                  if($rootScope.currentUser["name"]) value["name"] = $rootScope.currentUser["name"];
                  if($rootScope.currentUser["profilePhoto"]) value["profilePhoto"] = $rootScope.currentUser["profilePhoto"];
                  return $scope.followingEvents.push(value);
                })
            }
          })
      }
      $scope.followingEvents = [];
      if(!$rootScope.currentUser){
        $rootScope.currentUser =  $firebaseObject(UserFirebase.userProfileDatabaseRef(currentAuth.uid));
         $rootScope.currentUser.$loaded(function(data){
          $scope.doRefresh();
        });
      }else{
        $scope.doRefresh();
      }
      
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


