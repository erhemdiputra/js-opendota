$(document).ready(function(){
    $("#btn-show").click(function() {
        getData();
    });
});

function getProTeam() {
    return new Promise(
        function(resolve, reject) {
            $.ajax({
                url: 'https://api.opendota.com/api/teams',
                type: 'GET',
                success: function(data) {
                    resolve(data);
                },
                error: function() {
                    console.log("Failed to fetch pro team API");
                }
            })
        }
    )
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

function getPlayerInfo(teams) {
    return new Promise(
        function(resolve, reject) {
            teams = teams.splice(0, 10)

            var promises = [];
            var maps = new Map();

            for (var idx = 0; idx < teams.length; idx++) {
                const team_id = teams[idx].team_id;

                var request = $.ajax({
                    url: 'https://api.opendota.com/api/teams/'+ team_id +'/players',
                    type: 'GET',
                    success: function(players) {
                        maps.set(team_id, filterActivePlayer(players))
                    },
                    error: function() {
                        console.log('Failed to fetch player info api');
                    }
                })

                promises.push(request);
            }

            $.when.apply(null, promises).done(function() {
                var data = {
                    teams: teams,
                    maps: maps,
                }
                resolve(data);
            })
        }
    )
}

function showData(data) {
    const teams = data.teams;
    const maps = data.maps;

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


function getData() {
    getProTeam()
        .then(getPlayerInfo)
        .then(showData)
}