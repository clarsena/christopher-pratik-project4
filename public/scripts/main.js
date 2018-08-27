(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

//  namespace for the project
var foodApp = {};

foodApp.apiID = '?_app_id=29d4e9cb';
foodApp.apiKey = '&_app_key=3d9fe704063a8a69bdc768b960f23f6e';
foodApp.allRecipiesApiURL = 'http://api.yummly.com/v1/api/recipes' + foodApp.apiID;
foodApp.singleRecipeApiURL = 'http://api.yummly.com/v1/api/recipe/';
foodApp.totalResultCount = 0;

//  the getAllRecipes method takes in the parameters from the search form and gets the matching data from the API. The results are then stored in the storedResults array
foodApp.getAllRecipes = function (ingredients, courseType, cuisineType, dietary) {

    // show spinner
    $(".spinner-overlay").show();
    $("i.fa-spinner").css('display', 'inline-block');

    $.ajax({
        url: '' + foodApp.allRecipiesApiURL + foodApp.apiKey + courseType + cuisineType + dietary,
        method: 'GET',
        dataType: 'json',
        data: {
            q: ingredients,
            requirePictures: true,
            maxResult: 504,
            start: foodApp.recipePages
        }
    }).then(function (result) {
        // hide spinner
        $("i.fa-spinner").hide();
        $(".spinner-overlay").hide();

        foodApp.storedResults = [];
        foodApp.pagedResults = [];
        foodApp.recipePages = 0;
        result.matches.forEach(function (res) {
            foodApp.storedResults.push(res);
        });
        foodApp.totalResultCount = result.totalMatchCount;
        foodApp.splitRecipes();
        foodApp.displayRecipes(foodApp.pagedResults[foodApp.recipePages]);
    });
};

//  the splitRecipes method splits the intially stored results into an array of results pages, with 21 entries on each
foodApp.splitRecipes = function () {
    for (var i = 0; i < foodApp.storedResults.length; i += 18) {
        var block = foodApp.storedResults.slice(i, i + 18);
        foodApp.pagedResults.push(block);
    }
};

//  the displayRecipes method takes the recipes and breaks them down to be displayed on screen
foodApp.displayRecipes = function (recipes) {
    //  clear the results from the page as well as any displaying buttons
    $('.recipe-list').empty();
    $('.page-results-container').empty();
    var resultsCount = '<div class="results-count-container">\n    <h3>Recipes Gathered: ' + foodApp.storedResults.length + '</h3>\n    </div>';
    $('.recipe-list').append(resultsCount);
    //  loop through the array for the current page and grab the individual recipes info
    recipes.forEach(function (item) {
        foodApp.getSingleRecipe(item.id);
    });
    //  only show the show previous button if there are results to go back to
    if (foodApp.recipePages > 0) {
        var showPreviousButton = '<button class="show-previous show-button">Show Previous Results</button>';
        $('.page-results-container').append(showPreviousButton);
    }
    //  only show the show more button if there are still more results to show
    if (foodApp.recipePages <= foodApp.pagedResults.length - 2) {
        var showMoreButton = '<button class="show-more show-button">Show More Results</button>';
        $('.page-results-container').append(showMoreButton);
    }
    $('footer').empty();
    $('footer').append('<h4>Created by Christopher Arsenault & Pratik Gauchan - chrisPratt Codes &copy; 2018</h4>');
};

//  the rating method converts the numerical rating (if present) and displays stars in its place
foodApp.rating = function (ratingNum) {
    var tempRating = '';
    if (ratingNum) {
        for (var i = 1; i <= ratingNum; i++) {
            tempRating += '<span class="star"><i class="fas fa-star"></i></span>';
        }
    }
    return tempRating;
};

//  the getSingleRecipe method takes in a recipeID and pulls the info for that specific recipe
foodApp.getSingleRecipe = function (recipeID) {
    $.ajax({
        url: '' + foodApp.singleRecipeApiURL + recipeID + foodApp.apiID + foodApp.apiKey,
        method: 'GET',
        dataType: 'json'
    }).then(function (result) {
        console.log(result);
        //  format the returned courses and cuisine attributes for the page
        var courses = "---";
        if (result.attributes.course) {
            courses = result.attributes.course.join(', ');
        }
        var cuisines = "---";
        if (result.attributes.cuisine) {
            cuisines = result.attributes.cuisine.join(', ');
        }
        var rating = foodApp.rating(result.rating);

        //  create the HTML elements to write the recipe to the DOM and append it to the recipe-list div
        var showRecipe = '\n            <a href="' + result.source.sourceRecipeUrl + '" target="top">\n                <div class="recipe-container">\n                    <div class="img-container">\n                        <img src=\'' + result.images[0].hostedLargeUrl + '\'>\n                    </div>\n                \n                    <h2>' + result.name + '</h2>\n                    <h4>Rating: ' + rating + '</h4>\n                    <h3>Total Time to Prepare: ' + result.totalTime + '</h3>\n                    <h3>Number of Servings: ' + result.numberOfServings + '</h3>\n                    <h3>Course Types: ' + courses + '</h3>\n                    <h3>Cuisine Types: ' + cuisines + '</h3>\n                </div>\n\n                <div class="recipe-overlay">\n                    <h3>Click here to read the full recipe</h3>\n                </div>\n            </a>';
        $('.recipe-list').append(showRecipe);
    });
};

//  the events method will hold general event listeners for the site
foodApp.events = function () {

    $('.initial-search').on('submit', function (e) {
        e.preventDefault();
        var ingredients = $('.initial-search-box').val();
        $('.main-welcome-page').hide();
        $('nav').show();
        $('.recipe-search-box').val($('.initial-search-box').val());

        foodApp.getAllRecipes(ingredients, '', '', '');
    });

    $('.submit button').on('click', function (e) {

        //  store the results from the form to be used later for pagination
        var ingredients = $('.recipe-search-box').val();
        var courses = $('input[name=course-type]:checked').val();
        var cuisines = $('input[name=cuisine-type]:checked').map(function () {
            return $(this).val();
        }).get().join('');
        var dietary = $('input[name=dietary-restrictions]:checked').val();
        //  send the search results to the getAllRecipes method to pull the data from the API
        foodApp.getAllRecipes(ingredients, courses, cuisines, dietary);
    });

    //  event listener to clear the search form
    $('.form-reset').on('click', function () {
        $('.recipe-search').trigger('reset');
    });

    //  event listener for the show previous button to show previous recipe results
    $('body').on('click', '.show-previous', function () {
        foodApp.recipePages--;
        foodApp.displayRecipes(foodApp.pagedResults[foodApp.recipePages]);
    });

    //  event listener for the show more button to show more recipe results
    $('body').on('click', '.show-more', function () {
        foodApp.recipePages++;
        foodApp.displayRecipes(foodApp.pagedResults[foodApp.recipePages]);
    });

    // event listener than hides all the sub-menu options by default
    $('html').on('click', function () {
        $(".sub-menu").hide();
    });

    // event listener that prevents sub-menu hiding if clicked inside the main-menu-options div
    $('.main-menu-options').on('click', function (e) {
        e.stopPropagation();
    });

    //  event listener for showing/hiding sub-menu of only course type while hiding other sub-menus
    $('.course-type button').on('click', function (e) {
        $(".spinner-overlay").toggle();
        $(".course-type .sub-menu").toggle();
        $(".cuisine-type .sub-menu").hide();
        $(".dietary-restrictions .sub-menu").hide();
        e.preventDefault();
    });

    //  event listener for showing/hiding sub-menu of only cuisine type while hiding other sub-menus
    $('.cuisine-type button').on('click', function (e) {
        $(".spinner-overlay").toggle();
        $(".cuisine-type .sub-menu").toggle();
        $(".course-type .sub-menu").hide();
        $(".dietary-restrictions .sub-menu").hide();
        e.preventDefault();
    });

    //  event listener for showing/hiding sub-menu of only dietary restrictions while hiding other sub-menus
    $('.dietary-restrictions button').on('click', function (e) {
        $(".spinner-overlay").toggle();
        $(".dietary-restrictions .sub-menu").toggle();
        $(".cuisine-type .sub-menu").hide();
        $(".course-type .sub-menu").hide();
        e.preventDefault();
    });

    // empty array that stores selected cuisine type
    var selectedHolder = [];

    $(".sub-menu input[type=checkbox]").on('click', function () {
        var selectedValue = $(this).val();
        // filters through the array and takes out cuisine types that are in the array and have been clicked on again
        if (selectedHolder.includes(selectedValue)) {
            selectedHolder = selectedHolder.filter(function (selected) {
                return selected != selectedValue;
            });
        } else {
            selectedHolder.push(selectedValue);
        }
    });
};

//  the init method initializes all the necessary methods when the page loads
foodApp.init = function () {
    $('.recipe-search').trigger('reset');
    $('.initial-search').trigger('reset');
    foodApp.events();
};

//  document.ready to call the init method once the page is finished loading
$(function () {
    foodApp.init();
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkZXYvc2NyaXB0cy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQTtBQUNBLElBQU0sVUFBVSxFQUFoQjs7QUFFQSxRQUFRLEtBQVIsR0FBZ0IsbUJBQWhCO0FBQ0EsUUFBUSxNQUFSLEdBQWlCLDRDQUFqQjtBQUNBLFFBQVEsaUJBQVIsNENBQW1FLFFBQVEsS0FBM0U7QUFDQSxRQUFRLGtCQUFSLEdBQTZCLHNDQUE3QjtBQUNBLFFBQVEsZ0JBQVIsR0FBMkIsQ0FBM0I7O0FBRUE7QUFDQSxRQUFRLGFBQVIsR0FBd0IsVUFBQyxXQUFELEVBQWMsVUFBZCxFQUEwQixXQUExQixFQUF1QyxPQUF2QyxFQUFtRDs7QUFFdkU7QUFDQSxNQUFFLGtCQUFGLEVBQXNCLElBQXRCO0FBQ0EsTUFBRSxjQUFGLEVBQWtCLEdBQWxCLENBQXNCLFNBQXRCLEVBQWlDLGNBQWpDOztBQUVBLE1BQUUsSUFBRixDQUFPO0FBQ0gsa0JBQVEsUUFBUSxpQkFBaEIsR0FBb0MsUUFBUSxNQUE1QyxHQUFxRCxVQUFyRCxHQUFrRSxXQUFsRSxHQUFnRixPQUQ3RTtBQUVILGdCQUFRLEtBRkw7QUFHSCxrQkFBVSxNQUhQO0FBSUgsY0FBTTtBQUNGLGVBQUcsV0FERDtBQUVGLDZCQUFpQixJQUZmO0FBR0YsdUJBQVcsR0FIVDtBQUlGLG1CQUFPLFFBQVE7QUFKYjtBQUpILEtBQVAsRUFXSyxJQVhMLENBV1UsVUFBQyxNQUFELEVBQVk7QUFDZDtBQUNBLFVBQUUsY0FBRixFQUFrQixJQUFsQjtBQUNBLFVBQUUsa0JBQUYsRUFBc0IsSUFBdEI7O0FBRUEsZ0JBQVEsYUFBUixHQUF3QixFQUF4QjtBQUNBLGdCQUFRLFlBQVIsR0FBdUIsRUFBdkI7QUFDQSxnQkFBUSxXQUFSLEdBQXNCLENBQXRCO0FBQ0EsZUFBTyxPQUFQLENBQWUsT0FBZixDQUF1QixVQUFDLEdBQUQsRUFBUztBQUM1Qixv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LEVBQTZCLE1BQTdCO0FBQ0EsVUFBRSx3QkFBRixFQUE0QixJQUE1QjtBQUNBLFVBQUUsaUNBQUYsRUFBcUMsSUFBckM7QUFDQSxVQUFFLGNBQUY7QUFDSCxLQU5EOztBQVFBO0FBQ0EsTUFBRSw4QkFBRixFQUFrQyxFQUFsQyxDQUFxQyxPQUFyQyxFQUE4QyxVQUFVLENBQVYsRUFBYTtBQUN2RCxVQUFFLGtCQUFGLEVBQXNCLE1BQXRCO0FBQ0EsVUFBRSxpQ0FBRixFQUFxQyxNQUFyQztBQUNBLFVBQUUseUJBQUYsRUFBNkIsSUFBN0I7QUFDQSxVQUFFLHdCQUFGLEVBQTRCLElBQTVCO0FBQ0EsVUFBRSxjQUFGO0FBQ0gsS0FORDs7QUFRQTtBQUNBLFFBQUksaUJBQWlCLEVBQXJCOztBQUVBLE1BQUUsZ0NBQUYsRUFBb0MsRUFBcEMsQ0FBdUMsT0FBdkMsRUFBZ0QsWUFBWTtBQUN4RCxZQUFJLGdCQUFnQixFQUFFLElBQUYsRUFBUSxHQUFSLEVBQXBCO0FBQ0E7QUFDQSxZQUFJLGVBQWUsUUFBZixDQUF3QixhQUF4QixDQUFKLEVBQTRDO0FBQ3hDLDZCQUFpQixlQUFlLE1BQWYsQ0FBc0I7QUFBQSx1QkFBWSxZQUFZLGFBQXhCO0FBQUEsYUFBdEIsQ0FBakI7QUFDSCxTQUZELE1BRU87QUFDSCwyQkFBZSxJQUFmLENBQW9CLGFBQXBCO0FBQ0g7QUFDSixLQVJEO0FBU0gsQ0E3RkQ7O0FBK0ZBO0FBQ0EsUUFBUSxJQUFSLEdBQWUsWUFBTTtBQUNqQixNQUFFLGdCQUFGLEVBQW9CLE9BQXBCLENBQTRCLE9BQTVCO0FBQ0EsTUFBRSxpQkFBRixFQUFxQixPQUFyQixDQUE2QixPQUE3QjtBQUNBLFlBQVEsTUFBUjtBQUNILENBSkQ7O0FBTUE7QUFDQSxFQUFFLFlBQVk7QUFDVixZQUFRLElBQVI7QUFDSCxDQUZEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLy8gIG5hbWVzcGFjZSBmb3IgdGhlIHByb2plY3RcbmNvbnN0IGZvb2RBcHAgPSB7fTtcblxuZm9vZEFwcC5hcGlJRCA9ICc/X2FwcF9pZD0yOWQ0ZTljYidcbmZvb2RBcHAuYXBpS2V5ID0gJyZfYXBwX2tleT0zZDlmZTcwNDA2M2E4YTY5YmRjNzY4Yjk2MGYyM2Y2ZSc7XG5mb29kQXBwLmFsbFJlY2lwaWVzQXBpVVJMID0gYGh0dHA6Ly9hcGkueXVtbWx5LmNvbS92MS9hcGkvcmVjaXBlcyR7Zm9vZEFwcC5hcGlJRH1gO1xuZm9vZEFwcC5zaW5nbGVSZWNpcGVBcGlVUkwgPSAnaHR0cDovL2FwaS55dW1tbHkuY29tL3YxL2FwaS9yZWNpcGUvJztcbmZvb2RBcHAudG90YWxSZXN1bHRDb3VudCA9IDA7XG5cbi8vICB0aGUgZ2V0QWxsUmVjaXBlcyBtZXRob2QgdGFrZXMgaW4gdGhlIHBhcmFtZXRlcnMgZnJvbSB0aGUgc2VhcmNoIGZvcm0gYW5kIGdldHMgdGhlIG1hdGNoaW5nIGRhdGEgZnJvbSB0aGUgQVBJLiBUaGUgcmVzdWx0cyBhcmUgdGhlbiBzdG9yZWQgaW4gdGhlIHN0b3JlZFJlc3VsdHMgYXJyYXlcbmZvb2RBcHAuZ2V0QWxsUmVjaXBlcyA9IChpbmdyZWRpZW50cywgY291cnNlVHlwZSwgY3Vpc2luZVR5cGUsIGRpZXRhcnkpID0+IHtcblxuICAgIC8vIHNob3cgc3Bpbm5lclxuICAgICQoXCIuc3Bpbm5lci1vdmVybGF5XCIpLnNob3coKTtcbiAgICAkKFwiaS5mYS1zcGlubmVyXCIpLmNzcygnZGlzcGxheScsICdpbmxpbmUtYmxvY2snKTtcblxuICAgICQuYWpheCh7XG4gICAgICAgIHVybDogYCR7Zm9vZEFwcC5hbGxSZWNpcGllc0FwaVVSTH0ke2Zvb2RBcHAuYXBpS2V5fSR7Y291cnNlVHlwZX0ke2N1aXNpbmVUeXBlfSR7ZGlldGFyeX1gLFxuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBxOiBpbmdyZWRpZW50cyxcbiAgICAgICAgICAgIHJlcXVpcmVQaWN0dXJlczogdHJ1ZSxcbiAgICAgICAgICAgIG1heFJlc3VsdDogNTA0LFxuICAgICAgICAgICAgc3RhcnQ6IGZvb2RBcHAucmVjaXBlUGFnZXMsXG4gICAgICAgIH1cbiAgICB9KVxuICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAvLyBoaWRlIHNwaW5uZXJcbiAgICAgICAgICAgICQoXCJpLmZhLXNwaW5uZXJcIikuaGlkZSgpO1xuICAgICAgICAgICAgJChcIi5zcGlubmVyLW92ZXJsYXlcIikuaGlkZSgpO1xuXG4gICAgICAgICAgICBmb29kQXBwLnN0b3JlZFJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgIGZvb2RBcHAucGFnZWRSZXN1bHRzID0gW107XG4gICAgICAgICAgICBmb29kQXBwLnJlY2lwZVBhZ2VzID0gMDtcbiAgICAgICAgICAgIHJlc3VsdC5tYXRjaGVzLmZvckVhY2goKHJlcykgPT4ge1xuICAgICAgICAgICAgICAgIGZvb2RBcHAuc3RvcmVkUmVzdWx0cy5wdXNoKHJlcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZvb2RBcHAudG90YWxSZXN1bHRDb3VudCA9IHJlc3VsdC50b3RhbE1hdGNoQ291bnQ7XG4gICAgICAgICAgICBmb29kQXBwLnNwbGl0UmVjaXBlcygpO1xuICAgICAgICAgICAgZm9vZEFwcC5kaXNwbGF5UmVjaXBlcyhmb29kQXBwLnBhZ2VkUmVzdWx0c1tmb29kQXBwLnJlY2lwZVBhZ2VzXSk7XG4gICAgICAgIH0pO1xufVxuXG4vLyAgdGhlIHNwbGl0UmVjaXBlcyBtZXRob2Qgc3BsaXRzIHRoZSBpbnRpYWxseSBzdG9yZWQgcmVzdWx0cyBpbnRvIGFuIGFycmF5IG9mIHJlc3VsdHMgcGFnZXMsIHdpdGggMjEgZW50cmllcyBvbiBlYWNoXG5mb29kQXBwLnNwbGl0UmVjaXBlcyA9ICgpID0+IHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZvb2RBcHAuc3RvcmVkUmVzdWx0cy5sZW5ndGg7IGkgKz0gMTgpIHtcbiAgICAgICAgY29uc3QgYmxvY2sgPSBmb29kQXBwLnN0b3JlZFJlc3VsdHMuc2xpY2UoaSwgaSArIDE4KTtcbiAgICAgICAgZm9vZEFwcC5wYWdlZFJlc3VsdHMucHVzaChibG9jayk7XG4gICAgfVxufVxuXG4vLyAgdGhlIGRpc3BsYXlSZWNpcGVzIG1ldGhvZCB0YWtlcyB0aGUgcmVjaXBlcyBhbmQgYnJlYWtzIHRoZW0gZG93biB0byBiZSBkaXNwbGF5ZWQgb24gc2NyZWVuXG5mb29kQXBwLmRpc3BsYXlSZWNpcGVzID0gKHJlY2lwZXMpID0+IHtcbiAgICAvLyAgY2xlYXIgdGhlIHJlc3VsdHMgZnJvbSB0aGUgcGFnZSBhcyB3ZWxsIGFzIGFueSBkaXNwbGF5aW5nIGJ1dHRvbnNcbiAgICAkKCcucmVjaXBlLWxpc3QnKS5lbXB0eSgpO1xuICAgICQoJy5wYWdlLXJlc3VsdHMtY29udGFpbmVyJykuZW1wdHkoKTtcbiAgICBjb25zdCByZXN1bHRzQ291bnQgPSBgPGRpdiBjbGFzcz1cInJlc3VsdHMtY291bnQtY29udGFpbmVyXCI+XG4gICAgPGgzPlJlY2lwZXMgR2F0aGVyZWQ6ICR7Zm9vZEFwcC5zdG9yZWRSZXN1bHRzLmxlbmd0aH08L2gzPlxuICAgIDwvZGl2PmA7XG4gICAgJCgnLnJlY2lwZS1saXN0JykuYXBwZW5kKHJlc3VsdHNDb3VudCk7XG4gICAgLy8gIGxvb3AgdGhyb3VnaCB0aGUgYXJyYXkgZm9yIHRoZSBjdXJyZW50IHBhZ2UgYW5kIGdyYWIgdGhlIGluZGl2aWR1YWwgcmVjaXBlcyBpbmZvXG4gICAgcmVjaXBlcy5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgIGZvb2RBcHAuZ2V0U2luZ2xlUmVjaXBlKGl0ZW0uaWQpO1xuICAgIH0pO1xuICAgIC8vICBvbmx5IHNob3cgdGhlIHNob3cgcHJldmlvdXMgYnV0dG9uIGlmIHRoZXJlIGFyZSByZXN1bHRzIHRvIGdvIGJhY2sgdG9cbiAgICBpZiAoZm9vZEFwcC5yZWNpcGVQYWdlcyA+IDApIHtcbiAgICAgICAgY29uc3Qgc2hvd1ByZXZpb3VzQnV0dG9uID0gYDxidXR0b24gY2xhc3M9XCJzaG93LXByZXZpb3VzIHNob3ctYnV0dG9uXCI+U2hvdyBQcmV2aW91cyBSZXN1bHRzPC9idXR0b24+YDtcbiAgICAgICAgJCgnLnBhZ2UtcmVzdWx0cy1jb250YWluZXInKS5hcHBlbmQoc2hvd1ByZXZpb3VzQnV0dG9uKTtcbiAgICB9XG4gICAgLy8gIG9ubHkgc2hvdyB0aGUgc2hvdyBtb3JlIGJ1dHRvbiBpZiB0aGVyZSBhcmUgc3RpbGwgbW9yZSByZXN1bHRzIHRvIHNob3dcbiAgICBpZiAoZm9vZEFwcC5yZWNpcGVQYWdlcyA8PSAoKGZvb2RBcHAucGFnZWRSZXN1bHRzLmxlbmd0aCkgLSAyKSkge1xuICAgICAgICBjb25zdCBzaG93TW9yZUJ1dHRvbiA9IGA8YnV0dG9uIGNsYXNzPVwic2hvdy1tb3JlIHNob3ctYnV0dG9uXCI+U2hvdyBNb3JlIFJlc3VsdHM8L2J1dHRvbj5gO1xuICAgICAgICAkKCcucGFnZS1yZXN1bHRzLWNvbnRhaW5lcicpLmFwcGVuZChzaG93TW9yZUJ1dHRvbik7XG4gICAgfVxuICAgICQoJ2Zvb3RlcicpLmVtcHR5KCk7XG4gICAgJCgnZm9vdGVyJykuYXBwZW5kKGA8aDQ+Q3JlYXRlZCBieSBDaHJpc3RvcGhlciBBcnNlbmF1bHQgJiBQcmF0aWsgR2F1Y2hhbiAtIGNocmlzUHJhdHQgQ29kZXMgJmNvcHk7IDIwMTg8L2g0PmApO1xufVxuXG4vLyAgdGhlIHJhdGluZyBtZXRob2QgY29udmVydHMgdGhlIG51bWVyaWNhbCByYXRpbmcgKGlmIHByZXNlbnQpIGFuZCBkaXNwbGF5cyBzdGFycyBpbiBpdHMgcGxhY2VcbmZvb2RBcHAucmF0aW5nID0gKHJhdGluZ051bSkgPT4ge1xuICAgIGxldCB0ZW1wUmF0aW5nID0gJyc7XG4gICAgaWYgKHJhdGluZ051bSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSByYXRpbmdOdW07IGkrKykge1xuICAgICAgICAgICAgdGVtcFJhdGluZyArPSBgPHNwYW4gY2xhc3M9XCJzdGFyXCI+PGkgY2xhc3M9XCJmYXMgZmEtc3RhclwiPjwvaT48L3NwYW4+YDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGVtcFJhdGluZztcbn1cblxuLy8gIHRoZSBnZXRTaW5nbGVSZWNpcGUgbWV0aG9kIHRha2VzIGluIGEgcmVjaXBlSUQgYW5kIHB1bGxzIHRoZSBpbmZvIGZvciB0aGF0IHNwZWNpZmljIHJlY2lwZVxuZm9vZEFwcC5nZXRTaW5nbGVSZWNpcGUgPSAocmVjaXBlSUQpID0+IHtcbiAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6IGAke2Zvb2RBcHAuc2luZ2xlUmVjaXBlQXBpVVJMfSR7cmVjaXBlSUR9JHtmb29kQXBwLmFwaUlEfSR7Zm9vZEFwcC5hcGlLZXl9YCxcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICB9KVxuICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXN1bHQpO1xuICAgICAgICAgICAgLy8gIGZvcm1hdCB0aGUgcmV0dXJuZWQgY291cnNlcyBhbmQgY3Vpc2luZSBhdHRyaWJ1dGVzIGZvciB0aGUgcGFnZVxuICAgICAgICAgICAgbGV0IGNvdXJzZXMgPSBcIi0tLVwiO1xuICAgICAgICAgICAgaWYgKHJlc3VsdC5hdHRyaWJ1dGVzLmNvdXJzZSkge1xuICAgICAgICAgICAgICAgIGNvdXJzZXMgPSByZXN1bHQuYXR0cmlidXRlcy5jb3Vyc2Uuam9pbignLCAnKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGN1aXNpbmVzID0gXCItLS1cIjtcbiAgICAgICAgICAgIGlmIChyZXN1bHQuYXR0cmlidXRlcy5jdWlzaW5lKSB7XG4gICAgICAgICAgICAgICAgY3Vpc2luZXMgPSByZXN1bHQuYXR0cmlidXRlcy5jdWlzaW5lLmpvaW4oJywgJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByYXRpbmcgPSBmb29kQXBwLnJhdGluZyhyZXN1bHQucmF0aW5nKTtcblxuICAgICAgICAgICAgLy8gIGNyZWF0ZSB0aGUgSFRNTCBlbGVtZW50cyB0byB3cml0ZSB0aGUgcmVjaXBlIHRvIHRoZSBET00gYW5kIGFwcGVuZCBpdCB0byB0aGUgcmVjaXBlLWxpc3QgZGl2XG4gICAgICAgICAgICBjb25zdCBzaG93UmVjaXBlID0gYFxuICAgICAgICAgICAgPGEgaHJlZj1cIiR7cmVzdWx0LnNvdXJjZS5zb3VyY2VSZWNpcGVVcmx9XCIgdGFyZ2V0PVwidG9wXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlY2lwZS1jb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImltZy1jb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPScke3Jlc3VsdC5pbWFnZXNbMF0uaG9zdGVkTGFyZ2VVcmx9Jz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIDxoMj4ke3Jlc3VsdC5uYW1lfTwvaDI+XG4gICAgICAgICAgICAgICAgICAgIDxoND5SYXRpbmc6ICR7cmF0aW5nfTwvaDQ+XG4gICAgICAgICAgICAgICAgICAgIDxoMz5Ub3RhbCBUaW1lIHRvIFByZXBhcmU6ICR7cmVzdWx0LnRvdGFsVGltZX08L2gzPlxuICAgICAgICAgICAgICAgICAgICA8aDM+TnVtYmVyIG9mIFNlcnZpbmdzOiAke3Jlc3VsdC5udW1iZXJPZlNlcnZpbmdzfTwvaDM+XG4gICAgICAgICAgICAgICAgICAgIDxoMz5Db3Vyc2UgVHlwZXM6ICR7Y291cnNlc308L2gzPlxuICAgICAgICAgICAgICAgICAgICA8aDM+Q3Vpc2luZSBUeXBlczogJHtjdWlzaW5lc308L2gzPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInJlY2lwZS1vdmVybGF5XCI+XG4gICAgICAgICAgICAgICAgICAgIDxoMz5DbGljayBoZXJlIHRvIHJlYWQgdGhlIGZ1bGwgcmVjaXBlPC9oMz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvYT5gXG4gICAgICAgICAgICAkKCcucmVjaXBlLWxpc3QnKS5hcHBlbmQoc2hvd1JlY2lwZSk7XG4gICAgICAgIH0pO1xufVxuXG4vLyAgdGhlIGV2ZW50cyBtZXRob2Qgd2lsbCBob2xkIGdlbmVyYWwgZXZlbnQgbGlzdGVuZXJzIGZvciB0aGUgc2l0ZVxuZm9vZEFwcC5ldmVudHMgPSAoKSA9PiB7XG5cbiAgICAkKCcuaW5pdGlhbC1zZWFyY2gnKS5vbignc3VibWl0JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBjb25zdCBpbmdyZWRpZW50cyA9ICQoJy5pbml0aWFsLXNlYXJjaC1ib3gnKS52YWwoKTtcbiAgICAgICAgJCgnLm1haW4td2VsY29tZS1wYWdlJykuaGlkZSgpO1xuICAgICAgICAkKCduYXYnKS5zaG93KCk7XG4gICAgICAgICQoJy5yZWNpcGUtc2VhcmNoLWJveCcpLnZhbCgkKCcuaW5pdGlhbC1zZWFyY2gtYm94JykudmFsKCkpO1xuXG4gICAgICAgIGZvb2RBcHAuZ2V0QWxsUmVjaXBlcyhpbmdyZWRpZW50cywgJycsICcnLCAnJyk7XG5cbiAgICB9KTtcblxuICAgICQoJy5zdWJtaXQgYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcblxuICAgICAgICAvLyAgc3RvcmUgdGhlIHJlc3VsdHMgZnJvbSB0aGUgZm9ybSB0byBiZSB1c2VkIGxhdGVyIGZvciBwYWdpbmF0aW9uXG4gICAgICAgIGNvbnN0IGluZ3JlZGllbnRzID0gJCgnLnJlY2lwZS1zZWFyY2gtYm94JykudmFsKCk7XG4gICAgICAgIGNvbnN0IGNvdXJzZXMgPSAkKCdpbnB1dFtuYW1lPWNvdXJzZS10eXBlXTpjaGVja2VkJykudmFsKCk7XG4gICAgICAgIGNvbnN0IGN1aXNpbmVzID0gJCgnaW5wdXRbbmFtZT1jdWlzaW5lLXR5cGVdOmNoZWNrZWQnKS5tYXAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICQodGhpcykudmFsKCk7XG4gICAgICAgIH0pLmdldCgpLmpvaW4oJycpO1xuICAgICAgICBjb25zdCBkaWV0YXJ5ID0gJCgnaW5wdXRbbmFtZT1kaWV0YXJ5LXJlc3RyaWN0aW9uc106Y2hlY2tlZCcpLnZhbCgpO1xuICAgICAgICAvLyAgc2VuZCB0aGUgc2VhcmNoIHJlc3VsdHMgdG8gdGhlIGdldEFsbFJlY2lwZXMgbWV0aG9kIHRvIHB1bGwgdGhlIGRhdGEgZnJvbSB0aGUgQVBJXG4gICAgICAgIGZvb2RBcHAuZ2V0QWxsUmVjaXBlcyhpbmdyZWRpZW50cywgY291cnNlcywgY3Vpc2luZXMsIGRpZXRhcnkpO1xuXG4gICAgfSk7XG5cbiAgICAvLyAgZXZlbnQgbGlzdGVuZXIgdG8gY2xlYXIgdGhlIHNlYXJjaCBmb3JtXG4gICAgJCgnLmZvcm0tcmVzZXQnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoJy5yZWNpcGUtc2VhcmNoJykudHJpZ2dlcigncmVzZXQnKTtcbiAgICB9KVxuXG4gICAgLy8gIGV2ZW50IGxpc3RlbmVyIGZvciB0aGUgc2hvdyBwcmV2aW91cyBidXR0b24gdG8gc2hvdyBwcmV2aW91cyByZWNpcGUgcmVzdWx0c1xuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLnNob3ctcHJldmlvdXMnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvb2RBcHAucmVjaXBlUGFnZXMtLTtcbiAgICAgICAgZm9vZEFwcC5kaXNwbGF5UmVjaXBlcyhmb29kQXBwLnBhZ2VkUmVzdWx0c1tmb29kQXBwLnJlY2lwZVBhZ2VzXSk7XG4gICAgfSk7XG5cbiAgICAvLyAgZXZlbnQgbGlzdGVuZXIgZm9yIHRoZSBzaG93IG1vcmUgYnV0dG9uIHRvIHNob3cgbW9yZSByZWNpcGUgcmVzdWx0c1xuICAgICQoJ2JvZHknKS5vbignY2xpY2snLCAnLnNob3ctbW9yZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZm9vZEFwcC5yZWNpcGVQYWdlcysrO1xuICAgICAgICBmb29kQXBwLmRpc3BsYXlSZWNpcGVzKGZvb2RBcHAucGFnZWRSZXN1bHRzW2Zvb2RBcHAucmVjaXBlUGFnZXNdKTtcbiAgICB9KTtcblxuICAgIC8vIGV2ZW50IGxpc3RlbmVyIHRoYW4gaGlkZXMgYWxsIHRoZSBzdWItbWVudSBvcHRpb25zIGJ5IGRlZmF1bHRcbiAgICAkKCdodG1sJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAkKFwiLnN1Yi1tZW51XCIpLmhpZGUoKTtcbiAgICB9KTtcblxuICAgIC8vIGV2ZW50IGxpc3RlbmVyIHRoYXQgcHJldmVudHMgc3ViLW1lbnUgaGlkaW5nIGlmIGNsaWNrZWQgaW5zaWRlIHRoZSBtYWluLW1lbnUtb3B0aW9ucyBkaXZcbiAgICAkKCcubWFpbi1tZW51LW9wdGlvbnMnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH0pO1xuXG4gICAgLy8gIGV2ZW50IGxpc3RlbmVyIGZvciBzaG93aW5nL2hpZGluZyBzdWItbWVudSBvZiBvbmx5IGNvdXJzZSB0eXBlIHdoaWxlIGhpZGluZyBvdGhlciBzdWItbWVudXNcbiAgICAkKCcuY291cnNlLXR5cGUgYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgJChcIi5zcGlubmVyLW92ZXJsYXlcIikudG9nZ2xlKCk7XG4gICAgICAgICQoXCIuY291cnNlLXR5cGUgLnN1Yi1tZW51XCIpLnRvZ2dsZSgpO1xuICAgICAgICAkKFwiLmN1aXNpbmUtdHlwZSAuc3ViLW1lbnVcIikuaGlkZSgpO1xuICAgICAgICAkKFwiLmRpZXRhcnktcmVzdHJpY3Rpb25zIC5zdWItbWVudVwiKS5oaWRlKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9KTtcblxuICAgIC8vICBldmVudCBsaXN0ZW5lciBmb3Igc2hvd2luZy9oaWRpbmcgc3ViLW1lbnUgb2Ygb25seSBjdWlzaW5lIHR5cGUgd2hpbGUgaGlkaW5nIG90aGVyIHN1Yi1tZW51c1xuICAgICQoJy5jdWlzaW5lLXR5cGUgYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgJChcIi5zcGlubmVyLW92ZXJsYXlcIikudG9nZ2xlKCk7XG4gICAgICAgICQoXCIuY3Vpc2luZS10eXBlIC5zdWItbWVudVwiKS50b2dnbGUoKTtcbiAgICAgICAgJChcIi5jb3Vyc2UtdHlwZSAuc3ViLW1lbnVcIikuaGlkZSgpO1xuICAgICAgICAkKFwiLmRpZXRhcnktcmVzdHJpY3Rpb25zIC5zdWItbWVudVwiKS5oaWRlKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9KVxuXG4gICAgLy8gIGV2ZW50IGxpc3RlbmVyIGZvciBzaG93aW5nL2hpZGluZyBzdWItbWVudSBvZiBvbmx5IGRpZXRhcnkgcmVzdHJpY3Rpb25zIHdoaWxlIGhpZGluZyBvdGhlciBzdWItbWVudXNcbiAgICAkKCcuZGlldGFyeS1yZXN0cmljdGlvbnMgYnV0dG9uJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgJChcIi5zcGlubmVyLW92ZXJsYXlcIikudG9nZ2xlKCk7XG4gICAgICAgICQoXCIuZGlldGFyeS1yZXN0cmljdGlvbnMgLnN1Yi1tZW51XCIpLnRvZ2dsZSgpO1xuICAgICAgICAkKFwiLmN1aXNpbmUtdHlwZSAuc3ViLW1lbnVcIikuaGlkZSgpO1xuICAgICAgICAkKFwiLmNvdXJzZS10eXBlIC5zdWItbWVudVwiKS5oaWRlKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9KVxuXG4gICAgLy8gZW1wdHkgYXJyYXkgdGhhdCBzdG9yZXMgc2VsZWN0ZWQgY3Vpc2luZSB0eXBlXG4gICAgbGV0IHNlbGVjdGVkSG9sZGVyID0gW107XG5cbiAgICAkKFwiLnN1Yi1tZW51IGlucHV0W3R5cGU9Y2hlY2tib3hdXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbGV0IHNlbGVjdGVkVmFsdWUgPSAkKHRoaXMpLnZhbCgpO1xuICAgICAgICAvLyBmaWx0ZXJzIHRocm91Z2ggdGhlIGFycmF5IGFuZCB0YWtlcyBvdXQgY3Vpc2luZSB0eXBlcyB0aGF0IGFyZSBpbiB0aGUgYXJyYXkgYW5kIGhhdmUgYmVlbiBjbGlja2VkIG9uIGFnYWluXG4gICAgICAgIGlmIChzZWxlY3RlZEhvbGRlci5pbmNsdWRlcyhzZWxlY3RlZFZhbHVlKSkge1xuICAgICAgICAgICAgc2VsZWN0ZWRIb2xkZXIgPSBzZWxlY3RlZEhvbGRlci5maWx0ZXIoc2VsZWN0ZWQgPT4gc2VsZWN0ZWQgIT0gc2VsZWN0ZWRWYWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxlY3RlZEhvbGRlci5wdXNoKHNlbGVjdGVkVmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbi8vICB0aGUgaW5pdCBtZXRob2QgaW5pdGlhbGl6ZXMgYWxsIHRoZSBuZWNlc3NhcnkgbWV0aG9kcyB3aGVuIHRoZSBwYWdlIGxvYWRzXG5mb29kQXBwLmluaXQgPSAoKSA9PiB7XG4gICAgJCgnLnJlY2lwZS1zZWFyY2gnKS50cmlnZ2VyKCdyZXNldCcpO1xuICAgICQoJy5pbml0aWFsLXNlYXJjaCcpLnRyaWdnZXIoJ3Jlc2V0Jyk7XG4gICAgZm9vZEFwcC5ldmVudHMoKTtcbn07XG5cbi8vICBkb2N1bWVudC5yZWFkeSB0byBjYWxsIHRoZSBpbml0IG1ldGhvZCBvbmNlIHRoZSBwYWdlIGlzIGZpbmlzaGVkIGxvYWRpbmdcbiQoZnVuY3Rpb24gKCkge1xuICAgIGZvb2RBcHAuaW5pdCgpO1xufSk7Il19
