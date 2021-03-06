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
           $rootScope.currentUser = $firebaseObject(UserFirebase.userProfileDatabaseRef(firebaseUser.uid));
            $rootScope.currentUser["name"] = $scope.user.name  || '';
            $rootScope.currentUser["birthday"] = $scope.user.birth || '';
            $rootScope.currentUser.$save().then(function(ref) {
            $state.go("tab.timeline");   
          }, function(error) {
            console.log("Error:", error);
          })
   
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
                      if(dataUser.$getRecord("name")) value["name"] =dataUser.$getRecord("name").$value;
                      if(dataUser.$getRecord("profilePhoto")) value["profilePhoto"] = dataUser.$getRecord("profilePhoto").$value;
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
      $scope.recipesModal = '';
      $scope.selectedRecipe = {};
      $scope.singleRecipeModal = '';
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
      $ionicModal.fromTemplateUrl('templates/single-recipe.html', {
         scope: $scope,
         animation: 'slide-in-up'
      }).then(function(modal) {
         $scope.singleRecipeModal = modal;
      });
      $scope.openRecipe = function(single) {
        $scope.selectedRecipe = single;
        $scope.singleRecipeModal.show();
      };
      $scope.closeModal = function(single) {
          $scope.selectedRecipe = {};
          $scope.singleRecipeModal.hide();
      };
      $scope.$on('$destroy', function() {
         $scope.recipesModal.remove();
      });
   })

   .controller('ProfileCtrl', function(Auth, $scope, $ionicModal, $ionicLoading, currentAuth, $cordovaCamera, $state, $timeout, UserFirebase, $firebaseObject, $ionicPopup, $stateParams) {
      $scope.usersToFollow = [];
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
      $scope.singleUserModal = ''; //continuar
      $scope.usersModal = '';
      $scope.postsModal = '';
      $scope.singleRecipeModal = '';
      $scope.singleEventModal = '';
      $scope.selectedRecipe = '';
      $scope.selectedEvent = '';
      $scope.recipe = {};
      $scope.post = {};
      $scope.flagEdit = false;
      $scope.event = {};
      $scope.usersFold = [];
      $ionicLoading.show();
      $scope.firebaseUser = {};
      $scope.user =  $firebaseObject(UserFirebase.userProfileDatabaseRef(currentAuth.uid));
      $scope.myPosts = UserFirebase.userDatabase(currentAuth.uid);
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
        $firebaseObject(UserFirebase.userProfileDatabaseRef(userId)).$loaded(function(data){
          if($scope.user && $scope.user.following && $scope.user.following.indexOf(userId)!== -1){
            $scope.user.following.splice($scope.user.following.indexOf(userId), 1);
            data.followers.splice(data.followers.indexOf($scope.user.$id), 1);
          }
          else
          {
            if($scope.user.following) $scope.user.following.push(userId);
            else $scope.user.following = [userId];
            if(data.followers) data.followers.push($scope.user.$id);
            else data.followers = [$scope.user.$id];
          }
          data.$save().then(function(ref) {
            $scope.user.$save().then(function(ref) {
              $ionicLoading.hide();
            }, function(error) {
              console.log("Error:", error);
            });
            }, function(error) {
              console.log("Error:", error);
          });
          
        })
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
      $scope.singleEventModal = '';
      $scope.selectedEvent = '';
      $ionicModal.fromTemplateUrl('templates/single-event.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.singleEventModal = modal;
      });
      $scope.openEvent = function(single) {

            $scope.selectedEvent = single;
            $scope.singleEventModal.show();

      };
      $scope.closeModal = function(single) {

        $scope.singleEventModal.hide();
      };

      // Cleanup the modal when we're done with it!
      $scope.$on('$destroy', function() {
         $scope.singleEventModal.remove();
      });
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
        $scope.map = {
        center: { 
          latitude: -23.162932,
          longitude: -45.863025
        },
        zoom: 12,
        bounds: {
          northeast: { 
            latitude: -23.085892,
            longitude: -45.827320
          },
          southwest: {
            latitude: -23.292916,
            longitude: -45.898731
          }
        }
      };
      $scope.options = {
        scrollwheel: false
      };
      var createRandomMarker = function(i, bounds, idKey) {
        var lat_min = bounds.southwest.latitude,
          lat_range = bounds.northeast.latitude - lat_min,
          lng_min = bounds.southwest.longitude,
          lng_range = bounds.northeast.longitude - lng_min;

        if (idKey == null) {
          idKey = "id";
        }

        var latitude = lat_min + (Math.random() * lat_range);
        var longitude = lng_min + (Math.random() * lng_range);
        var ret = {
          latitude: latitude,
          longitude: longitude,
          title: 'm' + i
        };
        ret[idKey] = i;
        return ret;
      };
      var markers = [];
      for (var i = 0; i <7; i++) {
        markers.push(createRandomMarker(i, $scope.map.bounds))
      }
      $scope.randomMarkers = markers;
    });


