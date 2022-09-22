/*
The Game Project 8 - platforms and enemies
In the game I tried to simulate gravity, that was the hardest part. I had difficulty to make it work for all cases. 
Game world is being randomly generated. Scenery size is randomly generated however it can also be can be selected from the setup function. All other aspects of the game adjust automatically. 
When an enemy gets too close there is a warning. Collison with an enemy cause a damage and throw our chracter in the air. It does not take life. Larger the scenery the more hits our character can take to offset increased difficulty when world get larger. Damage is being visible on the small icon of the character in upper right corner. The more hits, the less of the icon remains.
Character jumps slightly higher when moving than when stationary. It is very useful. It also jumps higher when it is on the platform. 
When time gets short day changes to night. Character, platforms and enemies glow at night - effect is being achieved by drawing multiple rounded rectangles with different opacity. 
There is also an ilussion that character emits light. It is possible to see how grass is being lit when character is close to the ground. Platforms and enemies also "emit light" and this effect is seen on the grass
I tried to adjust the difficulty level to find a good balance between being too easy and too difficult. Usually it takies few tries before completing the level. Some randomly generated worlds are impossible to pass.
If there are a lot of canyons then number of platforms is increased and vice versa.
I created two hints which appear at the screen at certain moments: to go to the flagpole when enough items were collcted and to go back to collect items when target not met.
There are visual indicatotrs: when enemy hits the character - expanding circle, and when enough items collected - expanding rectangle.
Character cannot move beyond the certain distance from the end of the world.
Characters are being placed only on the ground or on platforms.
I am proud how I made an ilusion that elemetns glow at night and how they lit the grass.  
Elements are only being created when are in certain range from the character to reduce amount of required calculations. I also had to reduce frame rate to 30fps. 
My daughter enjoys to play this game. She is almost 4 yeras old;)

All sounds downloaded from https://freesound.org/
*/

let gameChar_x;
let gameChar_y;
let floorPos_y;
let scrollPos;
let gameChar_world_x;

let isLeft;
let isRight;
let isFalling;
let isPlummeting;

let tree_num;
let moutain_num;
let collectable_num;
let clouds_num;
let canyon_num;

let jumpCount;

let scenery_size;
let game_score; //gp6
let flagpole; //gp6

let lives;
let gameOver;
let restart;
let kill;

let mountains = [];
let trees_x = [];
let clouds = [];
let collectables = [];
let canyons = [];
let randoms = [];

let jumpSound;
let collectSound;
let landSound;
let enemyHit;
let music;
let robot1;
let velocity
let cautionSound;

// gp8
let platforms;
let platforms_num;
let platformsL_num;
let platformsM_num;
let platformsH_num;
let enemies;
let progress_factor;
let minimum_collectables;

let game_variant;
let time_lim_sec;
let fps;
let multiply;
let allowed_hits;
let hits = 0;
let remaining_hits;

let prev_y = 0;
let prev_current_y_interpolate = [];

let target_achieved;

let enemiesL_num;
let enemiesH_num;
let canyon_density;
let tree = {};
let cloud = {};
let mountain = {};
let collectable = {};
let canyon = {};
let randoms_list = [];
let starter_platform_x

let d_f = 1 - progress_factor * 0.8 //darkness factor
let ch_r = 3 //character roundness

let hit_countdown = 0;
let hit_countdown2 = 0;
let you_win_counter;
let c;

let frames_run = 0;
let sec;
let time_left;
let collected = 0;
let counter_target_achieved;
let show_welcome_screen;
let go_for_more_counter;

let max_out_of_edge;
let hit_random = 0;


function preload() {
    soundFormats('mp3', 'wav');

    //load your sounds here
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);

    collectSound = loadSound('assets/collect.wav');
    collectSound.setVolume(0.1);

    landSound = loadSound('assets/land.wav');
    landSound.setVolume(0.8);

    successSound = loadSound('assets/success.wav');
    successSound.setVolume(0.3);

    enemyHit = loadSound('assets/enemy_hit.wav');
    enemyHit.setVolume(1.5);

    music = loadSound('assets/music.mp3');
    music.setVolume(0.25);


    music2 = loadSound('assets/music2.wav');
    music2.setVolume(0.25);

    music3 = loadSound('assets/music3.wav');
    music3.setVolume(0.25);

    robot1 = loadSound('assets/robot.wav');
    robot1.setVolume(0.11);

    cautionSound = loadSound('assets/caution.wav');
    cautionSound.setVolume(0.2);

    gameOverSound = loadSound('assets/game_over.wav');
    gameOverSound.setVolume(0.2)

    fallSound = loadSound('assets/fall.wav');
    fallSound.setVolume(0.1);

    targetAchievedSound = loadSound('assets/target_achieved.wav');
    targetAchievedSound.setVolume(0.4);

    targetNotSound = loadSound('assets/target_not.mp3')
    targetNotSound.setVolume(1);
    welcomeFont = loadFont('assets/arlrdbd.ttf')
}


function setup() { // #setup
    fps = 30

    frameRate(fps)
    createCanvas(1024, 576);
    floorPos_y = height * 3 / 4;
    show_welcome_screen = true
    /// game settings////
    scenery_size = 2500;
    scenery_size_min = 2500
    scenery_size_max = 4500
    time_constant = 70// lower the number the more time is avaliable
    minimum_collectables = 0.5  //factor -how many percent of collevtables need to be collected to achieve the target
    game_variant = 1 // 0 - test/kids,  1 - normal
    lives_and_hits_variant()
    max_out_of_edge = 8

    // other requred variables
    multiply = (60 / fps)
    scenery_size = max(scenery_size, width)
    time_lim_sec = (scenery_size * fps / time_constant) / fps;


    play_music()
    welcome_screen()
    restart = true;
    startGame(restart)
    restart = false;
    colours_box_size = 10
}

function draw() {
    check_game_variant()

    // tracks how much time passed relative to initial time
    progress_factor = timesFactor(time_lim_sec, sec)

    // draw sky and grassa
    drawSkyAndGrass()

    // adds bacground scrolling
    push();
    translate(scrollPos, 0);
    drawAllBackgroundObjects();
    pop();

    // Draw game character 
    drawGameChar();

    // Draw score sign
    // drawScore(game_score);
    //Draw time remaining
    drawTime();

    //draw collectable remaining
    drawCollectableAmount()

    //checks if enough collectalbes were collected
    target_achieved = check_if_collectable_target_achieved()
    target_achieved_notification(target_achieved)

    // display Game Over sign and blocks game interactions
    if (gameOver) {
        displayGameOver()
        return
    }

    // display Level complete sign and blocks game interactions
    if (flagpole.isReached) {
        {
            displayLevelComplete(flagpole)
            return
        }
    }

    // Logic to make the game character move or the background scroll.
    characterOrBackgroundScrollLogic()

    // Logic to make the game character rise and fall.
    // if (velocity != 0) { console.log('bef', velocity) }
    characterRiseAndFallLogic()
    // if (velocity != 0) { console.log(' aft1', velocity) }

    // check if flagpole has been reached
    if (flagpole.isReached == false) {
        checkFlagpole(target_achieved);
    }

    // check if character died
    checkPlayerDie()

    //iterpolating gameChar_y position betwwen current and previous gameChar_y for collision/contact detection


    // Update real position of gameChar for collision detection.
    gameChar_world_x = gameChar_x - scrollPos;
    gameChar_world_x = max(gameChar_world_x, -100)
    //limiting area of the game
    scrollPos = min(scrollPos, 450)
    scrollPos = max(scrollPos, -scenery_size + 200)

    interpolate_displacement_y()
    prev_y = gameChar_y

    welcome_screen()
}

function startGame(restart) {//#startGame #restart

    frames_run = 0
    sign_frames = 0
    hits = 0 // reset number of hits by enemies
    collected = 0// zeroes collected items 
    kill = true; // has to be true to redraw all collectables after each kill

    //counters resets
    counter_target_achieved = 30
    you_win_counter = 0
    game_over_counter = 0
    go_for_more_counter = 0
    targetNot_counter = 0

    //initial character location
    gameChar_x = 50;
    gameChar_y = floorPos_y - 20;
    scrollPos = 200;// Variable to control the background scrolling.
    starter_platform_x = -200

    // Variable to store the real position of the gameChar in the game
    // world. Needed for collision detection.
    gameChar_world_x = gameChar_x - scrollPos;

    // Boolean variables to control the movement of the game character.
    isLeft = false;
    isRight = false;
    isFalling = true;       // character takes falling stance
    isPlummeting = true;  // character falls
    onTheGround = true;
    velocity = -3 * multiply

    // Initialise arrays of scenery objects.
    // Initialise how large  will be the scenery.


    // Initialise _num letiables -  number of objects depends on scenery size (higher value of the denominator, the lower density of objects)
    tree_num = scenery_size / 75;
    moutain_num = scenery_size / 200;
    collectable_num = scenery_size / 70;
    clouds_num = scenery_size / 80;

    if (game_variant == 0) {
        canyon_num = 1;
        enemiesL_num = 5;
        enemiesH_num = 0;
        canyon_density = 100;
    }


    else {
        canyon_density = random(50, 100);
        canyon_num = scenery_size / canyon_density;
        enemiesL_num = scenery_size / (350 * (canyon_density / 100));
        enemiesH_num = scenery_size / 120;
    }
    platforms_total = scenery_size / 60;
    platformsH_num = platforms_total * 0.48
    platformsM_num = platforms_total * 0.38 * (120 / canyon_density / 2);
    platformsL_num = platforms_total * 0.28 * (90 / canyon_density);

    if (restart) {
        mountains = []
        trees_x = [];
        clouds = [];
        collectables = [];
        canyons = [];
        randoms = [];
        platforms = [];
        enemies = [];


        for (let i = 0; i < tree_num; i++) {
            tree = random(0, 2 * scenery_size)
            trees_x.push(tree);
        }
        for (let i = 0; i < clouds_num; i++) {
            cloud = {
                x_pos: random(0, scenery_size),
                y_pos: random(50, 300),
                scale: random(0.7, 2)
            }
            clouds.push(cloud);
        }
        for (let i = 0; i < moutain_num; i++) {
            mountain = {
                x_pos: random(0, 1.3 * scenery_size),
                y_pos: floorPos_y,
                scale: random(1, 3)
            }
            mountains.push(mountain);
        }
        for (let i = 0; i < collectable_num; i++) {
            collectable = {
                x_pos: random(0, 1.0 * scenery_size),
                y_pos: floor(random(100, 432) / 20) * 20,
                size: 1.5,
                isFound: false,
                symbol: false
            }
            collectables.push(collectable);
        }
        for (let i = 0; i < canyon_num; i++) {
            canyon = {
                x_pos: random(0, 2 * scenery_size),
                width: random(60, 130), // minumum canyon width maimum canyon width
                in_area: false
            }
            canyons.push(canyon);
        }
        // Createing random letiable for each tree, which is used to create letaibility in the trees look.
        for (let i = 0; i < trees_x.length; i++) {
            randoms_list = [
                random(2, 2.5),
                random(2, 2.5),
                random(2, 2.6)]
            randoms.push(randoms_list);
        }

        // starter platform
        platforms.push(createPlatforms(
            starter_platform_x, //x
            floorPos_y - 10,
            100, //lenght
            random(100, 155),    //r
            random(10, 59),    //g
            random(160, 255)))//b

        ///Creating Low Medium and High platforms
        for (let i = 0; i < platformsL_num; i++)
            platforms.push(createPlatforms(
                floor(random(0, (scenery_size * 1.5) / 25)) * 25,   //x
                floor(random(301, 370) / 20) * 20,    //y
                random(80, 250), //lenght
                random(100, 59),    //r
                random(20, 160),    //g
                random(60, 159)     //b
            ));
        for (let i = 0; i < platformsM_num; i++)
            platforms.push(createPlatforms(
                floor(random(0, (scenery_size * 1.5) / 25)) * 25,   //x
                floor(random(221, 290) / 20) * 20,    //y
                random(120, 200), //lenght
                random(10, 59),    //r
                random(100, 160),    //g
                random(60, 159)     //b
            ));

        for (let i = 0; i < platformsH_num; i++)
            platforms.push(createPlatforms(
                floor(random(0, (scenery_size * 1.5) / 25)) * 25,   //x
                floor(random(120, 200) / 20) * 20,    //y
                random(80, 120), //lenght
                random(10, 59),    //r
                random(10, 59),    //g
                random(160, 159)     //b
            ));
        //gp8
        for (i = 0; i < enemiesL_num; i++) {
            //creating floor level enemies - it avoids area of starter platform
            let x_pos_random = random(400, scenery_size * 1.5)
            enemies.push(new Enemy(
                x_pos_random,//x
                floorPos_y - 10,//y
                random(100, 400),//range
                3,//spd let
                random(2, 4)));// spd
        }

        // creating enemies on all platform except starter platform
        for (let i = 0; i < enemiesH_num; i++) {
            let rand_i = floor(random(1, platforms.length - 1));
            let pl_x = platforms[rand_i].x
            let pl_y = platforms[rand_i].y
            let pl_len = platforms[rand_i].length
            enemies.push(new Enemy(
                pl_x + 0.1 * pl_len,  // enemy x
                pl_y - 10,    // enemy y
                pl_len * 0.8,  // enemy range
                3,
                floor(random(1, 3)) // enemy spedd
            ))
        }
    }

    game_score = 0; //gp6
    flagpole = { isReached: false, x_pos: scenery_size }
}
function keyPressed() {
    // Key control functions - key pressed
    if (keyCode == 13) {//'enter'

        restartGame()
    }
    if (keyCode == 48) {//'0'
        game_variant = 0
        restartGame()
    }

    if (keyCode == 49) {//1'
        game_variant = 1
        restartGame()
    }

    if (keyCode == 37) {
        isLeft = true;
    }
    if (keyCode == 39) {
        isRight = true;
    }
    if (keyCode == 32 && (flagpole.isReached) && you_win_counter > 75) {
        restartGame()
    }
    else if (keyCode == 32 && (gameOver) && game_over_counter > 75) {
        restartGame()

    }
    else if ((keyCode == 32 || keyCode == 38) && isPlummeting == false) {
        //jump activation - it changes velocity of character from 0 
        // character jumps a bit higher when it is running comparing to when it is stationary

        if (isRight || isLeft) { velocity = 17 * multiply ** (1 / 2) }
        else { velocity = 15 * multiply ** (1 / 2) }
        jump = true
        // console.log('---JUMP------', velocity)
        jumpSound.play();
    }
    show_welcome_screen = false
}

function keyReleased() {
    // Key control functions - key released
    if (keyCode == 37) {
        isLeft = false;
    }
    else if (keyCode == 39) {
        isRight = false;
    }
}

function play_music() {
    // plays background music
    music_rand = floor(random(1, 4))
    if (music_rand == 1) { music.play() }
    else if (music_rand == 2) { music2.play() }
    else if (music_rand == 3) { music3.play() }
}

function timesFactor(time_lim_sec, sec) {
    // calculate time pased to time limit factor
    let t_factor = sec / time_lim_sec
    if (t_factor < 0.5) { return 0 }
    else if (t_factor >= 0.5 && t_factor < 0.75) {
        return map(t_factor, 0.5, 0.75, 0, 1)
    }
    else { return 1 }
}

function drawGameChar() {
    // Function to draw the game character.
    torso_color = color(20, 120 + 80 * progress_factor, 20 + 80 * progress_factor)
    arms_color = color(20, 90 + 40 * progress_factor, 60 + 80 * progress_factor)
    feet_color = color(30, 46 + 20 * progress_factor, 20)
    face_color = color(200 + 30 * progress_factor, 130 + 40 * progress_factor, 100 + 30 * progress_factor)
    cap_color = color(20, 90 + 60 * progress_factor, 40 + 80 * progress_factor)
    noStroke();

    // glow
    let p_df = 0.6 + 0.6 * progress_factor
    let glosw_steps = 15 * progress_factor
    let gs = 10/// glow size

    //draw optimization
    for (let i = 2; i < glosw_steps + 2; i++) {

        push()
        noStroke()
        fill(
            50 * p_df + (progress_factor) * 110 / glosw_steps * i,
            100 * p_df + (progress_factor) * 150 / glosw_steps * i,
            50 * p_df + (progress_factor) * 81 / glosw_steps * i,
            255 / (1 + (i - 2) * (0.7 * (i - 2))) * progress_factor);
        ellipse(gameChar_x, gameChar_y - 57, 1 * gs * i, 1 * gs * i)

        fill(
            100 * p_df + (progress_factor) * 130 / glosw_steps * i,
            100 * p_df + (progress_factor) * 180 / glosw_steps * i,
            100 * p_df + (progress_factor) * 170 / glosw_steps * i,
            1 / (floorPos_y + 1 - gameChar_y) ** (1 / 2) * 255 / (1 + (i - 2) * (0.7 * (i - 2))) * progress_factor);
        ellipse(
            gameChar_x,
            floorPos_y + 10,
            3 * gs * 0.5 * i * (1.3 + (floorPos_y - gameChar_y) / 80) ** 1.4,
            0.3 * gs * 0.5 * i * (1.03 + (floorPos_y - gameChar_y) / 80) ** 1.4)
        pop()
    }


    if (isLeft && isFalling) {
        push()
        fill(face_color)
        ellipse(gameChar_x, gameChar_y - 55, 35, 35)
        fill(torso_color)
        // torso
        rect(gameChar_x - 10, gameChar_y - 40, 20, 27, ch_r)
        rect(gameChar_x - 8, gameChar_y - 40 + 27, 16, 3, ch_r)
        // feet
        fill(feet_color)
        rect(gameChar_x + 8 - 22, gameChar_y - 15, 22, 8), ch_r
        // arms
        fill(arms_color)
        rect(gameChar_x + 7 - 27, gameChar_y - 40, 27, 8, ch_r)
        // face
        fill(face_color)
        triangle(gameChar_x - 15, gameChar_y - 63,
            gameChar_x - 22, gameChar_y - 50,
            gameChar_x - 15, gameChar_y - 50)
        fill(0)
        ellipse(gameChar_x - 9, gameChar_y - 55, 5, 3)
        // cap
        fill(cap_color)
        rect(gameChar_x - 14, gameChar_y - 75, 28, 12, ch_r)
        rect(gameChar_x - 22, gameChar_y - 63, 36, 4, ch_r)
        pop()
    }
    else if (isRight && isFalling) {
        push()
        fill(face_color)
        ellipse(gameChar_x, gameChar_y - 55, 35, 35)
        fill(torso_color)
        // torso
        rect(gameChar_x - 10, gameChar_y - 40, 20, 27, ch_r)
        rect(gameChar_x - 8, gameChar_y - 40 + 27, 16, ch_r)
        // feet
        fill(feet_color)
        rect(gameChar_x - 8, gameChar_y - 15, 22, 8, ch_r)
        // arms
        fill(arms_color)
        rect(gameChar_x - 7, gameChar_y - 40, 27, 8, ch_r)
        // face
        fill(face_color)
        triangle(gameChar_x + 15, gameChar_y - 63,
            gameChar_x + 22, gameChar_y - 50,
            gameChar_x + 15, gameChar_y - 50)
        fill(0)
        ellipse(gameChar_x + 9, gameChar_y - 55, 5, 3)
        // cap
        fill(cap_color)
        rect(gameChar_x - 14, gameChar_y - 75, 28, 12, ch_r)
        rect(gameChar_x + 22 - 36, gameChar_y - 63, 36, 4, ch_r)
        pop()
    }
    else if (isLeft) {
        push()
        // walking left code
        fill(face_color)
        ellipse(gameChar_x, gameChar_y - 55, 35, 35)
        fill(torso_color)
        // torso
        rect(gameChar_x - 10, gameChar_y - 40, 20, 27, ch_r)
        rect(gameChar_x - 8, gameChar_y - 40 + 27, 16, 13, ch_r)
        // feet
        fill(feet_color)
        rect(gameChar_x + 8 - 22, gameChar_y - 5, 22, 8, ch_r)
        // arms
        fill(arms_color)
        rect(gameChar_x + 7 - 7, gameChar_y - 40, 7, 25, ch_r)
        //  face
        fill(face_color)
        triangle(gameChar_x - 15, gameChar_y - 63,
            gameChar_x - 22, gameChar_y - 50,
            gameChar_x - 15, gameChar_y - 50)
        fill(0)
        ellipse(gameChar_x - 9, gameChar_y - 55, 5, 3)
        // cap
        fill(cap_color)
        rect(gameChar_x - 14, gameChar_y - 75, 28, 12, ch_r)
        rect(gameChar_x - 22, gameChar_y - 63, 36, 4, ch_r)
        pop()

    }
    else if (isRight) {
        push()
        // walking right code
        fill(torso_color)
        // torso
        rect(gameChar_x - 10, gameChar_y - 40, 20, 27, ch_r)
        rect(gameChar_x - 8, gameChar_y - 40 + 27, 16, 13, ch_r)
        // feet
        fill(feet_color)
        rect(gameChar_x - 8, gameChar_y - 5, 22, 8, ch_r)

        // arms
        fill(arms_color)
        rect(gameChar_x - 7, gameChar_y - 40, 7, 25, ch_r)

        // face
        fill(face_color)
        ellipse(gameChar_x, gameChar_y - 55, 35, 35)
        fill(torso_color)

        fill(face_color)
        triangle(gameChar_x + 15, gameChar_y - 63,
            gameChar_x + 22, gameChar_y - 50,
            gameChar_x + 15, gameChar_y - 50)
        fill(0)
        ellipse(gameChar_x + 9, gameChar_y - 55, 5, 3)

        // cap
        fill(cap_color)
        rect(gameChar_x - 14, gameChar_y - 75, 28, 12, ch_r)
        rect(gameChar_x + 22 - 36, gameChar_y - 63, 36, 4, ch_r)
        pop()

    }
    else if (isFalling || isPlummeting) {
        push()
        fill(face_color)
        ellipse(gameChar_x, gameChar_y - 55, 35, 35)
        fill(torso_color)

        // torso
        rect(gameChar_x - 10, gameChar_y - 40, 20, 27, ch_r)

        // legs
        rect(gameChar_x - 8, gameChar_y - 40 + 27, 16, 3, ch_r)

        // feet
        fill(feet_color)
        rect(gameChar_x - 17, gameChar_y - 15, 15, 8, ch_r)
        rect(gameChar_x + 3, gameChar_y - 15, 15, 8, ch_r)
        // arms
        fill(arms_color)
        rect(gameChar_x - 22, gameChar_y - 40, 12, 7, ch_r)
        rect(gameChar_x + 22 - 12, gameChar_y - 40, 12, 7, ch_r)

        // cap
        fill(cap_color)
        rect(gameChar_x - 14, gameChar_y - 75, 28, 12, ch_r)
        rect(gameChar_x - 14, gameChar_y - 63, 28, 4, ch_r)
        // face
        fill(0)
        ellipse(gameChar_x - 5, gameChar_y - 55, 5, 3)
        ellipse(gameChar_x + 5, gameChar_y - 55, 5, 3)
        pop()
    }
    else {
        characterFront(gameChar_x, gameChar_y, allowed_hits)// head
    }
}

function characterFront(gameChar_x, gameChar_y, r_h) {
    // function drawing front facing character - it is separated form the rest function which draw character, because it is being used , also, to draw how many lives remain
    ah = allowed_hits
    if (r_h > (0.2) * ah) {
        fill(face_color)
        ellipse(gameChar_x, gameChar_y - 55, 35, 35)

    }
    // torso
    fill(torso_color)
    if (r_h > (0.4) * ah) { rect(gameChar_x - 10, gameChar_y - 40, 20, 27, ch_r) }
    if (r_h > (0.7) * ah) { rect(gameChar_x - 8, gameChar_y - 40 + 27, 16, 13, ch_r) }

    // feet
    fill(feet_color)
    if (r_h > (0.9) * ah) { rect(gameChar_x - 17, gameChar_y - 5, 15, 8, ch_r) }
    if (r_h > (0.8) * ah) { rect(gameChar_x + 3, gameChar_y - 5, 15, 8, ch_r) }

    // arms
    fill(arms_color)
    if (r_h > (0.5) * ah) {
        rect(gameChar_x - 14, gameChar_y - 40, 7, 25, ch_r)
    }
    if (r_h > (0.6) * ah) {
        rect(gameChar_x + 14 - 7, gameChar_y - 40, 7, 25, ch_r)
    }

    // cap
    if (r_h > (0.3) * ah) {
        fill(cap_color)
        rect(gameChar_x - 14, gameChar_y - 75, 28, 12, ch_r)
        rect(gameChar_x - 14, gameChar_y - 63, 28, 4, ch_r)
    }

    // face
    if (r_h > (0.1) * ah) {
        fill(0)
        ellipse(gameChar_x - 5, gameChar_y - 55, 5, 3)
        ellipse(gameChar_x + 5, gameChar_y - 55, 5, 3)
    }
}

function drawClouds() {
    // Function to draw cloud objects.
    push();
    translate(-scrollPos * 0.5, 0) // slows down scrolling of clouds to add an ilusion of perspectvive
    for (let i = 0; i < clouds.length; i++) {
        if (gameChar_world_x * 0.5 < clouds[i].x_pos + 1000 && gameChar_world_x * 0.5 > clouds[i].x_pos - 1200) {
            noStroke();
            c_scale = clouds[i].scale / 1
            let gray_factor = 246 - (100 * progress_factor)
            final_color = [54, 28, 51] // clouds final color
            initial_color_value = 246 // clouds initial color
            fill(
                initial_color_value - (initial_color_value - final_color[0]) * progress_factor + [i] * 2 / clouds_num,
                initial_color_value - (initial_color_value - final_color[1]) * progress_factor + [i] * 3 / clouds_num,
                initial_color_value - (initial_color_value - final_color[2]) * progress_factor + [i] * 4 / clouds_num);
            ellipse(
                clouds[i].x_pos + 25 * c_scale,
                clouds[i].y_pos - 10 * c_scale,
                80 * c_scale,
                70 * c_scale);

            initial_color_value = 240
            fill(
                initial_color_value - (initial_color_value - final_color[0]) * progress_factor + [i] * 2 / clouds_num,
                initial_color_value - (initial_color_value - final_color[1]) * progress_factor + [i] * 6 / clouds_num,
                initial_color_value - (initial_color_value - final_color[2]) * progress_factor + [i] * 3 / clouds_num);
            ellipse(
                clouds[i].x_pos,
                clouds[i].y_pos,
                50 * c_scale,
                40 * c_scale);

            initial_color_value = 230
            fill(
                initial_color_value - (initial_color_value - final_color[0]) * progress_factor - [i] * 5 / clouds_num,
                initial_color_value - (initial_color_value - final_color[1]) * progress_factor - [i] * 3 / clouds_num,
                initial_color_value - (initial_color_value - final_color[2]) * progress_factor - [i] * 8 / clouds_num);
            ellipse(
                clouds[i].x_pos + 50 * c_scale,
                clouds[i].y_pos,
                50 * c_scale,
                40 * c_scale);

            initial_color_value = 240
            fill(
                initial_color_value - (initial_color_value - final_color[0]) * progress_factor + [i] * 3 / clouds_num,
                initial_color_value - (initial_color_value - final_color[1]) * progress_factor + [i] * 6 / clouds_num,
                initial_color_value - (initial_color_value - final_color[2]) * progress_factor + [i] * 4 / clouds_num);
            ellipse(
                clouds[i].x_pos + 80 * c_scale,
                clouds[i].y_pos,
                50 * c_scale,
                40 * c_scale);
        }
    }
    pop();
}

function drawMountains() {
    // Function to draw mountains objects.
    push();
    translate(-scrollPos * 0.3, 0); // adds illusion that mountains are further away than trees, but closer than clouds
    for (let i = 0; i < mountains.length; i++) {

        if (gameChar_world_x * 0.7 < mountains[i].x_pos + 1000 && gameChar_world_x * 0.7 > mountains[i].x_pos - 1200) {
            noStroke();
            fill((100 - 80 * progress_factor) + ((-1) ** i) * i * 50 / moutain_num);
            m_scale = mountains[i].scale / 1;
            beginShape();
            vertex(mountains[i].x_pos, floorPos_y);
            vertex(mountains[i].x_pos + 200 * m_scale, mountains[i].y_pos);
            vertex(mountains[i].x_pos + 100 * m_scale, mountains[i].y_pos - 112 * m_scale);
            vertex(mountains[i].x_pos + 40 * m_scale, mountains[i].y_pos - 102 * m_scale);
            vertex(mountains[i].x_pos + 20 * m_scale, mountains[i].y_pos - 12 * m_scale);
            endShape(CLOSE)

            fill((120 - 80 * progress_factor) + ((-1) ** i) * i * 50 / moutain_num);
            beginShape();
            vertex(mountains[i].x_pos + 20 * m_scale, mountains[i].y_pos - 10 * m_scale);
            vertex(mountains[i].x_pos + 140 * m_scale, mountains[i].y_pos - 70 * m_scale);
            vertex(mountains[i].x_pos + 100 * m_scale, mountains[i].y_pos - 130 * m_scale);
            vertex(mountains[i].x_pos + 11 * m_scale, mountains[i].y_pos - 2 * m_scale);
            endShape(CLOSE);
        }
    }
    pop();
}

function drawTrees() {
    // Function to draw trees objects.
    for (let i = 0; i < trees_x.length; i++) {
        if (gameChar_world_x < trees_x[i] + 800 && gameChar_world_x > trees_x[i] - 1200) {
            tree_scale = 2.0	// change size of trees
            d_f = 1 - progress_factor * 0.8 //darkness factor
            // shortening random letiables names - random letiables are used to add some letiability in trees shape
            r0 = randoms[i][0]
            r1 = randoms[i][1]
            r2 = randoms[i][2]

            // additional letiable to add some diversity in tree shape - it changes sign depending on i value
            inv = 10 * r1 * (-1) ** i * (i + 0.3 * i) / (i + 2); // 

            // drawing elements of the tree - 
            // trunk
            fill(
                122 * d_f + inv,
                73 * d_f * r0 / 2.6,
                48 * d_f);
            rect(trees_x[i], floorPos_y, 10 * r0, -59 * r0 / 1.2);

            // leaves 1
            fill(
                24 * d_f,
                112 * d_f + inv,
                21 * d_f * r0);
            ellipse(
                trees_x[i],
                floorPos_y - 52 * r1 / 1.2,
                30 * r1,
                30 * r1);
            // leaves 2
            fill(
                24 * d_f,
                112 * d_f * (r2 / 2),
                21 * d_f * r1 + inv);
            ellipse(
                trees_x[i] - 5 * r0,
                floorPos_y - 72 * r2 / 1.2,
                25 * r2,
                25 * r2);
            // leaves 3
            fill(
                64 * d_f * r0 / 2.8,
                142 * d_f,
                61 * d_f + inv);
            ellipse(
                trees_x[i] + 15 * r0,
                floorPos_y - 52 * r0 / 1.2,
                30 * r0 + inv / 3,
                30 * r0 + inv / 3);

            // leaves 4
            fill(
                64 * d_f * r2 / 2.8,
                142 * d_f + inv,
                61 * d_f);
            ellipse(
                trees_x[i] + 15 * r0,
                floorPos_y - 77 * r1 / 1.2,
                30 * r1 - inv / 2,
                30 * r1 - inv / 2);

            // leaves 5
            fill(
                34 * d_f * r0 / 2.8,
                132 * d_f * r0 / 2.5,
                21 * d_f + inv);
            ellipse(
                trees_x[i] - 10 * r0,
                floorPos_y - 72 * r0 / 1.2,
                30 * r0 - inv / 3,
                30 * r0 - inv / 3);

            // leaves 6
            fill(
                34 * d_f * r1 / 2.8,
                132 * d_f * r2 / 2.5 + inv,
                21 * d_f);
            ellipse(
                trees_x[i] + 5 * r0,
                floorPos_y - 87 * r2 / 1.2,
                22 * r2 + inv / 3,
                22 * r2 + inv / 3);
            noStroke();
        }
    }
}

function drawCanyon(t_canyon) {
    // Function to draw canyon objects.
    if (gameChar_world_x < t_canyon.x_pos + 800 && gameChar_world_x > t_canyon.x_pos - 1200) {
        noStroke();
        width_scale = t_canyon.width / 100;

        fill(
            77 * (d_f),
            45 * (d_f),
            11 * (d_f)
        );
        beginShape();

        vertex(t_canyon.x_pos, 432);
        vertex(t_canyon.x_pos + t_canyon.width, 432);
        vertex(t_canyon.x_pos + t_canyon.width + 10, 532);
        vertex(t_canyon.x_pos + t_canyon.width + 10, 612);
        vertex(t_canyon.x_pos - 20, 582);
        vertex(t_canyon.x_pos - 10, 482);
        endShape(CLOSE);
    }
}

function checkCanyon(t_canyon) {
    // Function to check character is over a canyon.
    if ((gameChar_world_x <= t_canyon.x_pos + t_canyon.width - max_out_of_edge && gameChar_world_x >= t_canyon.x_pos + max_out_of_edge) && (onTheGround)) {
        t_canyon.in_area = true;
    }
    else {
        if (gameChar_y < floorPos_y) {
            t_canyon.in_area = false
        }
    }
}

function drawCollectable(t_collectable) {
    // Function to draw collectable objects.
    if (gameChar_world_x < t_collectable.x_pos + 800 && gameChar_world_x > t_collectable.x_pos - 1200 || t_collectable.symbol) {
        push()
        noStroke();
        size_scale = t_collectable.size / 1;
        cy_pos = t_collectable.y_pos - size_scale * 24 / 2;
        fill(225, 000, 000);
        ellipse(t_collectable.x_pos, cy_pos, size_scale * 24, size_scale * 24);
        fill(225, 100, 000);
        ellipse(t_collectable.x_pos, cy_pos, size_scale * 20, size_scale * 20);
        fill(225, 200, 000);
        ellipse(t_collectable.x_pos, cy_pos, size_scale * 14, size_scale * 14);
        fill(225, 200, 100);
        ellipse(t_collectable.x_pos, cy_pos, size_scale * 10, size_scale * 10);
        fill(225, 000, 200);
        ellipse(t_collectable.x_pos, cy_pos, size_scale * 4, size_scale * 4);
        pop()

        // glow collectable
        let p_df = 0.6 + 0.6 * progress_factor
        let glosw_steps = 7 * progress_factor
        let gs = 7/// glow size

        //draw optimization
        for (let i = 2; i < glosw_steps + 2; i++) {

            push()
            noStroke()

            fill(
                120 * p_df + (progress_factor) * 130 / glosw_steps * i,
                1 * p_df + (progress_factor) * 180 / glosw_steps * i,
                1 * p_df + (progress_factor) * 170 / glosw_steps * i,
                1 / (floorPos_y + 1 - cy_pos) ** (1 / 1.8) * 255 / (1 + (i - 2) * (0.5 * (i - 2))) * progress_factor);
            ellipse(
                t_collectable.x_pos,
                floorPos_y + 20,
                2 * gs * 0.5 * i * (1.3 + (floorPos_y - cy_pos) / 80) ** 1.4,
                0.4 * gs * 0.5 * i * (1.03 + (floorPos_y - cy_pos) / 80) ** 1.4)
            pop()
        }
    }
}

function checkCollectable(t_collectable) {
    // Function to check character has collected an item.
    size_scale = t_collectable.size / 1
    cy_pos = t_collectable.y_pos - size_scale * 24 / 2

    if (dist(gameChar_world_x, gameChar_y, t_collectable.x_pos, cy_pos + 30) < 40) {
        t_collectable.isFound = true
        collected += 1
        game_score += 1 // gp6
        collectSound.play()
    }

    if (t_collectable.isFound == false) {
        noStroke();
        fill(225, 000, 000); ellipse(t_collectable.x_pos, cy_pos, size_scale * 24, size_scale * 24)
        fill(225, 100, 000); ellipse(t_collectable.x_pos, cy_pos, size_scale * 20, size_scale * 20)
        fill(225, 200, 000); ellipse(t_collectable.x_pos, cy_pos, size_scale * 14, size_scale * 14)
        fill(225, 200, 100); ellipse(t_collectable.x_pos, cy_pos, size_scale * 10, size_scale * 10)
        fill(225, 000, 200); ellipse(t_collectable.x_pos, cy_pos, size_scale * 4, size_scale * 4)
    }
}

function drawSkyGradient(s_size, gc_x_W) {
    background(170 - 160 * progress_factor, 155 - 140 * progress_factor, 255 - 180 * progress_factor); //fill the sky blue
    // background(170 - (100 * progress_factor), 155 - (100 * progress_factor), 255 - (100 * progress_factor)); //fill the sky blue
    noStroke();

    let o = 100 + 255 * progress_factor;
    let steps = 50
    for (let i = 0; i < steps; i++) {
        fill(50, (50 - 50 * progress_factor), 50 * progress_factor,
            o - i * ((1.0 * o - (0.9 * progress_factor)) / steps));
        rect(
            0,   //x
            i * (480 / steps), //y
            1024,//width
            -480 / steps);//height
    }
}

function drawAllBackgroundObjects() {
    drawClouds();
    drawMountains();
    drawTrees();

    // Draw canyons and check canyon interacion with character.
    for (let i = 0; i < canyons.length; i++) {
        drawCanyon(canyons[i]);
        checkCanyon(canyons[i]);

    }

    // Draw collectable and check their interacion with character.
    for (let i = 0; i < collectables.length; i++) {
        if (kill) {
            drawCollectable(collectables[i])
            collectables[i].isFound = false
        }
        else if (collectables[i].isFound == false) {
            drawCollectable(collectables[i]);
            checkCollectable(collectables[i]);
        }

    }
    kill = false;

    //gp8
    // Draw platforms
    for (let i = 0; i < platforms.length; i++) {
        platforms[i].draw();
    }
    //Draw flagpole
    renderFlagpole(); //gp6

    remaining_hits = allowed_hits - hits
    // draw impact box
    if (hit_countdown >= 0) { hit_countdown-- }
    if (hit_countdown2 >= 0) {
        hit_countdown2--
        gameChar_x += hit_countdown2 * hit_random


    }
    if (hit_countdown > 0) {
        push()
        // box
        noStroke()
        fill(255, 0, 0, 10 * hit_countdown)
        rect(948 - scrollPos, 8, 32, 60, 20)
        //remaining hits
        strokeWeight(5)
        stroke(220, 50, 50, 7 * hit_countdown)
        fill(220, 50, 50, 7 * hit_countdown)
        textSize(60)
        text(remaining_hits - 1, 980 - scrollPos, 60)
        pop()
    }
    //draw impaact shockwave
    if (hit_countdown2 > 0) {
        push()
        noFill()
        strokeWeight((1000 * hit_countdown2) ** (1 / 2))
        stroke(255, 0, 0, 3 * hit_countdown2)
        ellipse(948 - scrollPos, 8, 1200 - 80 * hit_countdown2, 1200 - 80 * hit_countdown2)
        pop()
    }
    // check contacct with an enemy and logic of consequences 
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].draw()
        let isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);

        if (isContact) { //BBB
            if (lives > 0) {

                hit_countdown = 120
                hit_countdown2 = 15

                hit_random = random(0.1, 0.3) * (round(random(-10, 10)) / 10)

                // whenever enemy hit is detected and velocity of characer is close to 0, character jumps and loses hit
                if (velocity <= 3) {
                    hits += 1
                    velocity += (random(17, 20))
                    enemyHit.play()
                }

                if (hits >= allowed_hits) {
                    lives -= 1
                    kill = true
                    startGame();
                    break
                }
            }
        }
    }
}

function drawSkyAndGrass() {
    // gradient of the sky
    drawSkyGradient(scenery_size, gameChar_world_x);

    noStroke();
    let g_steps = 5
    let step_height = (height / 4) / g_steps
    for (let i = 0; i < g_steps; i++) {
        fill(25 * progress_factor + i * 20 - (20 * i * 1 * progress_factor), 155 - (100 * progress_factor) - (i * 6), 0);
        // draws some green ground
        rect(0, floorPos_y + step_height * i, width, step_height);
    }
}

function characterOrBackgroundScrollLogic() {
    // character or bacground scroll logic
    if (isLeft) {
        if (gameChar_x > width * 0.3) {
            gameChar_x -= 6 * multiply;
        }
        else {
            scrollPos += 6 * multiply;
        }
    }

    if (isRight) {
        if (gameChar_x < width * 0.7) {
            gameChar_x += 6 * multiply;
        }
        else {
            scrollPos -= 6 * multiply; // negative for moving against the background
        }
    }
}

let canyon_in_area = false
let jump = false
time_test = 0
function characterRiseAndFallLogic() {

    let contact_platform_index = 0
    let isContact = false; //default position that character is not in contact
    let gravity_factor = 1.3 * (multiply) // affects how fast speed changes when character is jumping or falling from platform

    // character y posytion depends on its vertical velocity

    gameChar_y -= velocity
    // gp8 - checking if character is in contact with platform

    if (jump == true) {
        isPlummeting = true
        isFalling = true

    }

    for (let i = 0; i < platforms.length; i++) {

        if (platforms[i].checkContact(gameChar_world_x, prev_current_y_interpolate) == true) {
            isContact = true;
            contact_platform_index = i
            break    // contact detected with only one platform is sufficient
        }
    }
    // if (velocity !== 0) { console.log('     BEF IN', velocity) }

    if (isContact == false && velocity == 0) {
        velocity -= gravity_factor;

    }

    else if (isContact == false && velocity != 0) {
        //play sound when falling into canyon
        if (gameChar_y > floorPos_y + 60) { if (frameCount % fps) { fallSound.play() } }

        // when space pressed then velocity is being set to move character up,
        velocity -= gravity_factor


        for (let i = 0; i < canyons.length; i++) { ///AAA
            // character remains on the ground
            if (canyons[i].in_area == false) {
                // gameChar_y = floorPos_y
                floor_contact = false
                for (let i = 0; i < prev_current_y_interpolate.length; i++) {
                    vleocity_floor_cross = -5
                    if (velocity >= vleocity_floor_cross) {
                        if (gameChar_y >= floorPos_y && gameChar_y < floorPos_y - (vleocity_floor_cross)) {
                            isPlummeting = false
                            isFalling = false
                            jump = false
                            isContact = true
                            gameChar_y = floorPos_y
                            velocity = 0
                        }
                    }
                    else if (velocity < vleocity_floor_cross) {
                        if (gameChar_y >= floorPos_y && gameChar_y < floorPos_y + (-velocity) + 3) {
                            isPlummeting = false
                            isFalling = false
                            jump = false
                            isContact = true
                            gameChar_y = floorPos_y
                            velocity = 0
                        }

                    }
                }
            }
            // character falls into canyon
            else {
                canyon_in_area = true
                if (gameChar_y >= floorPos_y) {

                    gameChar_y += 10
                    velocity -= gravity_factor;
                    isFalling = true;
                    isPlummeting = true;
                    if (gameChar_y > floorPos_y + 31) {
                        gameChar_x = constrain(
                            gameChar_x,
                            (canyons[i].x_pos - 6) + scrollPos,
                            (canyons[i].x_pos + canyons[i].width + 6) + scrollPos)
                    }
                }
            }
        }
    }

    else if (isContact && velocity < 0) {

        velocity = 0;
        gameChar_y = (platforms[contact_platform_index].y) // moves character on top of platform when contact detected

        landSound.play()
        isPlummeting = false
        isFalling = false
        jump = false
    }
    else { 'undes' }
    // if (velocity !== 0) { console.log('      AFT IN', velocity) }

}

//gp6
function drawScore(game_score) {
    push()
    fill(255);
    stroke(10);
    strokeWeight(3)
    textSize(30)
    text('score: ' + game_score, 20, 50)
    pop()
}

function renderFlagpole() {
    push()
    stroke(255, 185, 50)
    strokeWeight(5)
    line(flagpole.x_pos, floorPos_y, flagpole.x_pos, floorPos_y - 150)
    noStroke()
    fill(200, 0, 0)

    if (flagpole.isReached) {
        rect(flagpole.x_pos, floorPos_y - 150, 40, 30)
    }

    else {
        rect(flagpole.x_pos, floorPos_y - 30, 40, 30)
    }
    pop()
}

function checkFlagpole(target_achieved) {
    // measures the distance between flagpole and character
    let d = abs(gameChar_world_x - flagpole.x_pos)
    if (d < 15 && target_achieved) {

        flagpole.isReached = true;
        successSound.play()
    }
    else if (d < 15 && !target_achieved || gameChar_world_x > flagpole.x_pos) {

        go_for_more_counter = 60
        if (targetNot_counter < 45) {
            if (targetNot_counter < 40) {
                go_for_more_collectables();
            }
            if (targetNot_counter == 1) {
                targetNotSound.play();

            }
            if (targetNot_counter == 44) {
                targetNot_counter = 0
            }
            targetNot_counter++
        }

    }
    else if (d >= 15 && !target_achieved) {
        targetNot_counter = 0
    }
}

function checkPlayerDie() {
    //  game ends when character falls out of screen

    if (gameChar_y > height + 150) {
        lives -= 1;
        if (lives >= 1) {
            for (let i = 0; i < canyons.length; i++) {
                // character remains on the ground
                canyons[i].in_area = false
            }
            restart = false
            isFalling = false;
            isPlummeting = false;
            kill = true;
            startGame(restart)
        }
    }
    if (lives < 2 && (gameChar_y > height + 140)) {
        gameOver = true;
        gameOverSound.play()

    }

    if (lives < 1) {
        gameOver = true
        gameOverSound.play()
    }

    // draw lives symbols 
    if (lives > 0) {
        drawLivesSymbols(lives);
    }
}

function displayGameOver() {

    //game over fade to black effect
    if (game_over_counter >= 0) {

        fill(0, 2.83 * game_over_counter)
        rect(0, 0, width, height)
        game_over_counter++
    }
    else if (game_over_counter == 90) {
        fill(0);
        rect(0, 0, width, height)
    }

    // Game over sign
    push()
    textAlign(CENTER)
    fill('white')
    strokeWeight(20)
    stroke('red')
    textSize(100)
    text('Game Over', width / 2, height / 2)
    pop()

    if (game_over_counter > 90) {
        pressSpaceToContinueSign();
        game_over_counter++
    }

}


function displayLevelComplete(flagpole) {

    // you winn effect
    if (you_win_counter <= 90) {

        for (let i = 0; i < 12; i++) {
            fill(i * 25, 255 - i * 25, 200 - i * 12, 60)
            ellipse(gameChar_x, gameChar_y, 100 * you_win_counter - 240 - i * 100, 100 * you_win_counter - 240 - i * 100)
        }
        if (you_win_counter < 90) { you_win_counter++ }
    }

    // "YOU WIN" message
    push()
    textAlign(CENTER)
    fill(255)
    noStroke()
    textSize(120)
    textFont(welcomeFont)
    text('YOU WON!!!', width / 2, height / 2)
    pop()

    pressSpaceToContinueSign()

}

function pressSpaceToContinueSign() {
    push()
    textAlign(CENTER)
    textSize(70)
    noStroke()
    fill(240)
    stroke(10)
    strokeWeight(0)
    text('Your score is: ' + game_score, width / 2, height / 2 + 80)
    textSize(35)
    if (gameOver == true || you_win_counter > 60) {// press space appeares immediately when GAME OVER and after 90 frams when YOU WIN
        text('press SPACE to continue', width / 2, height / 2 + 180)
    }
    pop()
}

function drawLivesSymbols(lives) {

    for (let i = 0; i < lives; i++) {
        push()
        scale(0.6)
        if (i == 0) {
            characterFront((width - 60 - i * 30) / 0.6, 100, remaining_hits)
        }
        else { characterFront((width - 60 - i * 30) / 0.6, 100, allowed_hits) }
        pop()
    }
}

function restartGame() {
    // restarts whole game - 3 lives again and new randomly generated world
    restart = true
    scenery_size = random(scenery_size_min, scenery_size_max)
    lives_and_hits_variant()
    time_lim_sec = (scenery_size * fps / time_constant) / fps;

    frames_run = 0
    gameOver = false;
    music.stop(); music2.stop(); music3.stop()
    play_music()
    startGame(restart)
    restart = false
}

function createPlatforms(x, y, length, r, g, b) {
    //gp8 
    //  platform creator function
    let p = {
        x: x,
        y: y,
        length: length,
        draw: function () {
            let p_df = 0.6 + 0.6 * progress_factor
            let glosw_steps = 5 * progress_factor
            let gs = 9 /// glow size
            let thickness = 13
            let roudness = 1


            if (gameChar_world_x < x + 1 * width && gameChar_world_x > x - 1 * width) {
                //draw optimization
                for (let i = 2; i < glosw_steps + 2; i++) {
                    //platform glow 
                    let p_df = 0.6 + 0.6 * progress_factor
                    let glosw_steps = 3 * progress_factor
                    let gs = 7/// glow size

                    push()
                    fill(
                        r * p_df * 130 / glosw_steps * i,
                        g * p_df + (progress_factor) * 180 / glosw_steps * i,
                        b * p_df + (progress_factor) * 170 / glosw_steps * i,
                        155 / (1 + (i - 2) * (1.2 * (i - 2))) * progress_factor);
                    rect(this.x - (gs * i - thickness) / 2, this.y - gs * i / 2 + thickness / 2, this.length + gs * i - thickness, gs * i, roudness * gs * i / 2)
                    pop()
                }

                //platform
                push()
                stroke(r * 1.2 * p_df * 1.7, g * 1.2 * (p_df) * 1.7, b * 1.7 * p_df * 1.7);
                strokeWeight(2 + 2 * p_df)
                fill(r * p_df, g * p_df, b * p_df);
                rect(this.x, this.y, this.length, thickness, thickness / 2)
                pop()
            }
        },

        checkContact: function (gc_x, gc_y) {
            if (gc_x > this.x - max_out_of_edge && gc_x < this.x + this.length + max_out_of_edge) {// checks if character is inline with platform
                for (let i = 0; i < gc_y.length; i++) {
                    let d = this.y - gc_y[i];
                    if (d >= -18 && d < 1) { //platform pull up effect
                        return true;
                    }
                }
                return false;
            }
        }
    }
    return p;
}

function Enemy(x, y, range, spd_var, spd,) {
    //creating Enemy constructor function
    this.x = x;
    this.y = y;
    this.range = range
    this.spd_var = spd_var;
    this.spd = spd * multiply / 2;

    this.currentX = x;
    this.currentY = y
    this.inc = this.spd;

    this.update = function () {
        this.currentX += this.inc;
        if (this.currentX >= this.x + this.range) {
            this.inc *= -1;
        }
        else if (this.currentX < this.x) {
            this.inc *= -1;
        }
    }
    this.draw = function () {
        this.update();


        //draw optimization
        if (gameChar_world_x < this.currentX + 0.7 * width && gameChar_world_x > this.currentX - 1.0 * width) {

            //enemy glow
            let p_df = 0.6 + 0.6 * progress_factor
            let glosw_steps = 7 * progress_factor
            let gs = 7/// glow size

            for (let i = 2; i < glosw_steps + 2; i++) {
                push()
                noStroke()
                fill(
                    150 * p_df + (progress_factor) * 110 / glosw_steps * i,
                    50 * p_df + (progress_factor) * 40 / glosw_steps * i,
                    150 * p_df + (progress_factor) * 110 / glosw_steps * i,
                    255 / (1 + (i - 2) * (0.7 * (i - 2))) * progress_factor);
                ellipse(this.currentX, this.currentY, 1 * gs * i, 1 * gs * i)

                fill(
                    140 * p_df + (progress_factor) * 130 / glosw_steps * i,
                    30 * p_df + (progress_factor) * 40 / glosw_steps * i,
                    140 * p_df + (progress_factor) * 170 / glosw_steps * i,
                    1 / (floorPos_y + 1 - this.currentY) ** (2 / 3) * 255 / (1 + (i - 2) * (0.7 * (i - 2))) * progress_factor);
                ellipse(
                    this.currentX,
                    floorPos_y + 10,
                    3 * gs * 0.5 * i * (1.2 + (floorPos_y - this.currentY) / 80) ** 1.6,
                    0.3 * gs * 0.5 * i * (1.09 + (floorPos_y - this.currentY) / 80) ** 1.6)
                pop()
            }

            //enemy
            fill(this.currentX % 100 + 100, this.currentX % 50 + 30, this.currentX % 50 + 160);
            stroke(220, 100, 250)
            strokeWeight(5)
            ellipse(this.currentX, this.y, 20, 20)
        }
    }
    this.checkContact = function (gc_x, gc_y) {
        let d = dist(gc_x, gc_y - 30, this.currentX, this.y)
        //enemy reaction for being too close
        if (d < 110 && d > 31) {
            if (frameCount % (fps / 2) == 0) {
                cautionSound.stop();
                robot1.play();
            }
            if (frameCount % (fps / 2) < 15) {
                push()
                stroke(120, 0, 250)
                fill(240, 10, 120, 75)
                ellipse(this.currentX, this.y, 40, 40)
                pop()
            }
        }
        if (d < 30) {
            return true
        }
        return false
    }
}

function drawTime() {
    sec = frames_run / fps
    time_left = (time_lim_sec - sec)
    if (!gameOver && !flagpole.isReached) {
        push()
        fill(255);
        if (time_left < 0.2 * time_lim_sec) {
            fill(255, 0, 10)
        }
        stroke(200, 20, 20)
        strokeWeight(5)
        textAlign(CENTER)
        textSize(35)
        text(floor(time_left) + "'", width / 2 + 50, 40)
        pop()
        if (time_left <= 1) {
            gameOver = true
        }
        frames_run++
    }
}

function drawCollectableAmount() {
    //draw information about collected collectables - shows percentage of collected items
    let items_collected_factor = collected / collectables.length
    //draw collectable symbol 
    let collectable_symbol = {
        x_pos: 50,
        y_pos: 50,
        size: 1.5,
        isFound: false,
        symbol: true
    }
    push()

    drawCollectable(collectable_symbol)
    pop()
    //draw text

    push()
    fill(255, 0, 0);
    stroke(255, 180, 0);
    strokeWeight(3)
    textSize(30)
    text(
        collected + ' / ' + floor(collectables.length),
        300, //x
        40) //y
    noStroke()

    //bacground strip
    // push()
    translate(0, -60)
    fill(250, 160, 0)
    rect(80, 80, 200, 20, 3)
    // items collected strip
    fill(255, 0, 0)
    rect(80, 80, (items_collected_factor) * 200, 20, 3)
    // items percentage target marker
    fill(250, 0, 0)
    rect(80 + 200 * minimum_collectables, 80, 5, 20,)

    pop()
}

function target_achieved_notification(target_achieved) {
    if (target_achieved) {
        if (counter_target_achieved > 0 && counter_target_achieved <= 30) {
            if (counter_target_achieved == 30) {
                targetAchievedSound.play()
            }
            {
                counter_target_achieved--;
                push()
                stroke(250, 160, 0, 5 * counter_target_achieved)
                strokeWeight(90 - 3 * counter_target_achieved)
                noFill()
                rect(20, 20, 80 + 900 - counter_target_achieved * 30, 5 + 300 - 10 * counter_target_achieved, 100 - 2 * counter_target_achieved)
                pop()
            }
        }
        else if (counter_target_achieved > -160 && counter_target_achieved < 30) {
            flagpole_symbol(width / 2, 200, 1.7, false)
            counter_target_achieved--

        }
    }
}

sign_frames = 0
function check_if_collectable_target_achieved() {
    // checks if enought collectables have been collected to go to the flagpole
    let collected_items_factor = collected / collectables.length
    if (collected_items_factor >= minimum_collectables) {
        return true
    }
    else { return false }

}
function interpolate_displacement_y() {
    prev_current_y_interpolate = []

    let diff = floor(gameChar_y - prev_y)

    if (diff != 0) {
        for (let i = 0; i < diff; i++) {
            prev_current_y_interpolate.push(floor((diff / diff * i) + prev_y))
        }
    }
    else { prev_current_y_interpolate = [gameChar_y] }
}

function lives_and_hits_variant() {
    // changes number of allowable hits depending of which game variant selected         
    if (game_variant == 0) { allowed_hits = 10 }
    else {
        allowed_hits = floor(scenery_size / 600);
    }
    lives = 3;
}

function flagpole_symbol(f_x, f_y, f_scale, f_crossed) {
    push()
    translate(f_x, f_y)
    scale(f_scale)

    //white shadow
    stroke(255)
    strokeWeight(18)
    line(0, 0, 0, 0 - 80)

    //flag
    stroke(255)
    strokeWeight(7)
    fill(255)
    rect(0, 0 - 80, 40, 30, 5)

    // pole
    stroke(255, 185, 50)
    strokeWeight(10)
    line(0, 0, 0, 0 - 80)

    //cross
    noStroke()
    fill(200, 0, 0)
    rect(0, 0 - 80, 40, 30, 5)
    if (f_crossed) {
        stroke(10)
        strokeWeight(10)
        line(0 - 10, 0 - 10, 0 + 40, 0 - 70)
        line(0 - 10, 0 - 70, 0 + 40, 0 - 10)
    }
    //arrow
    else {
        stroke(255)
        strokeWeight(15)
        translate(-80, 0)
        line(0 + 20, 0 - 40, 0 + 60, 0 - 40)
        line(0 + 40, 0 - 60, 0 + 60, 0 - 40)
        line(0 + 40, 0 - 20, 0 + 60, 0 - 40)

        stroke(10)
        strokeWeight(10)
        line(0 + 20, 0 - 40, 0 + 60, 0 - 40)
        line(0 + 40, 0 - 60, 0 + 60, 0 - 40)
        line(0 + 40, 0 - 20, 0 + 60, 0 - 40)
    }
    pop()

}

function welcome_screen() {
    if (show_welcome_screen == true) {
        frames_run--
        push()
        fill(50, 150)
        rect(0, 0, width, height)
        num_a = 40
        for (let i = num_a; i > 0; i--) {
            fill(150, 0 + 60 * i / num_a, 20 + 100 * i / num_a, 180)
            rect(
                width * 0.1 + width * 0.4 * (1 - i / num_a),    //x
                50 + height * 0.25 * (1 - i / num_a),                                        //y
                width * 0.80 * i / num_a,                       //width
                height * 0.75 * i / num_a,                       //height
                50)
        };
        stroke(0, 100)
        strokeWeight(3)
        fill(255, 230)
        textFont(welcomeFont)
        textSize(25)

        textAlign(CENTER)
        info_text = "Collect enough items before reaching the flagpole\nMove to jump higher.\nWhen it gets late, it gets dark.\nAvoid enemies.\nDo not fall into canyon.\n GOOD LUCK!\n\nPress any time:\n ENTER to create new world.\n 0 - for kids mode,  1 - for normal mode. \n\n Press any button to START"
        text(info_text, width / 2, 100)

        stroke(0, 50)
        strokeWeight(8)

        textAlign(CENTER)
        text(info_text, width / 2, 100)
        pop()
    }
}

function go_for_more_collectables() {

    let collectable_symbol_big = {
        x_pos: width / 2 + 50,
        y_pos: height / 3,
        size: 4,
        isFound: false,
        symbol: true
    }

    drawCollectable(collectable_symbol_big)

    push()
    stroke(255)
    strokeWeight(15)
    translate(width / 2 - 120, height / 3 + 5)
    scale(1.3)
    line(0 + 40, 0 - 40, 0 + 80, 0 - 40)
    line(0 + 60, 0 - 60, 0 + 40, 0 - 40)
    line(0 + 60, 0 - 20, 0 + 40, 0 - 40)

    stroke(10)
    strokeWeight(10)
    line(0 + 40, 0 - 40, 0 + 80, 0 - 40)
    line(0 + 60, 0 - 60, 0 + 40, 0 - 40)
    line(0 + 60, 0 - 20, 0 + 40, 0 - 40)
    pop()

    go_for_more_counter--;
}


function check_game_variant() {
    if (game_variant == 0) {
        minimum_collectables = 0.35
    }
    else if (game_variant == 1) {
        minimum_collectables = 0.5
    }
}

