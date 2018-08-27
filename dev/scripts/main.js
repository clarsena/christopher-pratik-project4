//  namespace for the project
const foodApp = {};

foodApp.apiID = '?_app_id=29d4e9cb'
foodApp.apiKey = '&_app_key=3d9fe704063a8a69bdc768b960f23f6e';
foodApp.allRecipiesApiURL = `http://api.yummly.com/v1/api/recipes${foodApp.apiID}`;
foodApp.singleRecipeApiURL = 'http://api.yummly.com/v1/api/recipe/';
foodApp.totalResultCount = 0;

//  the getAllRecipes method takes in the parameters from the search form and gets the matching data from the API. The results are then stored in the storedResults array
foodApp.getAllRecipes = (ingredients, courseType, cuisineType, dietary) => {

    // show spinner
    $(".spinner-overlay").show();
    $("i.fa-spinner").css('display', 'inline-block');

    $.ajax({
        url: `${foodApp.allRecipiesApiURL}${foodApp.apiKey}${courseType}${cuisineType}${dietary}`,
        method: 'GET',
        dataType: 'json',
        data: {
            q: ingredients,
            requirePictures: true,
            maxResult: 504,
            start: foodApp.recipePages,
        }
    })
        .then((result) => {
            // hide spinner
            $("i.fa-spinner").hide();
            $(".spinner-overlay").hide();

            foodApp.storedResults = [];
            foodApp.pagedResults = [];
            foodApp.recipePages = 0;
            result.matches.forEach((res) => {
                foodApp.storedResults.push(res);
            });
            foodApp.totalResultCount = result.totalMatchCount;
            foodApp.splitRecipes();
            foodApp.displayRecipes(foodApp.pagedResults[foodApp.recipePages]);
        });
}

//  the splitRecipes method splits the intially stored results into an array of results pages, with 21 entries on each
foodApp.splitRecipes = () => {
    for (let i = 0; i < foodApp.storedResults.length; i += 18) {
        const block = foodApp.storedResults.slice(i, i + 18);
        foodApp.pagedResults.push(block);
    }
}

//  the displayRecipes method takes the recipes and breaks them down to be displayed on screen
foodApp.displayRecipes = (recipes) => {
    //  clear the results from the page as well as any displaying buttons
    $('.recipe-list').empty();
    $('.page-results-container').empty();
    const resultsCount = `<div class="results-count-container">
    <h3>Recipes Gathered: ${foodApp.storedResults.length}</h3>
    </div>`;
    $('.recipe-list').append(resultsCount);
    //  loop through the array for the current page and grab the individual recipes info
    recipes.forEach((item) => {
        foodApp.getSingleRecipe(item.id);
    });
    //  only show the show previous button if there are results to go back to
    if (foodApp.recipePages > 0) {
        const showPreviousButton = `<button class="show-previous show-button">Show Previous Results</button>`;
        $('.page-results-container').append(showPreviousButton);
    }
    //  only show the show more button if there are still more results to show
    if (foodApp.recipePages <= ((foodApp.pagedResults.length) - 2)) {
        const showMoreButton = `<button class="show-more show-button">Show More Results</button>`;
        $('.page-results-container').append(showMoreButton);
    }
    $('footer').empty();
    $('footer').append(`<h4>Created by Christopher Arsenault & Pratik Gauchan - chrisPratt Codes &copy; 2018</h4>`);
}

//  the rating method converts the numerical rating (if present) and displays stars in its place
foodApp.rating = (ratingNum) => {
    let tempRating = '';
    if (ratingNum) {
        for (let i = 1; i <= ratingNum; i++) {
            tempRating += `<span class="star"><i class="fas fa-star"></i></span>`;
        }
    }
    return tempRating;
}

//  the getSingleRecipe method takes in a recipeID and pulls the info for that specific recipe
foodApp.getSingleRecipe = (recipeID) => {
    $.ajax({
        url: `${foodApp.singleRecipeApiURL}${recipeID}${foodApp.apiID}${foodApp.apiKey}`,
        method: 'GET',
        dataType: 'json',
    })
        .then((result) => {
            console.log(result);
            //  format the returned courses and cuisine attributes for the page
            let courses = "---";
            if (result.attributes.course) {
                courses = result.attributes.course.join(', ')
            }
            let cuisines = "---";
            if (result.attributes.cuisine) {
                cuisines = result.attributes.cuisine.join(', ');
            }
            const rating = foodApp.rating(result.rating);

            //  create the HTML elements to write the recipe to the DOM and append it to the recipe-list div
            const showRecipe = `
            <a href="${result.source.sourceRecipeUrl}" target="top">
                <div class="recipe-container">
                    <div class="img-container">
                        <img src='${result.images[0].hostedLargeUrl}'>
                    </div>
                
                    <h2>${result.name}</h2>
                    <h4>Rating: ${rating}</h4>
                    <h3>Total Time to Prepare: ${result.totalTime}</h3>
                    <h3>Number of Servings: ${result.numberOfServings}</h3>
                    <h3>Course Types: ${courses}</h3>
                    <h3>Cuisine Types: ${cuisines}</h3>
                </div>

                <div class="recipe-overlay">
                    <h3>Click here to read the full recipe</h3>
                </div>
            </a>`
            $('.recipe-list').append(showRecipe);
        });
}

//  the events method will hold general event listeners for the site
foodApp.events = () => {

    $('.initial-search').on('submit', function (e) {
        e.preventDefault();
        const ingredients = $('.initial-search-box').val();
        $('.main-welcome-page').hide();
        $('nav').show();
        $('.recipe-search-box').val($('.initial-search-box').val());

        foodApp.getAllRecipes(ingredients, '', '', '');

    });

    $('.submit button').on('click', function (e) {

        //  store the results from the form to be used later for pagination
        const ingredients = $('.recipe-search-box').val();
        const courses = $('input[name=course-type]:checked').val();
        const cuisines = $('input[name=cuisine-type]:checked').map(function () {
            return $(this).val();
        }).get().join('');
        const dietary = $('input[name=dietary-restrictions]:checked').val();
        //  send the search results to the getAllRecipes method to pull the data from the API
        foodApp.getAllRecipes(ingredients, courses, cuisines, dietary);

    });

    //  event listener to clear the search form
    $('.form-reset').on('click', function () {
        $('.recipe-search').trigger('reset');
    })

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
    })

    //  event listener for showing/hiding sub-menu of only dietary restrictions while hiding other sub-menus
    $('.dietary-restrictions button').on('click', function (e) {
        $(".spinner-overlay").toggle();
        $(".dietary-restrictions .sub-menu").toggle();
        $(".cuisine-type .sub-menu").hide();
        $(".course-type .sub-menu").hide();
        e.preventDefault();
    })

    // empty array that stores selected cuisine type
    let selectedHolder = [];

    $(".sub-menu input[type=checkbox]").on('click', function () {
        let selectedValue = $(this).val();
        // filters through the array and takes out cuisine types that are in the array and have been clicked on again
        if (selectedHolder.includes(selectedValue)) {
            selectedHolder = selectedHolder.filter(selected => selected != selectedValue);
        } else {
            selectedHolder.push(selectedValue);
        }
    });
}

//  the init method initializes all the necessary methods when the page loads
foodApp.init = () => {
    $('.recipe-search').trigger('reset');
    $('.initial-search').trigger('reset');
    foodApp.events();
};

//  document.ready to call the init method once the page is finished loading
$(function () {
    foodApp.init();
});