// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'firebase', 'starter.controllers', 'starter.services', 'ion-floating-menu'])

.run(function($ionicPlatform, $rootScope, $state) {
  $ionicPlatform.ready(function() {
    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
      if (error === "AUTH_REQUIRED") {
        $state.go("login");
      }
    });
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider,$ionicConfigProvider, $urlRouterProvider) {
  $stateProvider
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
  })

  // Each tab has its own nav history stack:

  .state('tab.timeline', {
    url: '/timeline',
    views: {
      'tab-timeline': {
        templateUrl: 'templates/tab-timeline.html',
        controller: 'TimelineCtrl',
        resolve: {
          "currentAuth": ["Auth", function(Auth) {
            return Auth.$requireSignIn();
          }]
        }
      }
    }
  })

  .state('tab.recipes', {
    url: '/recipes',
    views: {
      'tab-recipes': {
        templateUrl: 'templates/tab-recipes.html',
        resolve: {
          "currentAuth": ["Auth", function(Auth) {
            return Auth.$requireSignIn();
          }]
        },
        controller: 'RecipesCtrl'
      }
    }
  })

  .state('tab.events', {
    url: '/events',
    views: {
      'tab-events': {
        templateUrl: 'templates/tab-events.html',
        controller: 'EventsCtrl',
        resolve: {
          "currentAuth": ["Auth", function(Auth) {
            return Auth.$requireSignIn();
          }]
        }
      }
    }
  })

  .state('tab.restaurants', {
    url: '/restaurants',
    views: {
      'tab-restaurants': {
        templateUrl: 'templates/tab-restaurants.html',
        controller: 'RestaurantsCtrl',
        resolve: {
          "currentAuth": ["Auth", function(Auth) {
            return Auth.$requireSignIn();
          }]
        }
      }
    }
  })

  .state('tab.profile', {
    url: '/profile',
    views: {
      'profile': {
        templateUrl: 'templates/tab-profile.html',
        controller: 'ProfileCtrl',
        resolve: {
          "currentAuth": ["Auth", function(Auth) {
            return Auth.$requireSignIn();
          }]
        }
      }
    }
  })

  .state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'RegisterCtrl'
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
 $ionicConfigProvider.tabs.position('bottom'); 
  $urlRouterProvider.otherwise('tab/timeline');

});