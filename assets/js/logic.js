var clickSound = document.createElement("audio");
clickSound.setAttribute("src", "assets/audio/shooting-star.mp3");

a2a_config.overlays = a2a_config.overlays || [];
    a2a_config.overlays.push({
    services: ['facebook', 'twitter', 'facebook_messenger', 'sms', 'google_gmail', 'email', 'whatsapp', 'copy_link'],
    size: '50',
    style: 'horizontal',
    position: 'top center'
});

var filteredPriceLow;
var filteredPriceMid;
var filteredPriceHigh;
var inviteBrunchSpotName;
var inviteBrunchSpotAddress;

$("#resultsWrap").addClass("hide");

function initMap(restLat, restLng) {
    console.log(restLat);
    console.log(restLng);

    restLat = parseFloat(restLat);
    restLng = parseFloat(restLng);
    var myLatLng = { lat: restLat, lng: restLng };

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: myLatLng
    });

    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map,
        title: 'Restaurant Map'
    });
}


$("#submitSearch").on("click", function (event) {
    event.preventDefault();
    $("#firstForm").toggle();
    console.log("click")


    clickSound.play();

    var zipCode = $("#zip").val().trim();
    var pricePoint = $("#pricePoint").val().trim();

    $("#loader").removeClass("hide");

    $.ajax({
        url: "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/geocode/json?address=" + zipCode + "&key=AIzaSyBJdJBJ82riE78r65LwDdZ4RraI1bn2ES8",
        method: "GET"
    }).then(function (gmRes) {

        if (gmRes.results.length > 0) {
            var lat = gmRes.results[0].geometry.location.lat;
            var lng = gmRes.results[0].geometry.location.lng;

            console.log(lat + ", " + lng)
            //ajax call to the zomato api, plugging in values fo lat and long

            $.ajax({
                url: "https://cors-anywhere.herokuapp.com/https://developers.zomato.com/api/v2.1/search?q=brunch&lat=" + lat + "&lon=" + lng + "&apikey=527733933cfc51b0f78491172626a1a3&count=all",
                method: "POST",
            }).then(function (response) {
                console.log(response)
                $("#loader").addClass("hide");

                // make suere there is value that comes back otherwise add text to .alter-msg and remove class hide from #alert to give the user feedback
                if (response.restaurants.length > 0) {
                    var restaurants = response.restaurants;
                    filteredPriceLow = restaurants.filter(restaurant => restaurant.restaurant.price_range === 1);
                    filteredPriceMid = restaurants.filter(restaurant => restaurant.restaurant.price_range === 2 || restaurant.restaurant.price_range === 3);
                    filteredPriceHigh = restaurants.filter(restaurant => restaurant.restaurant.price_range === 4 || restaurant.restaurant.price_range === 5);

                    switch (pricePoint) {
                        case "$":
                            createBrunchHTML(filteredPriceLow, "filteredPriceLow");
                            break;
                        case "$$":
                            createBrunchHTML(filteredPriceMid, "filteredPriceMid");
                            break;
                        case "$$$":
                            createBrunchHTML(filteredPriceHigh, "filteredPriceHigh");
                            break;
                        default:

                    }


                } else {
                    $(".alert-msg").text("")
                    $(".alert-msg").text("sorry no brunch for you.")
                    $("#alert").removeClass("hide");
                }

            });
        } else {
            $("#loader").addClass("hide");
            $(".alert-msg").text("")
            $(".alert-msg").text("sorry there was an issue with the zipcode provided. Please check the input and try again.")
            $("#alert").removeClass("hide");
        }
    });
})



function createBrunchHTML(pricePointFilter, pricePoint) {

  var clearBtn = $("<button>").attr("id", "clear").addClass("btn btn-primary center-block").text("Dynamic Clear")
  $("#resultsWrap").append(clearBtn);

    pricePointFilter.forEach(function (result, i) {
        var brunchSpotName = result.restaurant.name;
        var brunchSpotImage = result.restaurant.thumb;

        var brunchWrap = $("<div>").addClass("card mb-3 center").attr("id", "brunchSpot-" + i).attr("data-index", i);

        var row = $("<div>").addClass("row no-gutters");

        var col1 = $("<div>").addClass("col-md-4").attr("id", "brunchImg-" + i);
        var img = $("<img>").attr("src", brunchSpotImage).attr("alt", "brunch spot");
        $(col1).append(img);

        var col2 = $("<div>").addClass("col-md-4 text-center")
        var content = $("<div>").addClass("card-body");

        var h2 = $("<h2>").addClass("card-title").attr("id", "brunchName-"+i).text(brunchSpotName);
        var btn = $("<button>").attr("type", "button").addClass("btn btn-primary bellhop buttonMore").attr("data-index", i).attr("id", "ButtonMore-"+i).attr("data-price", pricePoint).text("Tell Me More")

        $(content).append(h2, btn)
        $(col2).append(content);

        $(row).append(col1, col2);

        $(brunchWrap).append(row)


        $("#resultsWrap").append(brunchWrap);
        $("#resultsWrap").slideDown('slow');
    });

}

$("#resultsWrap").on("click", "#clear" , function(event) {
  $("#resultsWrap").empty()
  $("#firstForm").toggle();
  })



$("#alert-btn").click(function () {
    $("#alert").slideUp("slow")
    $(".alert-msg").text("")
})


$(document).on("click", ".buttonMore", function(){
    var index =  parseInt($(this).data("index"));
    var pricePoint = $(this).data("price");
    $("#inviteFormWrap").addClass("hide");
    $("#inviteWrap").addClass("hide");
  



    if (pricePoint === "filteredPriceLow") {
        var result = filteredPriceLow[index];
        console.log(index);

        var brunchSpotName = result.restaurant.name;
        $("#rName").html(brunchSpotName);
        var brunchSpotImage = result.restaurant.thumb;
        $("#rImg").attr("src", brunchSpotImage)

        var brunchSpotAddress = result.restaurant.location.address;
        $("#rStreet").html(brunchSpotAddress);
        var brunchSpotCity = result.restaurant.location.locality_verbose;
        $("#rCity").html(brunchSpotCity)
        var brunchSpotRating = result.restaurant.user_rating.aggregate_rating;
        $("#rRating").text("Rating: " + brunchSpotRating);

        var restLat = result.restaurant.location.latitude;
        var restLng = result.restaurant.location.longitude;




        initMap(restLat, restLng);
        
        $("#resultsModal").modal("show")
        
    



    } else if (pricePoint === "filteredPriceMid") {
        var result = filteredPriceMid[index];

        var brunchSpotName = result.restaurant.name;
        $("#rName").html(brunchSpotName);
        var brunchSpotImage = result.restaurant.thumb;
        $("#rImg").attr("src", brunchSpotImage)

        var brunchSpotAddress = result.restaurant.location.address;
        $("#rStreet").html(brunchSpotAddress);
        var brunchSpotCity = result.restaurant.location.locality_verbose;
        $("#rCity").html(brunchSpotCity)
        var brunchSpotRating = result.restaurant.user_rating.aggregate_rating;
        $("#rRating").text("Rating: " + brunchSpotRating);

        var restLat = result.restaurant.location.latitude;
        var restLng = result.restaurant.location.longitude;

        initMap(restLat, restLng);
        $("#resultsModal").modal("show")


     
    } else {
        (pricePoint === "filteredPriceHigh")
        var result = filteredPriceHigh[index];

        var brunchSpotName = result.restaurant.name;
        $("#rName").html(brunchSpotName);
        var brunchSpotImage = result.restaurant.thumb;
        $("#rImg").attr("src", brunchSpotImage)

        var brunchSpotAddress = result.restaurant.location.address;
        $("#rStreet").html(brunchSpotAddress);
        var brunchSpotCity = result.restaurant.location.locality_verbose;
        $("#rCity").html(brunchSpotCity)
        var brunchSpotRating = result.restaurant.user_rating.aggregate_rating;
        $("#rRating").text("Rating: " + brunchSpotRating);

        var restLat = result.restaurant.location.latitude;
        var restLng = result.restaurant.location.longitude;


        initMap(restLat, restLng);
        $("#resultsModal").modal("show");
    }
    inviteBrunchSpotName = brunchSpotName;
    inviteBrunchSpotAddress = brunchSpotAddress;
})

$(document).on("click", ".buttonInvite", function() {
    $("#resultsLarge").addClass("hide");
    $("#inviteFormWrap").removeClass("hide")
});

$(document).on("click", ".modalClose", function() {
    $("#resultsLarge").removeClass("hide");
    $("#inviteFormWrap").addClass("hide");
    $("#inviteWrap").addClass("hide");
    $("#inviteInsertWrap").empty();
    
});

$(document).on("click", "#bubblyButton", function() {
    $("#inviteBackground").attr("src", "https://i.pinimg.com/564x/02/de/85/02de8582b278ecfc14d9c1a45508e3e4.jpg");
});
$(document).on("click", "#eggButton", function() {
    $("#inviteBackground").attr("src", "https://i.pinimg.com/564x/23/ad/f0/23adf058de303e77b35df2fb80f78877.jpg");
});
$(document).on("click", "#floralButton", function() {
    $("#inviteBackground").attr("src", "https://i.pinimg.com/564x/53/c3/6a/53c36a20c23568942e55d5874836291c.jpg");
});

$(document).on("click", ".submitInvite", function() {
    // $("#resultsLarge").addClass("hide");
    $("#inviteFormWrap").addClass("hide");
    $("#inviteWrap").removeClass("hide");
    // $("#inviteInsert").addClass("hide");

    var hostName = $("#hostName").val().trim();
    var eventDate = $("#eventDate").val().trim();
    var eventTime = $("#eventTime").val().trim();
    var customMessage = $("#customMessage").val().trim();

    $(".hostNamePrint").html(hostName);
    $(".eventDatePrint").html(eventDate + "at" + eventTime);
    $(".venueNamePrint").html(inviteBrunchSpotName);
    $(".venueAddressPrint").html(inviteBrunchSpotAddress);
    $(".customMessagePrint").html(customMessage);

});

$(document).on("click", ".editInviteButton", function() {
    $("#inviteWrap").addClass("hide");
    $("#inviteFormWrap").removeClass("hide");
    $("#inviteInsertWrap").empty();
});

$(document).on("click", ".saveInviteButton", function() {
    $("#editInviteButton").addClass("hide");
    $("#saveInviteButton").addClass("hide");
    
    var downloadButton = $("<button>").attr("type", "button").addClass("btn btn-primary bellhop downloadInvite").text("Download Invite");

    a2a_config.overlays = a2a_config.overlays || [];
    a2a_config.overlays.push({
    services: ['facebook', 'twitter', 'facebook_messenger', 'sms', 'google_gmail', 'email', 'whatsapp', 'copy_link'],
    size: '50',
    style: 'horizontal',
    position: 'top center'
});

    GrabzIt("ODNkNjJmNzIxYTgxNGY5MGI4OTc0MmMyMjc5YzIzNmQ=").ConvertPage({"target": "#inviteImageDiv", "onstart": function(id){
        $("#inviteImageDiv").addClass("hide");
    }, "onfinish": function(id) {
        $("#inviteWrap").append(downloadButton);
    }}).AddTo("inviteInsertWrap");
    
});

