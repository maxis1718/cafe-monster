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

/* Parse */
Parse.initialize('wTYRjN5abTd2I2BgdaBbbWupwB9Slv0fgd6SauW3', 'O8cF0dYOlwfce6uVLzEXlKfhp1SEhyVxJiPsma8K');

var cafe;
var relation;
var isNewCafe = false;

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

    // clear current content
    $('.tags-wrap').html('');
    // clear form
    $('#cafe-addr').val('');
    $('#cafe-tel').val('');
};

var searchHandler = function (event) {

    // clear current content
    clearContent(event);

    // start spinner
    var targetIcons = $('.search').find('i');
    targetIcons.toggleClass('d-n');



    // get cafe name
    CafeQuery.equalTo('name', $('#cafe-name').val());

    CafeQuery.find().then(function(results){
        targetIcons.toggleClass('d-n');
        if (results.length) {

            console.log(results[0].get('name'));
            console.log(results[0].get('address'));
            console.log(results[0].get('tel'));

            return Parse.Promise.as(results[0]);
        } else {
            return Parse.Promise.error('this is a new cafe');
        }
    }).then(function(result) {

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

        console.log('infoObjs');

        var tagName, icon;

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
              }, clickHandler);

            $('<span/>').addClass('txt').text(tagName).appendTo(infoEle);
            $('<i/>').addClass('icon fa').addClass(icon).appendTo(infoEle);
        });

        if (isNewCafe) {
            return Parse.Promise.as([]);
        } else {
            return relation.query().find();
        }

    }).then(function(infoObjs){

        console.log('final');

        // filter out existing tags, and make them "selected"
        infoObjs.forEach(function(infoObj){
            $('#' + infoObj.id).addClass('selected');
        });
        $('.tag').removeClass('op-0');
    });
};

var submitHandler = function (event) {

    $('.save-icons').find('.status').toggleClass('d-n');

    // set address and tel
    cafe.set('name', $('#cafe-name').val());
    cafe.set('address', $('#cafe-addr').val());
    cafe.set('tel', $('#cafe-tel').val());

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

// handle clear all
$('.add-btn').on('click', { clearAll: true }, clearContent);


$(document).on('ready', { clearAll: true }, searchHandler);
