/* =========================================
   POT TEAM BALANCER
========================================= */


/* =========================================
   DOM
========================================= */

const teamCountInput =
    document.getElementById("teamCount");

const teamInputs =
    document.getElementById("teamInputs");

const continueBtn =
    document.getElementById("continueBtn");

const playerSetup =
    document.getElementById("playerSetup");

const playerInput =
    document.getElementById("playerInput");

const startBtn =
    document.getElementById("startBtn");

const gameSection =
    document.getElementById("gameSection");

const wheel =
    document.getElementById("wheel");

const spinBtn =
    document.getElementById("spinBtn");

const selectedPlayer =
    document.getElementById("selectedPlayer");

const selectedPot =
    document.getElementById("selectedPot");

const assignedTeam =
    document.getElementById("assignedTeam");

const teamsContainer =
    document.getElementById("teamsContainer");

const remainingCounter =
    document.getElementById("remainingCounter");

const resultSection =
    document.getElementById("resultSection");

const finalTeams =
    document.getElementById("finalTeams");

const resetBtn =
    document.getElementById("resetBtn");

const statusText =
    document.getElementById("statusText");


/* =========================================
   VARIABLES
========================================= */

let teams = [];

let remainingPlayers = [];

let isSpinning = false;

let currentRotation = 0;


/*
    POT score
*/

const POT_SCORE = {

    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5

};


/* =========================================
   GENERATE TEAM INPUTS
========================================= */

teamCountInput.addEventListener(
    "input",
    generateTeamInputs
);


function generateTeamInputs() {

    let count =
        parseInt(
            teamCountInput.value
        );


    if (!count || count < 2) {

        count = 2;
    }


    if (count > 20) {

        count = 20;

        teamCountInput.value = 20;
    }


    teamInputs.innerHTML = "";


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "team-input";


        wrapper.innerHTML = `

            <span>
                TEAM ${i + 1}
            </span>

            <input
                type="text"
                class="team-name-input"
                placeholder="Nama Team ${i + 1}"
            >

        `;


        teamInputs.appendChild(
            wrapper
        );

    }

}


/* =========================================
   INITIAL
========================================= */

generateTeamInputs();


/* =========================================
   TEAM SETUP
========================================= */

continueBtn.addEventListener(
    "click",
    continueToPlayers
);


function continueToPlayers() {

    const inputs =
        document.querySelectorAll(
            ".team-name-input"
        );


    const names = [];


    inputs.forEach(input => {

        const name =
            input.value.trim();


        if (name) {

            names.push(name);

        }

    });


    if (
        names.length !==
        inputs.length
    ) {

        alert(
            "Isi semua nama tim terlebih dahulu."
        );

        return;
    }


    /*
        Duplicate check
    */

    const uniqueNames =
        new Set(names);


    if (
        uniqueNames.size !==
        names.length
    ) {

        alert(
            "Nama tim tidak boleh sama."
        );

        return;
    }


    /*
        Create teams
    */

    teams =
        names.map(name => ({

            name: name,

            players: [],

            totalScore: 0

        }));


    playerSetup.classList.remove(
        "hidden"
    );


    playerSetup.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


/* =========================================
   PARSE PLAYER
========================================= */

function parsePlayers(text) {

    const lines =
        text
            .split("\n")
            .map(
                line =>
                    line.trim()
            )
            .filter(
                line =>
                    line !== ""
            );


    const players = [];


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line =
            lines[i];


        /*
            Format:

            Alfi | 5
        */

        const parts =
            line.split("|");


        if (
            parts.length !== 2
        ) {

            throw new Error(
                `Format player salah pada baris ${i + 1}. Gunakan: Nama | POT`
            );

        }


        const name =
            parts[0].trim();


        const pot =
            parseInt(
                parts[1].trim()
            );


        /*
            Validate name
        */

        if (!name) {

            throw new Error(
                `Nama player kosong pada baris ${i + 1}.`
            );

        }


        /*
            Validate POT
        */

        if (
            !POT_SCORE[pot]
        ) {

            throw new Error(
                `POT player "${name}" tidak valid. Gunakan POT 1 sampai POT 5.`
            );

        }


        players.push({

            name: name,

            pot: pot,

            score:
                POT_SCORE[pot]

        });

    }


    return players;

}


/* =========================================
   START GAME
========================================= */

startBtn.addEventListener(
    "click",
    startSelection
);


function startSelection() {

    try {

        const players =
            parsePlayers(
                playerInput.value.trim()
            );


        /*
            Minimum player
        */

        if (
            players.length <
            teams.length
        ) {

            alert(
                "Jumlah player minimal harus sama dengan jumlah tim."
            );

            return;
        }


        /*
            Duplicate player check
        */

        const names =
            players.map(
                player =>
                    player.name.toLowerCase()
            );


        if (
            new Set(names).size !==
            names.length
        ) {

            alert(
                "Nama player tidak boleh duplikat."
            );

            return;
        }


        /*
            Check POT 4 / POT 5 distribution
        */

        const pot4Count =
            players.filter(
                player =>
                    player.pot === 4
            ).length;


        const pot5Count =
            players.filter(
                player =>
                    player.pot === 5
            ).length;


        /*
            Inform user if perfect distribution
            is impossible.
        */

        if (
            pot5Count >
            teams.length
        ) {

            alert(
                `Ada ${pot5Count} player POT 5 tetapi hanya ${teams.length} tim. Perfect separation POT 5 tidak mungkin, sistem akan menggunakan balance terbaik.`
            );

        }


        if (
            pot4Count >
            teams.length
        ) {

            alert(
                `Ada ${pot4Count} player POT 4 tetapi hanya ${teams.length} tim. Sistem akan menggunakan balance terbaik.`
            );

        }


        /*
            Reset
        */

        remainingPlayers =
            [...players];


        teams.forEach(team => {

            team.players = [];

            team.totalScore = 0;

        });


        currentRotation = 0;

        isSpinning = false;


        selectedPlayer.textContent =
            "—";


        selectedPot.textContent =
            "POT —";


        assignedTeam.textContent =
            "—";


        /*
            UI
        */

        playerSetup.classList.remove(
            "hidden"
        );


        gameSection.classList.remove(
            "hidden"
        );


        resultSection.classList.add(
            "hidden"
        );


        spinBtn.disabled =
            false;


        statusText.textContent =
            "ACTIVE";


        renderTeams();

        drawWheel();

        updateCounter();


        gameSection.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    }
    catch (error) {

        alert(
            error.message
        );

    }

}


/* =========================================
   DRAW WHEEL
========================================= */

function drawWheel() {

    const ctx =
        wheel.getContext("2d");


    const width =
        wheel.width;

    const height =
        wheel.height;


    const centerX =
        width / 2;

    const centerY =
        height / 2;


    const radius =
        width / 2 - 10;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /*
        Empty wheel
    */

    if (
        remainingPlayers.length === 0
    ) {

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            "#15121e";

        ctx.fill();


        ctx.fillStyle =
            "#918aa3";

        ctx.font =
            "600 18px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";

        ctx.fillText(
            "COMPLETE",
            centerX,
            centerY
        );

        return;

    }


    const sliceAngle =
        (Math.PI * 2) /
        remainingPlayers.length;


    /*
        Draw slices
    */

    remainingPlayers.forEach(
        (player, index) => {

            const startAngle =
                index *
                sliceAngle -
                Math.PI / 2;


            const endAngle =
                startAngle +
                sliceAngle;


            /*
                Wheel slice
            */

            ctx.beginPath();

            ctx.moveTo(
                centerX,
                centerY
            );

            ctx.arc(
                centerX,
                centerY,
                radius,
                startAngle,
                endAngle
            );

            ctx.closePath();


            /*
                POT based wheel color
            */

            const colors = {

                1: "#403b46",
                2: "#293b5c",
                3: "#49345c",
                4: "#5c4424",
                5: "#5c2929"

            };


            ctx.fillStyle =
                colors[player.pot];


            ctx.fill();


            ctx.strokeStyle =
                "#0a080e";

            ctx.lineWidth = 2;

            ctx.stroke();


            /*
                Player text
            */

            ctx.save();


            ctx.translate(
                centerX,
                centerY
            );


            ctx.rotate(
                startAngle +
                sliceAngle / 2
            );


            ctx.textAlign =
                "right";

            ctx.textBaseline =
                "middle";


            let fontSize = 15;


            if (
                remainingPlayers.length >
                12
            ) {

                fontSize = 11;

            }


            if (
                remainingPlayers.length >
                20
            ) {

                fontSize = 9;

            }


            ctx.font =
                `700 ${fontSize}px Arial`;


            ctx.fillStyle =
                "#ffffff";


            let name =
                player.name;


            if (
                name.length > 17
            ) {

                name =
                    name.substring(
                        0,
                        17
                    ) + "...";

            }


            ctx.fillText(
                name,
                radius - 22,
                0
            );


            /*
                POT number
            */

            ctx.font =
                `800 ${fontSize - 2}px Arial`;


            ctx.fillStyle =
                "#c4b5fd";


            ctx.fillText(
                `P${player.pot}`,
                radius - 5,
                0
            );


            ctx.restore();

        }
    );


    /*
        Center circle
    */

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        55,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#09080d";

    ctx.fill();


    ctx.strokeStyle =
        "#342b43";

    ctx.lineWidth = 5;

    ctx.stroke();


    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "900 13px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.fillText(
        "SPIN",
        centerX,
        centerY
    );

}


/* =========================================
   SPIN
========================================= */

spinBtn.addEventListener(
    "click",
    spinWheel
);


function spinWheel() {

    if (
        isSpinning ||
        remainingPlayers.length === 0
    ) {

        return;

    }


    isSpinning = true;

    spinBtn.disabled = true;


    /*
        Random player
    */

    const selectedIndex =
        Math.floor(
            Math.random() *
            remainingPlayers.length
        );


    const playerCount =
        remainingPlayers.length;


    const sliceAngle =
        360 /
        playerCount;


    /*
        Target center
    */

    const targetAngle =
        selectedIndex *
        sliceAngle +
        sliceAngle / 2;


    /*
        Random number of spins
    */

    const extraSpins =
        5 +
        Math.floor(
            Math.random() * 3
        );


    const finalRotation =
        currentRotation +
        extraSpins * 360 +
        (360 - targetAngle);


    currentRotation =
        finalRotation;


    wheel.style.transform =
        `rotate(${finalRotation}deg)`;


    /*
        Wait for wheel animation
    */

    setTimeout(() => {

        const player =
            remainingPlayers[
                selectedIndex
            ];


        /*
            Display player
        */

        selectedPlayer.textContent =
            player.name;


        selectedPot.textContent =
            `POT ${player.pot}`;


        /*
            Remove from wheel
        */

        remainingPlayers.splice(
            selectedIndex,
            1
        );


        /*
            BALANCING ENGINE
        */

        const team =
            chooseBalancedTeam(
                player
            );


        /*
            Assign player
        */

        team.players.push(
            player
        );


        team.totalScore +=
            player.score;


        /*
            Show assigned team
        */

        assignedTeam.textContent =
            team.name;


        /*
            Re-render
        */

        renderTeams();

        updateCounter();


        /*
            Reset rotation
        */

        wheel.style.transition =
            "none";

        wheel.style.transform =
            "rotate(0deg)";

        currentRotation = 0;


        wheel.offsetHeight;


        wheel.style.transition =
            "transform 5s cubic-bezier(.12,.7,.18,1)";


        drawWheel();


        isSpinning = false;


        /*
            Finished?
        */

        if (
            remainingPlayers.length === 0
        ) {

            spinBtn.disabled =
                true;


            statusText.textContent =
                "COMPLETE";


            setTimeout(
                finishSelection,
                900
            );


        } else {

            spinBtn.disabled =
                false;

        }


    }, 5000);

}


/* =========================================
   BALANCING ENGINE
========================================= */

function chooseBalancedTeam(player) {

    /*
        =====================================
        RULE 1
        =====================================

        POT 5 tidak boleh bersama POT 4
        selama masih ada team alternatif.

        POT 5 → cari team tanpa POT 4
        POT 4 → cari team tanpa POT 5
    */


    let eligibleTeams =
        teams.filter(team => {

            /*
                POT 5
            */

            if (
                player.pot === 5 &&
                hasPot(
                    team,
                    4
                )
            ) {

                return false;

            }


            /*
                POT 4
            */

            if (
                player.pot === 4 &&
                hasPot(
                    team,
                    5
                )
            ) {

                return false;

            }


            return true;

        });


    /*
        Jika tidak ada team yang memenuhi
        hard rule, gunakan semua team.

        Ini hanya terjadi jika secara
        matematis pembagian sempurna
        tidak memungkinkan.
    */

    if (
        eligibleTeams.length === 0
    ) {

        eligibleTeams =
            [...teams];

    }


    /*
        =====================================
        RULE 2
        =====================================

        Cari team dengan jumlah player
        paling sedikit.
    */

    const minimumPlayers =
        Math.min(
            ...eligibleTeams.map(
                team =>
                    team.players.length
            )
        );


    eligibleTeams =
        eligibleTeams.filter(team => {

            return (
                team.players.length ===
                minimumPlayers
            );

        });


    /*
        =====================================
        RULE 3
        =====================================

        Cari team dengan total skill
        paling rendah.

        Ini membuat POT tinggi tidak
        menumpuk pada satu team.
    */

    const minimumScore =
        Math.min(
            ...eligibleTeams.map(
                team =>
                    team.totalScore
            )
        );


    eligibleTeams =
        eligibleTeams.filter(team => {

            return (
                team.totalScore ===
                minimumScore
            );

        });


    /*
        =====================================
        RULE 4
        =====================================

        Jika masih ada beberapa team
        dengan kondisi sama, RANDOM.
    */

    const randomIndex =
        Math.floor(
            Math.random() *
            eligibleTeams.length
        );


    return eligibleTeams[
        randomIndex
    ];

}


/* =========================================
   HAS POT
========================================= */

function hasPot(
    team,
    pot
) {

    return team.players.some(
        player =>
            player.pot === pot
    );

}


/* =========================================
   RENDER TEAMS
========================================= */

function renderTeams() {

    teamsContainer.innerHTML = "";


    teams.forEach(
        (team, index) => {

            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "team-box";


            /*
                Highlight team dengan
                score paling rendah
            */

            const lowestScore =
                Math.min(
                    ...teams.map(
                        team =>
                            team.totalScore
                    )
                );


            if (
                team.totalScore ===
                lowestScore
            ) {

                element.classList.add(
                    "active"
                );

            }


            let playersHTML = "";


            if (
                team.players.length === 0
            ) {

                playersHTML = `

                    <div class="empty-player">
                        Waiting for player...
                    </div>

                `;

            } else {

                team.players.forEach(
                    (
                        player,
                        playerIndex
                    ) => {

                        playersHTML += `

                            <div class="team-player">

                                <div class="player-info">

                                    <div class="player-number">
                                        ${String(
                                            playerIndex + 1
                                        ).padStart(
                                            2,
                                            "0"
                                        )}
                                    </div>

                                    <span>
                                        ${escapeHTML(
                                            player.name
                                        )}
                                    </span>

                                </div>


                                <span
                                    class="
                                        player-pot
                                        pot-badge-${player.pot}
                                    "
                                >
                                    POT ${player.pot}
                                </span>

                            </div>

                        `;

                    }
                );

            }


            element.innerHTML = `

                <div class="team-header">

                    <h3>
                        ${escapeHTML(
                            team.name
                        )}
                    </h3>

                    <div class="team-score">

                        <span class="score-value">
                            ${team.totalScore}
                        </span>

                        <span class="team-count">
                            SCORE
                        </span>

                    </div>

                </div>


                <div class="team-count">

                    ${team.players.length}
                    player

                </div>


                ${playersHTML}

            `;


            teamsContainer.appendChild(
                element
            );

        }
    );

}


/* =========================================
   COUNTER
========================================= */

function updateCounter() {

    remainingCounter.textContent =
        `${remainingPlayers.length} PLAYERS`;

}


/* =========================================
   FINAL RESULT
========================================= */

function finishSelection() {

    finalTeams.innerHTML = "";


    teams.forEach(team => {

        const element =
            document.createElement(
                "div"
            );


        element.className =
            "final-team";


        let playersHTML = "";


        team.players.forEach(
            player => {

                playersHTML += `

                    <div class="final-player">

                        <span>

                            ${escapeHTML(
                                player.name
                            )}

                        </span>

                        <span
                            class="final-score"
                        >
                            POT ${player.pot}
                        </span>

                    </div>

                `;

            }
        );


        element.innerHTML = `

            <h3>
                ${escapeHTML(
                    team.name
                )}
            </h3>

            ${playersHTML}

            <div class="final-player">

                <span>
                    Team Skill Score
                </span>

                <span class="final-score">
                    ${team.totalScore}
                </span>

            </div>

        `;


        finalTeams.appendChild(
            element
        );

    });


    resultSection.classList.remove(
        "hidden"
    );


    resultSection.scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}


/* =========================================
   RESET
========================================= */

resetBtn.addEventListener(
    "click",
    resetGame
);


function resetGame() {

    teams = [];

    remainingPlayers = [];

    isSpinning = false;

    currentRotation = 0;


    playerInput.value = "";


    playerSetup.classList.add(
        "hidden"
    );


    gameSection.classList.add(
        "hidden"
    );


    resultSection.classList.add(
        "hidden"
    );


    selectedPlayer.textContent =
        "—";


    selectedPot.textContent =
        "POT —";


    assignedTeam.textContent =
        "—";


    statusText.textContent =
        "SETUP";


    teamCountInput.value =
        2;


    generateTeamInputs();


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(text) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        text;


    return element.innerHTML;

}