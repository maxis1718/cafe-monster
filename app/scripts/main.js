Parse.initialize("wTYRjN5abTd2I2BgdaBbbWupwB9Slv0fgd6SauW3", "O8cF0dYOlwfce6uVLzEXlKfhp1SEhyVxJiPsma8K");

var cafe;
var relation;

var candidateContainer = $('.tags-wrap');

var Cafe = Parse.Object.extend("Cafe");
var CafeQuery = new Parse.Query(Cafe);

var Info = Parse.Object.extend("Info");
var InfoQuery = new Parse.Query(Info);

var clickHandler = function (event) {
    var isToRemove = $(this).hasClass('selected');
    $(this).toggleClass('selected');

    if (isToRemove) {
        console.log('remove', event.data.info);
        event.data.relation.remove(event.data.info);
    // 
    } else {
        console.log('add', event.data.info);
        event.data.relation.add(event.data.info);
    }
};

var submitHandler = function (event) {
    cafe.save();
    console.log('save the cafe', cafe.get('name'));
};


// e.g., homeys
CafeQuery.equalTo('name', $('#cafe-name').val());

CafeQuery.find().then(function(results){
    if (results.length) {

        console.log(results[0].get('name'));
        console.log(results[0].get('address'));
        console.log(results[0].get('tel'));

        return Parse.Promise.as(results[0]);
    } else {
        return Parse.Promise.error('this is a new cafe');
    }
}).then(function(result) {

    // found the cafe, fetch all existing relations
    cafe = result;

    relation = cafe.relation('infos')


    // console.log('found the cafe:', cafe);
    return InfoQuery.find();

// this is a new cafe, create a new cafe object
}, function(err) {

    console.log(err);
    // create a new Cafe object
    // ...

    // and fetch all existing relations
    return InfoQuery.find();

}).then(function(infoObjs){

    // relation = cafe.relation('infos');

    infoObjs.forEach(function(infoObj){

    // create a tag element and attach the click event
    $('<div/>').addClass('tag')
    .text(infoObj.get('name'))
    .attr('id', infoObj.id)
    .appendTo(candidateContainer)
    .on('click', {
        info: infoObj,
        relation: relation
      }, clickHandler);
  });

  return relation.query().find();

}).then(function(infoObjs){

    // filter out existing tags, and make them "selected"
    infoObjs.forEach(function(infoObj){
        $('#'+infoObj.id).addClass('selected');
    });
});

$('.submit-btn').on('click', submitHandler);
