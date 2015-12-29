/* global $,Parse */
/* eslint unused:false */

'use strict';

/* static */
var iconSet = {
    'wifi': 'fa-wifi',
    '插座': 'fa-plug',
    '限時': 'fa-hourglass-half',
    '刷卡': 'fa-credit-card',
    '服務費': 'fa-money',
    '捷運站': 'fa-subway',
    '大桌': 'fa-laptop',
    '訂位': 'fa-calendar-check-o',
    '安靜': 'fa-bell-slash-o',
    '書架': 'fa-book',
    '低消': 'fa-usd',
    '吸菸': 'fa-magic',
    '戶外座': 'fa-umbrella'
};

/* Utils */
function screenDivision(parts, margins) {
    // get screen width
    var width = screen.width;
    if(margins) {
        width = width - margins;
    }
    // calculate the width for each part
    return width / parts;
}

/* Parse */
Parse.initialize('wTYRjN5abTd2I2BgdaBbbWupwB9Slv0fgd6SauW3', 'O8cF0dYOlwfce6uVLzEXlKfhp1SEhyVxJiPsma8K');

var tagMargin = 0;
var tagPerRow = 3;

var cafe;
var relation;
var isNewCafe = false;
var position = {};

var candidateContainer = $('.tags-wrap');

var Cafe = Parse.Object.extend('Cafe');
var CafeQuery = new Parse.Query(Cafe);

var Info = Parse.Object.extend('Info');
var InfoQuery = new Parse.Query(Info);

var clickHandler = function (event) {
    var isToRemove = $(this).hasClass('selected');
    $(this).toggleClass('selected');

    if (isToRemove) {
        console.log('remove', event.data.info);
        event.data.relation.remove(event.data.info);
    } else {
        console.log('add', event.data.info);
        event.data.relation.add(event.data.info);
    }
};

var clearContent = function (event) {

    if(event.data && event.data.clearAll) {
        $('#cafe-name').val('').focus();
    }

    if($('geo').hasClass('active')) {
        $('geo').removeClass('active');
    }

    // clear current content
    $('.tags-wrap').html('');
    // clear form
    $('#cafe-addr').val('');
    $('#cafe-tel').val('');
};

var searchHandler = function (event) {

    if (event.data && event.data.keyup && event.keyCode !== 13) {
        return;
    }

    // clear current content
    clearContent(event);

    // start spinner
    var targetIcons = $('.search').find('i');
    targetIcons.toggleClass('d-n');

    // get cafe name
    CafeQuery.equalTo('name', $('#cafe-name').val().toLowerCase());

    CafeQuery.find().then(function(results){
        targetIcons.toggleClass('d-n');
        if (results.length) {

            console.log(results[0].get('name'));
            console.log(results[0].get('address'));
            console.log(results[0].get('tel'));

            if (results[0].get('geo')) {
                $('.geo').addClass('active');
            }
            return Parse.Promise.as(results[0]);
        } else {
            return Parse.Promise.error('this is a new cafe');
        }
    }).then(function(result) {

        $('.search').addClass('active');

        // found the cafe
        cafe = result;

        //try to fetch address and tel
        $('#cafe-addr').val(cafe.get('address'));
        $('#cafe-tel').val(cafe.get('tel'));

        // fetch all existing relations
        relation = cafe.relation('infos');

        isNewCafe = false;

        // console.log('found the cafe:', cafe);
        return InfoQuery.find();

    // this is a new cafe, create a new cafe object
    }, function(err) {

        console.log(err);

        // create a new Cafe object
        cafe = new Parse.Object('Cafe');

        relation = cafe.relation('infos');

        isNewCafe = true;

        // and fetch all existing relations
        return InfoQuery.find();

    }).then(function(infoObjs){
        var tagName, icon;
        var tagSize = Math.floor(screenDivision(tagPerRow, tagMargin * tagPerRow * 2));

        infoObjs.forEach(function(infoObj){

            tagName = infoObj.get('name');

            // try to get icon
            icon = iconSet[tagName];

            // create a tag element and attach the click event
            var infoEle = $('<div/>').addClass('tag')
            .addClass('op-0')
            .attr('id', infoObj.id)
            .appendTo(candidateContainer)
            .on('click', {
                info: infoObj,
                relation: relation
              }, clickHandler)
            // adjust the width/height before showing tags
            .css({
                width: tagSize,
                height: tagSize,
                margin: tagMargin
            });
            $('<i/>').addClass('icon fa').addClass(icon).appendTo(infoEle);
            $('<span/>').addClass('txt').text(tagName).appendTo(infoEle);
        });

        if (isNewCafe) {
            return Parse.Promise.as([]);
        } else {
            return relation.query().find();
        }

    }).then(function(infoObjs){
        // filter out existing tags, and make them "selected"
        infoObjs.forEach(function(infoObj){
            $('#' + infoObj.id).addClass('selected');
        });

        $('.tag').removeClass('op-0');
    });
};

function savePosition(pos) {
    position.lat = pos.coords && pos.coords.latitude;
    position.lon = pos.coords && pos.coords.longitude;
    console.log('geolocation updated:', position);
}

var geoHandler = function () {
    // start spinner
    var targetIcons = $('.geo').find('i');
    targetIcons.toggleClass('d-n');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos){
            targetIcons.toggleClass('d-n');
            $('.geo').addClass('active');
            savePosition(pos);
        });
    } else {
        targetIcons.toggleClass('d-n');
        console.log('Geolocation is not supported by this browser.');
    }
};

var submitHandler = function (event) {

    $('.save-icons').find('.status').toggleClass('d-n');

    // set address and tel
    cafe.set('name', $('#cafe-name').val());
    cafe.set('address', $('#cafe-addr').val());
    cafe.set('tel', $('#cafe-tel').val());


    if (position && position.lat && position.lon) {
        var point = new Parse.GeoPoint({
            latitude: parseFloat(position.lat),
            longitude: parseFloat(position.lon)
        });
        cafe.set('geo', point);
    }

    // save
    cafe.save(null, {
        success: function() {
            // stop animation
            $('.save-icons').find('.status').toggleClass('d-n');
            console.log('save ok');
        },
        error: function () {
            $('.save-icons').find('.status').toggleClass('d-n');
            console.log('save failed');
        }
    });
    console.log(event.target);
    console.log('save the cafe', cafe.get('name'));
};

// handle save
$('.save-btn').on('click', submitHandler);

// handle search
$('.search').on('click', searchHandler);

$('.geo').on('click', geoHandler);

// handle clear all
$('.add-btn').on('click', { clearAll: true }, searchHandler);

// focus event on input
$('input').on('focus', function(){
    $(this).parents('.info-wrap').toggleClass('active');
}).on('blur', function(){
    $(this).parents('.info-wrap').toggleClass('active');
}).keyup({ keyup: true }, searchHandler);


$(document).on('ready', { clearAll: true }, function(e){
    searchHandler(e);
});
