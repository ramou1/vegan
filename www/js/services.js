angular.module('starter.services', [])
 .factory("Auth", ["$firebaseAuth",
     function($firebaseAuth) {
       return $firebaseAuth();
     }
   ])
   .factory("UserFirebase", function($firebaseArray, $firebaseStorage) {
     var ref = firebase.database().ref();
     return {
        usersSearchDatabaseRef:function(username){
         var database = ref.child("users").startAt('rafael');
         return database;
       },
       usersSearchDatabase: function(username){
        console.log(username);
         var database = ref.child("users").orderByChild('name').startAt(username).endAt(username+'\w|\W');
         return $firebaseArray(database);
       },
       userProfileDatabaseRef:function(userid){
         var database = ref.child("users").child(userid);
         return database;
       },
       userProfileDatabase: function(userid){
         var database = ref.child("users").child(userid);
         return $firebaseArray(database);
       },
       userProfileStorage: function(userid){
         var storage = firebase.storage().ref("usersProfilePhoto/"+userid);
         return $firebaseStorage(storage);
       },
       userDatabaseRef:function(userid){
         var database = ref.child("posts").child(userid);
         return database;
       },
       userDatabase: function(userid){
         var database = ref.child("posts").child(userid);
         return $firebaseArray(database);
       },
       userStorage: function(userid){
         var storage = firebase.storage().ref("userPosts/"+userid);
         return $firebaseStorage(storage);
       },
        followingPostsDatabase: function(userId){
         var database = ref.child("posts").child(userId);
         return $firebaseArray(database);
       },
       followingPostsDatabaseRef:function(userid){
         var database = ref.child("posts").child(userid);
         return database;
       },
       followingRecipesDatabase: function(userId){
         var database = ref.child("recipes").child(userId);
         return $firebaseArray(database);
       },
       followingRecipesDatabaseRef:function(userid){
         var database = ref.child("recipes").child(userid);
         return database;
       },
        followingEventsDatabase: function(userId){
         var database = ref.child("events").child(userId);
         return $firebaseArray(database);
       },
       followingEventsDatabaseRef:function(userid){
         var database = ref.child("events").child(userid);
         return database;
       },
       userRecipesDatabaseRef: function(userid){
         var database = ref.child("recipes").child(userid);
         return database;
       },
       userRecipesDatabase: function(userid){
         var database = ref.child("recipes").child(userid);
         return $firebaseArray(database);
       },
       userRecipeStorage: function(userid){
         var storage = firebase.storage().ref("userRecipes/"+userid);
         return $firebaseStorage(storage);
       },
       userEventsDatabaseRef: function(userid){
         var database = ref.child("events").child(userid);
         return database;
       },
       userEventsDatabase: function(userid){
         var database = ref.child("events").child(userid);
         return $firebaseArray(database);
       },
       userEventStorage: function(userid){
         var storage = firebase.storage().ref("userEvents/"+userid);
         return $firebaseStorage(storage);
       }
     }
   });
