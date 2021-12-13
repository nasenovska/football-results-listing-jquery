const baseUrl = "https://api-football-v1.p.rapidapi.com/v3";
const settings = {
    headers: {
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
        "x-rapidapi-key": "601c5b08efmshd63d9cc4ea9e9a3p146f3ejsn1eb506efe7fc",
    },
    async: true,
    crossDomain: true,
};

let view = "list";
let cards = [];

function getCards() {
    cards = [];
    $("#card-list").hide();
    $("#error-alert").addClass("d-none");
    $("#card-loading").addClass("d-flex").removeClass("d-none");

    const {team, ...otherFilters} = getCurrentFilters();
    $.ajax({
        ...settings,
        method: "GET",
        url: `${baseUrl}/teams`,
        data: otherFilters,
    })
        .done((response) => {
            console.log(response);
            cards = response.response;
            renderCardsList();
            $("#card-list").show();
            getLeagues();
            getSeasons();
            getCountries();
        })
        .fail((response) => {
            const $errorAlert = $("#error-alert");
            $errorAlert.text(response.errors.required);
            $errorAlert.removeClass("d-none");
        })
        .always(() => {
            $("#card-loading").addClass("d-none").removeClass("d-flex");
        });
}

function renderCardsList() {
    $teamsList = $("#card-list");
    $teamsList.empty();

    const maxResults = $("#max-result").val();
    console.log("cards" + cards)
    cards
        .filter((card) => card.team.logo)
        .reduce(
            (accumulator, card) =>
                accumulator.some((c) => c.team.name === card.team.name)
                    ? accumulator
                    : [...accumulator, card],
            []
        )
        .slice(0, maxResults)
        .forEach((cards) => {
            const $template = getCardTemplate(cards);
            $teamsList.append($template);
        });
}

function getCardTemplate(card) {
    const templateSelector = `#card-${view}-template`;
    const $template = $($(templateSelector).html());
    $template.find(".card-name").text(card.team.name);
    const image = card.team.logo ?? "";
    $template.find(".card-image").attr("src", image);

    const info = 'Country: ' + card.team.country + ', founded: ' + card.team.founded;
    const description =
        info &&
        info
            .replaceAll("\\n", " ")
            .replaceAll("_", " ")
            .replaceAll("[x]", " ");
    $template.find(".card-description").html(description);
    $template.find(".card-nat").text(card.team.national ? 'National: Yes' : 'National: No');
    return $template;
}

$("#grid-view").click((e) => {
    view = "grid";
    $(e.currentTarget).addClass("btn-primary").removeClass("btn-outline-primary");
    $("#list-view").addClass("btn-outline-primary").removeClass("btn-primary");
    renderCardsList();
});

$("#list-view").click((e) => {
    view = "list";
    $(e.currentTarget).addClass("btn-primary").removeClass("btn-outline-primary");
    $("#grid-view").addClass("btn-outline-primary").removeClass("btn-primary");
    renderCardsList();
});

function getLeagues() {
    $('<option/>').val(null).text("None").appendTo('#league-filter')
    $.ajax({
        ...settings,
        method: "GET",
        url: `${baseUrl}/leagues`
    })
        .done((response) => {
            cards = response.response;
            cards.forEach((league) => {
                $('<option/>').val(league.league.id).text(league.league.name).appendTo('#league-filter')
            })
        })
        .fail((response) => {
            const $errorAlert = $("#error-alert");
            $errorAlert.text(response.errors.message);
            $errorAlert.removeClass("d-none");
        })
        .always(() => {
            $("#card-loading").addClass("d-none").removeClass("d-flex");
        });
}

function getSeasons() {
    $('<option/>').val(null).text("None").appendTo('#season-filter')
    $.ajax({
        ...settings,
        method: "GET",
        url: `${baseUrl}/leagues/seasons`
    })
        .done((response) => {
            cards = response.response;
            cards.forEach((season) => {
                $('<option/>').val(season).text(season).appendTo('#season-filter')
            })
        })
        .fail((response) => {
            const $errorAlert = $("#error-alert");
            $errorAlert.text(response.errors.message);
            $errorAlert.removeClass("d-none");
        })
        .always(() => {
            $("#card-loading").addClass("d-none").removeClass("d-flex");
        });
}

function getCountries() {
    $('<option/>').val(null).text("None").appendTo('#country-filter')
    $.ajax({
        ...settings,
        method: "GET",
        url: `${baseUrl}/countries`
    })
        .done((response) => {
            cards = response.response;
            cards.forEach((country) => {
                $('<option/>').val(country.name).text(country.name).appendTo('#country-filter')
            })
        })
        .fail((response) => {
            const $errorAlert = $("#error-alert");
            $errorAlert.text(response.errors.message);
            $errorAlert.removeClass("d-none");
        })
        .always(() => {
            $("#card-loading").addClass("d-none").removeClass("d-flex");
        });
}

function getCurrentFilters() {
    const name = $("#name-filter").val();
    const league = $("#league-filter").val();
    const season = $("#season-filter").val();
    const country = $("#country-filter").val();

    const filterObject = {name, league, season, country};
    Object.keys(filterObject).forEach(
        (key) => filterObject[key] === "" && delete filterObject[key]
    );

    return filterObject;
}

getCards();
