"use strict";Parse.initialize("wTYRjN5abTd2I2BgdaBbbWupwB9Slv0fgd6SauW3","O8cF0dYOlwfce6uVLzEXlKfhp1SEhyVxJiPsma8K");var cafe,relation,candidateContainer=$(".tags-wrap"),Cafe=Parse.Object.extend("Cafe"),CafeQuery=new Parse.Query(Cafe),Info=Parse.Object.extend("Info"),InfoQuery=new Parse.Query(Info),clickHandler=function(e){var a=$(this).hasClass("selected");$(this).toggleClass("selected"),a?(console.log("remove",e.data.info),e.data.relation.remove(e.data.info)):(console.log("add",e.data.info),e.data.relation.add(e.data.info))},submitHandler=function(e){$(".save-icons").find(".status").toggleClass("d-n"),cafe.save(null,{success:function(){$(".save-icons").find(".status").toggleClass("d-n"),console.log("save ok")},error:function(){$(".save-icons").find(".status").toggleClass("d-n"),console.log("save failed")}}),console.log(e.target),console.log("save the cafe",cafe.get("name"))},iconSet={wifi:"fa-wifi","插座":"fa-plug","限時":"fa-hourglass-half","刷卡":"fa-credit-card","服務費":"fa-money","捷運站":"fa-subway","大桌":"fa-laptop","訂位":"fa-calendar-check-o","安靜":"fa-bell-slash-o","書架":"fa-book"};CafeQuery.equalTo("name",$("#cafe-name").val()),CafeQuery.find().then(function(e){return e.length?(console.log(e[0].get("name")),console.log(e[0].get("address")),console.log(e[0].get("tel")),Parse.Promise.as(e[0])):Parse.Promise.error("this is a new cafe")}).then(function(e){return cafe=e,relation=cafe.relation("infos"),InfoQuery.find()},function(e){return console.log(e),InfoQuery.find()}).then(function(e){var a,n;return e.forEach(function(e){a=e.get("name"),n=iconSet[a];var o=$("<div/>").addClass("tag").addClass("op-0").attr("id",e.id).appendTo(candidateContainer).on("click",{info:e,relation:relation},clickHandler);$("<span/>").addClass("txt").text(a).appendTo(o),$("<i/>").addClass("fa").addClass(n).appendTo(o)}),relation.query().find()}).then(function(e){e.forEach(function(e){$("#"+e.id).addClass("selected")}),$(".tag").removeClass("op-0")}),$(".save-btn").on("click",submitHandler);