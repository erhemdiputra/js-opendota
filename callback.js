$(document).ready(function(){
    $("#btn-show").click(function() {
        getProTeam(getPlayerInfo);
    });
});

function getProTeam(cb1, cb2) {
    $.ajax({
        url: 'https://api.opendota.com/api/teams',
        type: 'GET',
        success: function(data) {
            cb1(data, cb2);
        },
        error: function() {
            console.log('failed to fetch pro team api');
        }
    })
}

function getPlayerInfo(teams) {
    teams = teams.slice(0, 10)

    var promises = [];
    var maps = new Map();

    for (var idx = 0; idx < teams.length; idx++) {
        const team_id = teams[idx].team_id;

        promises.push($.ajax({
            url: 'https://api.opendota.com/api/teams/'+ team_id +'/players',
            type: 'GET',
            success: function(players) {
                maps.set(team_id, filterActivePlayer(players))
            },
            error: function() {
                console.log('failed to fetch player info api');
            }
        }))
    }   

    $.when.apply(null, promises).done(function(){
        showData(teams, maps);
    })
}

function filterActivePlayer(players) {
    var list = [];

    for (var idx = 0; idx < players.length; idx++) {
        const player = players[idx];
        if (player.is_current_team_member == true) {
            list.push(player);
        }
    }

    return list;
}

function showData(teams, maps) {
    var table = document.getElementById("table-team");

    teams.forEach(function(team, idx) {
        var tr = document.createElement("tr");

        var players = maps.get(team.team_id);
        var playerNameList = [];

        if (players.length > 0) {
            players.forEach(function(player) {
                playerNameList.push(player.name);
            })
        }
        var playerNameStr = playerNameList.join(" , ")


        var attributes = [idx+1, team.name, team.tag, team.rating, playerNameStr]
        attributes.forEach(function(attribute, idx) {
            var data = document.createTextNode(attribute)
            var col = document.createElement("td");

            col.appendChild(data);
            tr.appendChild(col);

            table.appendChild(tr);
        })
    })
}