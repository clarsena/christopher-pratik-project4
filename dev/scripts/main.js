//  Customer enters their required search parameters (ingredients, course type, cusisine type, dietary restrictions)
//  Example of a search for chicken and broccoli / Main dish / Italian / No dietary restriction
//  Do an API call for all recipes with chicken and broccoli
//  Then filter the results based on the other criteria - starting with course type - then cuisine type - then dietary restrcitions
//  The data is pulled from the API and displayed onto the page in a list
//  The filtered results will then be broken down into individual recipes - displaying an image of the dish, the name of the dish and a  description of it
//  need to store recipe id from each filtered result and do a separate pull to get the info from there
//  The recipes will be clickable to take them to a full view of them
//  The recipes will be opened in a new tab

//  namespace for the project
const foodApp = {};

foodApp.apiID = '?_app_id=29d4e9cb'
foodApp.apiKey = '&_app_key=3d9fe704063a8a69bdc768b960f23f6e';
foodApp.allRecipiesApiURL = `http://api.yummly.com/v1/api/recipes${foodApp.apiID}`;
foodApp.singleRecipeApiURL = 'http://api.yummly.com/v1/api/recipe/';
foodApp.totalResultCount = 0;

//  the getAllRecipes method takes in the parameters from the search form and gets the matching data from the API. The results are then stored in the storedResults array
foodApp.getAllRecipes = (ingredients, courseType, cuisineType, dietary) => {
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
    for (let i = 0; i < foodApp.storedResults.length; i += 21) {
        const block = foodApp.storedResults.slice(i, i + 21);
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
    if(foodApp.recipePages > 0) {
        const showPreviousButton = `<button class="show-previous show-button">Show Previous Results</button>`;
        $('.page-results-container').append(showPreviousButton);
    }
    //  only show the show more button if there are still more results to show
    if(foodApp.recipePages <= ((foodApp.pagedResults.length) - 2)) {
        const showMoreButton = `<button class="show-more show-button">Show More Results</button>`;
        $('.page-results-container').append(showMoreButton);
    }
}

//  the getSingleRecipe method takes in a recipeID and pulls the info for that specific recipe
foodApp.getSingleRecipe = (recipeID) => {
    $.ajax({
        url: `${foodApp.singleRecipeApiURL}${recipeID}${foodApp.apiID}${foodApp.apiKey}`,
        method: 'GET',
        dataType: 'json',
    })
        .then((result) => {
            //  format the returned courses and cuisine attributes for the page
            let courses = "---";
            if (result.attributes.course) {
                courses = result.attributes.course.join(', ')
            }
            let cuisines = "---";
            if (result.attributes.cuisine) {
                cuisines = result.attributes.cuisine.join(', ');
            }
            //  create the HTML elements to write the recipe to the DOM and append it to the recipe-list div
            const showRecipe = `<a href="${result.source.sourceRecipeUrl}" target="top"><div class="recipe-container">
        <div class="img-container"><img src='${result.images[0].hostedLargeUrl}'></div>
        <h2>${result.name}</h2>
        <h3>Rating: ${result.rating} / 5</h3>
        <h3>Total Time to Prepare: ${result.totalTime}</h3>
        <h3>Number of Servings: ${result.numberOfServings}</h3>
        <h3>Course Types: ${courses}</h3>
        <h3>Cuisine Types: ${cuisines}</h3>
        
        </div><div class="recipe-overlay"><h3>Click here to read the full recipe</h3></div></a>`
        $('.recipe-list').append(showRecipe);
    });
}

//  the events method will hold general event listeners for the site
foodApp.events = () => {
    $('.initial-search').on('submit', function (e) {
        e.preventDefault();
        const ingredients = $('input[type=text]').val();
        $('.main-welcome-page').hide();
        $('nav').show();
        $('.recipe-search-box').val($('.initial-search-box').val());
        foodApp.getAllRecipes(ingredients, '', '', '');
    });
    $('.recipe-search').on('submit', function (e) {
        e.preventDefault();
        //  store the results from the form to be used later for pagination
        const ingredients = $('input[type=text]').val();
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