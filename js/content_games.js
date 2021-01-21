/*!
 * Kong Addon for www.kongregate.com v1.5
 * https://github.com/Forthtilliath/Kong-Addon
 *
 * Copyright 2020 Forth
 * Released under the MIT license
 * 
 * @fileoverview List of functions which are only executed on game pages. Among this function, there are buttons which show/hide quick links, dark mode, lock screen, hide online players, change text size, change brightless and change volume of ding when someone post a message in the chat
 * @author Forth
 * @version 4
 */
"use strict";

/* When page is loaded */
$(document).ready(function () {
    /* Initialisation start */

    /* Check if each button already exist and delete them to avoid any double
     * when the extension is updated while running (had this issue on FF) */
    if (isFirefox) $.removeElements2([$('div#forth_features'), $('button#bt_showquicklinks'), $('span.onlyGameOrChat'), $('#script_kong'), $('div#forth_fullscreen'), $('tr#tr_features'), features.get('unreadMessages').div]);

    // Name of the game
    let gameName = $(".gamepage_title_block > h1[itemprop='name']").text();

    /**** LIST OF FUNCTIONS START *******************************************************************************************
     * - actionUnreadMessage() : Show/Hide button of unread messages
     * - removeStyleUnreadMessage() : Remove style of unread messages link
     * - changeVolume() : Change the volume and the button
     ****/

    // Actions did when the number of unread messages change
    function actionUnreadMessage() {
        // If message unread and lockScreen on
        if ((parseInt($("#profile_control_unread_message_count").text(), 10) > 0) && $("#forth_fullscreen").is(":visible")) {
            $.copyText('#msg-count', '#profile_control_unread_message_count'); // Copy the number of new messages in the button
            features.get('unreadMessages').show();
        } else {
            features.get('unreadMessages').hide();
        }
    }

    /** Remove all styles of the button message of the website when we click on it
     *  Per default, when we open new messages on a new tab, the link doesn't change
     */
    /*function removeStyleUnreadMessage() {
        $("#profile_control_unread_message_count").text(''); // Remove the number of unread messages
        $("#profile_control_unread_message_count").removeClass('has_messages mls'); // Remove the class
        $("#profile_bar_messages").removeClass('alert_messages'); // Remove the class
        $("#my-messages-link").attr('title', ''); // Remove the title
    }*/

    /** Change the volume of notifications and the button (icon + text)
     *  And save the volume in the cookie
     */
    function changeVolume() {
        //$('#slt_volume').val(volumeValue); // Volume choosed
        features.get('ping').div.find('select').val(volumeValue); // Volume choosed

        // Update the button with new icon & title
        let iconVolume = (volumeValue == 0) ? icon_volume_off : (volumeValue < 0.5) ? icon_volume_down : icon_volume_up;
        let textVolume = (volumeValue == 0) ? 'Click to unmute' : 'Click to mute';
        //$("#forth_volume > span").setButton($.createIcon(iconVolume), textVolume);
        features.get('ping').div.find('span').setButton($.createIcon(iconVolume), textVolume);

        $.execScript(`songMsg.volume = ${ volumeValue };`); // Inject the code the change the volume
        $.setCookieGame('VolumePing', volumeValue); // Update the cookie to save setting after refreshs
    }

    $.initialize("#signup_tab_pane", function () {
        $.setWidthChat((cookieDisplayMode != 0) ? modif_chat_width : 0);
    });

    /**** LIST OF FUNCTIONS END */

    /**** BUTTON QUICK LINKS START ******************************************************************************************
     * - Hide all quick links to gain space
     * - Add a button to show and hide quick links
     * - Remove facebook button from quick links
     ****/

    // Create the button
    //$("#quicklinks").prepend($.addButton('li', '', 'bt_showquicklinks', 'Show quick links', $.createIcon(icon_quicklinks_off)));
    $("#quicklinks").prepend('<li class="' + features.get('quickLinks').classes + '">' + new Button('bt_showquicklinks', 'Show quick links', $.createIcon(icon_quicklinks_off)).html + '</li>');
    // We remove the facebook button to gain space
    $("#quicklinks_facebook").remove();

    // Evenement
    $("#bt_showquicklinks").click(function () {
        $("#quicklinks > li:not(:first-child)").toggle();
        if ($("#quicklinks > li:not(:first-child)").css("display") == "list-item") {
            $(this).setButton($.createIcon(icon_quicklinks_on), 'Hide quick links');
        } else {
            $(this).setButton($.createIcon(icon_quicklinks_off), 'Show quick links');
        }
    });

    /**** BUTTON QUICK LINKS END */


    /**** BLOCK FEATURES START **********************************************************************************************
     * - Create the box for all features
     * - Create a sub-block for each feature
     ****/

    if (features.nbFeatures > 0) {
        features.addContainerIn('#cloud_save_info_template');
        features.addSubContainers();
    }

    /**** BLOCK FEATURES END */

    /**** BUTTON LOCK SCREEN START ******************************************************************************************
     * - Add a background we can use to only show game & chat
     * - Add a button to lock and unlock screen
     * - Remove cinematic button from quick links
     * - Add evenement on click
     ****/

    if ((features.get('lockscreen') !== undefined) && features.get('lockscreen').isActive()) {
        // Add the fullscreen mode in hide
        $('<div id="forth_fullscreen"></div>').appendTo("body");
        // Create the button and put it in the features div
        features.get('lockscreen').addDiv(new Button('bt_lockscreen', 'Lock screen', $.createIcon(icon_lockscreen_off)).html);
        // We remove the cinematic mode button
        $("#cinematic_mode_quicklink").remove();

        // Evenement
        $('#bt_lockscreen').click(function () {
            if ($("#forth_fullscreen").is(":visible")) { // Unlocked screen
                $("#forth_fullscreen").hide(); // Background
                $("#floating_game_holder").removeClass("game_ahead");
                $(this).removeClass("locked");
                jCSSRule("body", "overflow", "");
                jCSSRule("#floating_game_holder", "padding-top", "4px");
                $(this).setButton($.createIcon(icon_lockscreen_off), 'Lock screen');
                $.setCookieGame('LockScreen', 'false');
            } else { // Locked screen
                $("#forth_fullscreen").show(); // Background
                $("#floating_game_holder").addClass("game_ahead"); // Put the game ahead
                $(this).addClass("locked"); // Change the style of the button
                jCSSRule("body", "overflow", "hidden"); // We remove scrollbars
                jCSSRule("#floating_game_holder", "padding-top", "0px");
                $(this).setButton($.createIcon(icon_lockscreen_on), 'Unlock screen');
                $("#floating_game_holder").centrerElementAbsolu(); // Center the game
                $.setCookieGame('LockScreen', 'true');
            }
            // If unreadMessages is active, hide/show the button if new unreaad messages
            if (features.get('unreadMessages').isActive()) {
                actionUnreadMessage();
            }
        });

        if (cookieLockScreen) {
            $('#bt_lockscreen').trigger('click');
        }
    }

    /**** BUTTON LOCK SCREEN END */

    /**** BUTTON SHOW PLAYERS START *****************************************************************************************
     * - Add a button to show or hide online players
     * - Add evenement on click
     ****/

    if ((features.get('onlineplayers') !== undefined) && features.get('onlineplayers').isActive()) {
        // Create the button
        let value = '';
        if (cookieShowPlayers) { // Show
            value = new Button('bt_onlineplayers', 'Hide online players', $.createIcon(icon_onlinep_on)).html;
        } else { // Hide
            value = new Button('bt_onlineplayers', 'Show online players', $.createIcon(icon_onlinep_off)).html;
            jCSSRule(".chat_room_template > .users_in_room", "display", "none"); // Hide() doesn't work here
        }
        // Put the button in the features div
        features.get('onlineplayers').addDiv(value);

        // Evenement
        $('#bt_onlineplayers').click(function () {
            if ($(".chat_room_template > .users_in_room").css('display') == 'none') { // Show
                $(".chat_room_template > .users_in_room").show(500);
                $(this).html($.createIcon(icon_onlinep_on));
                $(this).prop('title', 'Hide online players');
                // Update the cookie to save setting after refreshs
                $.setCookieAll('ShowPlayers', 'true');
            } else { // Hide
                $(".chat_room_template > .users_in_room").hide(500);
                $(this).html($.createIcon(icon_onlinep_off));
                $(this).prop('title', 'Show online players');
                // Update the cookie to save setting after refreshs
                $.setCookieAll('ShowPlayers', 'false');
            }
            $("#chat_rooms_container .chat_message_window").scrollBottom();
        });
    }

    /**** BUTTON SHOW PLAYERS END */

    /**** MENU SELECT SIZE TEXT START ***************************************************************************************
     * - Add the button to change text size
     * - Add evenement on change
     ****/

    if ((features.get('textsize') !== undefined) && features.get('textsize').isActive()) {
        // Create the select menu
        let sOptionsSize = '';
        let sSelected = '';
        for (let i = min_fontsize; i <= max_fontsize; i += 2) {
            // Add 11px option (default value of the website)
            if (i == 12) {
                let ii = 11;
                (ii == cookieFontSize) ? sSelected = ' selected': sSelected = '';
                sOptionsSize += `<option value="${ii}"${sSelected}>${ii}px</option>`;
            }
            (i == cookieFontSize) ? sSelected = ' selected': sSelected = '';
            sOptionsSize += `<option value="${i}"${sSelected}>${i}px</option>`;
        }
        // Put the select menu in the features div
        features.get('textsize').addDiv(`<span>${$.createIcon(icon_font)}</span><select id="slt_fontsize">${sOptionsSize}</select>`);
        features.get('textsize').setTitle('Select the text size of your choice');
        $.changeTextSize(cookieFontSize);

        // Evenement
        $('#slt_fontsize').change(function () {
            // Add a cssrule to dynamise the text size
            $.changeTextSize($(this).val());
            // Update the cookie to save setting after refreshs
            $.setCookieAll('FontSize', $(this).val());
        });
    }

    /**** MENU SELECT SIZE TEXT END */

    /**** MENU SELECT BRIGHTNESS START **************************************************************************************
     * - Add the button to change the brightness of the game
     * - Add evenement on change
     ****/

    if ((features.get('brightness') !== undefined) && features.get('brightness').isActive()) {
        // Create select menu
        let sOptionsBrightness = '';
        let sSelected = '';
        for (let i = min_brightness; i <= max_brightness; i += step_brightness) {
            ((i + "%") == cookieBrightness) ? sSelected = ' selected': sSelected = '';
            sOptionsBrightness += `<option value="${i}%"${sSelected}>${i}%</option>`;
        }
        // Put the select menu in the features div
        features.get('brightness').addDiv(`<span>${$.createIcon(icon_brightness)}</span><select id="slt_brightness">${sOptionsBrightness}</select>`);
        features.get('brightness').setTitle('Select the brightness of your choice');

        // Evenement change brightness start
        $('#slt_brightness').change(function () {
            // Add a cssrule to dynamise the text size
            //cookieBrightness = $(this).val();
            jCSSRule("#maingamecontent #gameholder", "filter", "brightness(" + $(this).val() + ")");

            // Update the cookie to save setting after refreshs
            $.setCookieGame('Brightness', $(this).val());
        });
    }

    /**** MENU SELECT BRIGHTNESS END */

    /**** MENU SELECT VOLUME START ******************************************************************************************
     * - Add a button to change the volume from pings
     * - Add evenement on change on menu select
     * - Add evenement on click on icon
     ****/

    if ((features.get('ping') !== undefined) && features.get('ping').isActive()) {
        // Create the select menu
        let sOptionsVolume = '';
        let sSelected = '';
        for (let i = min_volume; i <= max_volume; i += 10) {
            (i == volumeValue * 100) ? sSelected = ' selected': sSelected = '';
            let labVolume = (i == 0) ? `Muted` : `${i}%`;
            sOptionsVolume += `<option value="${i/100}"${sSelected}>${labVolume}</option>`;
        }
        // Adapt the icon of the volume
        let iconVolume = (volumeValue == 0) ? icon_volume_off : (volumeValue < 0.5) ? icon_volume_down : icon_volume_up;
        // Put the select menu in the features div
        features.get('ping').addDiv(`<span>${$.createIcon(iconVolume)}</span><select id="slt_volume">${sOptionsVolume}</select>`);
        features.get('ping').setTitle('Select the volume of your choice');

        // Evenement when sound choose on select menu
        $('#slt_volume').change(function () {
            // Save last volume
            volumeValueOld = volumeValue;
            volumeValue = $(this).val();
            changeVolume();
        });

        // Evenement when sound is muted/unmuted from icon
        $('#forth_ping > span').click(function () {
            // Swap old volume to new if mute
            if (volumeValue == 0) {
                volumeValue = volumeValueOld;
            } else { // Swap current volume to old then mute
                volumeValueOld = volumeValue;
                volumeValue = 0;
            }
            changeVolume();
        });
    }

    /**** MENU SELECT VOLUME END */

    /**** BUTTON CHAT ONLY END */

    if ((features.get('displayMode') !== undefined) && features.get('displayMode').isActive()) {
        // Create the buttons
        let bt_gameOnly = new Button('bt_gameOnly', 'Show only the game', $.createIcon(icon_gameonly));
        let bt_gameNchat = new Button('bt_gameNchat', 'Show both', $.createIcon(icon_gameNchat));
        let bt_chatOnly = new Button('bt_chatOnly', 'Show only the chat', $.createIcon(icon_chatonly));
        // Put the 3 buttons in the features div
        features.get('displayMode').addDiv(bt_gameOnly.html + bt_gameNchat.html + bt_chatOnly.html);

        // Create a new line in the table between links_connect & chat (to have enough space to have all in one line)
        $('<tr id="tr_features"><td colspan="2"></td></tr>').insertAfter("#flashframecontent > table.game_table > tbody > tr:nth-of-type(1)");
        // Add the name of the game
        $(`<span class="onlyGameOrChat">${gameName}</span>`).insertBefore("#quicklinks");

        // Evenements
        function showOnlyGameOrChat() {
            if (displayMode == 0) {
                $("#forth_features").addClass("onlyGameOrChat");
                $("#quicklinks").hide(); // Hide quicklinks
                $("#tr_features").show(); // Show tr_features
                $('#forth_features').prependTo('#tr_features > td'); // Move buttons in tr_features
                if ((features.get('lockscreen') !== undefined) && features.get('lockscreen').isActive() && $("#forth_fullscreen").is(":visible")) // Center the chat/game if fullscreen
                    $("#floating_game_holder").centrerElementAbsolu();
                gameOrChatHided = true;
            }
        }

        function click_gameOnly() {
            if (displayMode != -1) { // If already in gameMode, do nothing
                // Hide/Show features when onlyGame
                if ((features.get('brightness') !== undefined) && features.get('brightness').isActive()) {
                    features.get('brightness').show(); // Show brightness button
                }
                if ((features.get('onlineplayers') !== undefined) && features.get('onlineplayers').isActive()) {
                    features.get('onlineplayers').hide(); // Hide onlineplayers button
                }
                if ((features.get('textsize') !== undefined) && features.get('textsize').isActive()) {
                    features.get('textsize').hide(); // Hide textsize button
                }

                // Show game & hide chat
                $("#gameholder").show(); // Show game
                $("#chat_container_cell").hide(); // Hide chat

                // Resize box
                $.log(10, "gameiframe= " + $("#gameiframe").css("width"));
                while ($("#gameiframe").css("width") == 0) {
                    setTimeout(function () {

                    }, 100);
                }
                $.setHeightBoth(`calc(${iDefaultBothHeight} + ${menuButtonsHeight2})`);
                $.setWidthBoth($("#gameiframe").css("width"));
                $.setWidthChat(); // Resize chat
                $.setWidthGame($("#gameiframe").css("width"));
                if (iDefaultGameLeft == -1) iDefaultGameLeft = $("#gameiframe").css("left");
                $("#gameiframe").css("left", 0);

                // Show game name
                let width_nameGame = $("#maingame").width() - 150 /* Login max width */ - 20 /* Space */ ;
                $("span.onlyGameOrChat").css("width", width_nameGame);
                $("span.onlyGameOrChat").show();

                // Mute pings
                if ((features.get('ping') !== undefined) && features.get('ping').isActive()) {
                    volumeValueOld = (volumeValue > 0) ? volumeValue : 0;
                    if (volumeValue > 0) volumeValue = 0;
                    changeVolume();
                }

                showOnlyGameOrChat();
                $.setCookieGame('DisplayMode', -1);
                $.setStyleDisplayMode(-1); // Change display of button
                displayMode = -1;
            }
        }

        function click_chatOnly() {
            if (displayMode != 1) { // If already in chatMode, do nothing
                // Hide/Show features when onlyChat
                if ((features.get('brightness') !== undefined) && features.get('brightness').isActive()) {
                    features.get('brightness').hide(); // Show brightness button
                }
                if ((features.get('onlineplayers') !== undefined) && features.get('onlineplayers').isActive()) {
                    features.get('onlineplayers').show(); // Hide onlineplayers button
                }
                if ((features.get('textsize') !== undefined) && features.get('textsize').isActive()) {
                    features.get('textsize').show(); // Hide textsize button
                }

                // Hide game & show chat
                $("#gameholder").hide(); // Hide game
                $("#chat_container_cell").show(); // Show chat

                // Resize box
                $.setHeightBoth(`calc(${iDefaultBothHeight} + ${menuButtonsHeight2})`);
                $.setWidthBoth(`calc( ${iDefaultChatWidth} + ${modif_chat_width}px - 3px )`); // Reduce game box
                $.setWidthChat(modif_chat_width); // Resize chat enlarger
                $("#gameiframe").css("left", iDefaultGameLeft);

                // Show game name
                let width_nameGame = $("#maingame").width() - $(".user_connection").width() - 20;
                $("span.onlyGameOrChat").css("width", width_nameGame);
                $("span.onlyGameOrChat").show();

                // Unmute pings
                if ((features.get('ping') !== undefined) && features.get('ping').isActive()) {
                    if (volumeValueOld > 0) {
                        volumeValue = volumeValueOld;
                        volumeValueOld = 0;
                        changeVolume();
                    }
                }

                showOnlyGameOrChat();
                $.setCookieGame('DisplayMode', 1);
                $.setStyleDisplayMode(1); // Change display of button
                displayMode = 1;
            }
        }

        function click_gameNchat() {
            if (displayMode != 0) { // If already in bothMode, do nothing
                $("#forth_features").removeClass("onlyGameOrChat");

                // Remove features & quicklinks as default
                $("#quicklinks").show(); // Show quicklinks
                $('#forth_features').insertBefore('#cloud_save_info_template'); // Move buttons in tr_features
                $("#tr_features").hide(); // Hide tr_features

                // Show features
                if ((features.get('brightness') !== undefined) && features.get('brightness').isActive()) {
                    features.get('brightness').show(); // Show brightness button
                }
                if ((features.get('onlineplayers') !== undefined) && features.get('onlineplayers').isActive()) {
                    features.get('onlineplayers').show(); // Hide onlineplayers button
                }
                if ((features.get('textsize') !== undefined) && features.get('textsize').isActive()) {
                    features.get('textsize').show(); // Hide textsize button
                }

                // Show game & chat
                $("#gameholder").show(); // Show game
                $("#chat_container_cell").show(); // Show chat

                // Resize box
                $.setHeightBoth(iDefaultBothHeight);
                $.setWidthBoth(iDefaultBothWidth); // Resize game box per default
                $.setWidthGame(iDefaultGameWidth); // Resize game box per default
                $.setWidthChat(); // Resize chat enlarger per default
                $("#gameiframe").css("left", iDefaultGameLeft);

                $("span.onlyGameOrChat").hide(); // Hide game name

                // Unmute pings
                if ((features.get('ping') !== undefined) && features.get('ping').isActive()) {
                    if (volumeValueOld > 0) {
                        volumeValue = volumeValueOld;
                        volumeValueOld = 0;
                        changeVolume();
                    }
                }

                gameOrChatHided = false;
                $.setCookieGame('DisplayMode', 0);
                $.setStyleDisplayMode(0); // Change display of button
                displayMode = 0;
            }
        }

        // Initialisation
        $.log(1, 'cookieDisplayMode= ' + cookieDisplayMode);
        if (cookieDisplayMode == '-1') {
            $("#gameiframe").ready(function () {
                click_gameOnly();
            });
        } else if (cookieDisplayMode == '1') {
            $("#chat_rooms_container").ready(function () {
                click_chatOnly();
            });

            // Once chat_rooms_container is completely loaded
            $.initialize("#chat_rooms_container", function () {
                if (cookieDisplayMode != 0) { // If not default mode
                    $.setWidthChat(modif_chat_width); // Resize the chat
                    let width_nameGame = $("#maingame").width() - $(".user_connection").width() - 20; // Resize the div for game name
                    $("span.onlyGameOrChat").css("width", width_nameGame);
                }
            });

        } else if (cookieDisplayMode == '0') {
            $.log(1, "iDefaultBothWidth=" + iDefaultBothWidth);
            $.setWidthBoth(iDefaultBothWidth); // Resize game box per default
            $("#gameiframe").ready(function () {
                click_gameNchat();
            });
        }

        // Evenements
        $('#bt_gameOnly').click(function () {
            click_gameOnly();
        });
        $('#bt_chatOnly').click(function () {
            click_chatOnly();
        });
        $('#bt_gameNchat').click(function () { // Default mode
            click_gameNchat();
        });
    }

    if ((features.get('lockscreen') !== undefined) && features.get('lockscreen').isActive() && (features.get('unreadMessages') !== undefined) && features.get('unreadMessages').isActive()) {

        // Create the button with the icone & span for unread messages count
        features.get('unreadMessages').addDiv(new Button('bt_unreadMessages', 'Read new message(s)', $.createIcon(icon_unreadMessage) + '<span id="msg-count"></span>').html);

        $.initialize("#profile_control_unread_message_count", function () {
            actionUnreadMessage(); // No needed, observer is called once when the page is loading
        });

        // create a new instance of `MutationObserver` named `observer`,
        // passing it a callback function
        const observer = new MutationObserver(function () {
            //console.log('callback that runs when observer is triggered');
            actionUnreadMessage();
        });

        // call `observe()` on that MutationObserver instance,
        // passing it the element to observe, and the options object
        observer.observe($("#profile_control_unread_message_count")[0], {
            childList: true
        });

        // Hide darkMode button when the height of the page is too low
        $(window).resize(function () {
            if ($(window).height() < (parseInt($("#maingame").css("height"), 10) + 60 /* height button */ + 20 /* padding gamebox */ ) || !$("#forth_fullscreen").is(":visible")) {
                features.get('unreadMessages').hide();
            } else {
                actionUnreadMessage();
            }
        });

        // Click on the button
        $('#bt_unreadMessages').click(function () {
            features.get('unreadMessages').hide(); // Hide the div with the button
            $.removeStyleUnreadMessage();
            window.open($("#my-messages-link").attr('href')); // Open a new page to show new messages
        });

        //$("a#my-messages-link").mousedown(function () {
        $("a#my-messages-link").mouseup(function () {
            $.removeStyleUnreadMessage();
        });
    }

    if ((features.get('lockscreen') !== undefined) && features.get('lockscreen').isActive()) {
        // Each time the window is resized, we keep the game centered
        $(window).resize(function () {
            if ($("#forth_fullscreen").is(":visible")) {
                $("#floating_game_holder").centrerElementAbsolu();
            }
        });
        $.initialize("#floating_game_holder", function () {
            $("#floating_game_holder").centrerElementAbsolu();
        });
    }
});
