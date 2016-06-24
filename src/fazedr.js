/**
 * Slorum Strapon
 * copyright 2011-2016 SpinDrift of the slorum
 */

/**
 * Keyboard navigation
 */
$(document).keypress(function(event){
    if ($("input:focus, textarea:focus").length > 0) return;
    var fr_thisScroll = $("body").scrollTop();
    fr_images = $("#content .post_body img, #content iframe");

    //console.log("Keycode: " + event.charCode);

    // N is pressed
    if (event.charCode == 110){
        var nextLink = $("#content .pagination li:last a").attr("href");
        if (nextLink != undefined){
            document.location = nextLink;
        }
    }

    // H is pressed (Home)
    if (event.charCode == 104){
        $("body").animate({scrollTop : ($(""+window.location.hash).offset().top - 10) }, "fast" );
        return;
    }

    // F is pressed (Forum)
    if (event.charCode == 102){
        document.location = "/forum/";
    }

    // J/K is pressed (image nav)
    if (event.charCode == 106 || event.charCode == 107){
        var imgOffset = 30;
        for (var fr_loop = 0; fr_loop < fr_images.length; fr_loop ++){
            if (event.charCode == 106){
                // J is pressed
                if (fr_images.eq(fr_loop).offset().top - imgOffset - 10 > $("body").scrollTop()){
                    $("body").animate({scrollTop : (fr_images.eq(fr_loop).offset().top - imgOffset) }, "fast" );
                    return;
                }

            } else if (event.charCode == 107){
                // K is pressed
                if (fr_images.eq(fr_images.length-1).offset().top  < $("body").scrollTop()){
                    $("body").animate({scrollTop : (fr_images.eq(fr_images.length-1).offset().top - imgOffset) }, "fast" );
                    fr_loop = fr_images.length;
                } else if (fr_images.eq(fr_loop).offset().top - imgOffset >= $("body").scrollTop()){
                    if (fr_loop > 0){
                        $("body").animate({scrollTop : (fr_images.eq(fr_loop-1).offset().top - imgOffset) }, "fast" );
                    }
                    return;
                }

            } else{
                return;
            }
        }
    }
});


function autoRefresh(){
    if ($("select, textarea, input, checkbox").is(":focus") || $("#overDiv").attr("style").indexOf("visible") > 0 ){
        // focus: user is doing something
        // we shut down refresh all together.
        return;
    };

    // no focus
    chrome.extension.sendRequest({key: "refreshTab"});
}

(function(){
// resize tall images
chrome.extension.sendRequest({
    key : "resizeTall"
}, function(response) {

    if (response.value == "true"){
        // console.log($("head"));
        $("<style type='text/css'> .post_body img:not(.strapon-tall-unresized){ max-height: 90vh; } </style>").appendTo("head");
    }
});
    
    $(".post_body img:not(.strapon-tall-unresized)").click(function(){$(this).addClass("strapon-tall-unresized")});
    
})();

$(function() {

    document.straponSettings = {};
    document.straponSettings.nsfwImages = "false";
    document.gfy = {};
    console.log("slorum strap-on loaded");

 
    // trigger timed clipbox refresh
    setTimeout("clipBoxTimer()", 500);

    // Load nsfw images and gfys?
    chrome.extension.sendRequest({
        key : "nsfwImages"
    }, function(response) {
        document.straponSettings.nsfwImages = response.value;
        if(document.straponSettings.nsfwImages == "true") {
            $("#content a.nsfw").each(function(i) {
                if ($(this).parents(".spoiler").size() > 0 ) return;
                var link = $(this).attr("href");
                var rext = link.substring(link.length - 4).toLowerCase();
                if(rext == ".jpg" || (rext == ".gif" && link.indexOf("gfycat.com") == -1) || rext == ".png" || rext == "jpeg") {
                    var fImg = new Image();
                    fImg.src = link;
                    fImg.className = "fazedr_redlink";
                    $(this).after("<br>").after($(fImg)).after("<br>");
                }
            });
            reposition_delayed();
        }

        loadGfys();
    });

    function loadNSFWImages(){

    }

    // load gfycats?
    function loadGfys(){

        $("#content a").each(function(i) {

            if ($(this).parents(".spoiler").size() > 0 ) return;
            if ( ($(this).hasClass("nsfw") && document.straponSettings.nsfwImages == "true" ) || !$(this).hasClass("nsfw") ){


                var link = $(this).attr("href");
                if (link == undefined) return;


                // is link gfycat
                if (link.indexOf("gfycat.com") > 0){
                    // extract gfycatidentifier
                    var gfypre = link.indexOf("gfycat.com/");
                    if (gfypre == -1) return;
                    gfypre += "gfycat.com/".length;
                    var gfypost = link.indexOf(".gif");
                    if (gfypost == -1) gfypost = link.length;
                    //console.log(gfypre + " - " + gfypost);
                    var gfyid = link.substring(gfypre, gfypost);
                    $(this).attr("data-gfy", gfyid);

                    // probe gfycat for webm-url
                    var ajaxSettings = {};
                    ajaxSettings.crossDomain = true;
                    ajaxSettings.dataType = "json";

                    $.ajax("http://gfycat.com/cajax/get/"+gfyid, ajaxSettings).done(function(data){
                        if (data.gfyItem != undefined){
                            var gfyElms = $("#content a[data-gfy="+data.gfyItem.gfyName+"]");
                            gfyElms.each(function(){
                                if ($(this).next("video").size() == 0){  // Avoid duplicate embedding
                                    $(this).after("<br/><video id=" + data.gfyItem.gfyName + " style='max-width: 100%' width=" + data.gfyItem.width + " height=" + data.gfyItem.height + " autoplay loop style='display: block;'>" + "<source id=webmsource src='" + data.gfyItem.webmUrl + "' type=video/webm>" + "</video>");
                                }
                            });
                            //console.log(gfyElm);
                        }
                    });
                }
                
                // load gifvs
                if (link.indexOf("imgur.com/") > 0 && ( link.indexOf(".gifv") > 0 || link.indexOf(".mp4" > 0) )){
                    
                    // extracting id
                    var gifvpre = link.indexOf("imgur.com/");
                    if (gifvpre == -1) return;
                    gifvpre += "imgur.com/".length;
                    if (link.indexOf(".gifv") > 0 ){
                        var gifvpost = link.indexOf(".gifv");
                    } else {
                         var gifvpost = link.indexOf(".mp4");
                    }
                    if (gifvpost == -1) gifvpost = link.length;
                    var gifvId = link.substring(gifvpre, gifvpost);
                    
                    // set referance to avoid double embedding
                    $(this).attr("data-gifv", gifvId);
                    
                    // fetching metadata from imgur
                    $.ajax({
                        url: "https://api.imgur.com/3/image/"+gifvId,
                        crossDomain: true,
                        dataType: "json",
                        headers: {
                            Authorization: "Client-ID 551fc2857ecbfb9"    
                        },
                        success: function(data){
                            if (data.success == true){
                                var gifvId = data.data.id;
                                var gifvHeight = data.data.height;
                                var gifvWidth = data.data.width;
                                
                                // embedding gifv
                                var gifvElms = $("#content a[data-gifv="+gifvId+"]");
                                gifvElms.each(function(){
                                    if ($(this).next("video").size() == 0){  // Avoid duplicate embedding
                                        $(this).after("<video id=" + gifvId + " width=" + gifvWidth + " height=" + gifvHeight + " autoplay loop style='display: block;'>" +
                                        "<source id=webmsource src='https://i.imgur.com/" + gifvId + ".mp4' type=video/mp4>" +
                                        "</video>");
                                    }
                                });
                            }
                            
                        }
                    })
                }
                    
            }
        });

    }




    chrome.extension.sendRequest({
        key : "embedMedia"
    }, function(response) {
        youtube = response.value;   // well, youtube or any other provider. should refactor this..
        if(youtube == "true") {

            

            $("#content a").each(function(i) {
                var link = $(this).attr("href");
                if(link != undefined) {

                    // youtube
                    if (link.indexOf("youtu") != -1){
                        var videoId = null;
                        if(link.indexOf("/youtu.be") != -1) {
                            videoId = link.substring(link.indexOf(".be/") + 4, link.length);
                        } else {
                            var idx_start = link.indexOf("?v=");
                            var idx_end = link.indexOf("&");
                            if(idx_end == -1)
                                idx_end = link.length;
                            if(idx_start != -1) {
                                videoId = link.substring(idx_start + 3, idx_end);
                            }
                        }
                        if(videoId != null) {
                            //iframe embedding is way less cpu intensive.
                            var iframe = document.createElement("iframe");
                            iframe.src = "http://www.youtube.com/embed/" + videoId;
                            iframe.setAttribute("width","560");
                            iframe.setAttribute("height", "350");
                            iframe.setAttribute("style", "border: none;");
                            var jqIframe = $(iframe);
                            $(this).after("<br>").after(jqIframe).after("<br>");
                        }
                    }

                    // soundcloud
                    if (link.indexOf("soundcloud.com") != -1){

                        SC.oEmbed(link, { auto_play: true }, function(oEmbed) {
                            // console.log('oEmbed response: ' + oEmbed);
                            debugger;
                        });
                        var iframe = document.createElement("iframe");
                        iframe.setAttribute("height", "150");
                        iframe.setAttribute("width", "100%");
                        iframe.setAttribute("scrolling", "no");
                        iframe.setAttribute("frameborder", "no");
                        var scurl = "https://w.soundcloud.com/player/?url=" + link + "&auto_play=false&hide_related=false&visual=false"
                        iframe.src=scurl;
                        $(this).after("<br>").after($(iframe)).after("<br>");
                    }

                    // vimeo
                    if (link.indexOf("vimeo.com") != -1){
                        var iframe = document.createElement("iframe");
                        iframe.setAttribute("height", "350");
                        iframe.setAttribute("width", "560");
                        iframe.setAttribute("scrolling", "no");
                        iframe.setAttribute("frameborder", "no");
                        videoId = link.substring(link.indexOf(".com/") + 5, link.length);
                        iframe.src="//player.vimeo.com/video/" + videoId;
                        $(this).after("<br>").after($(iframe)).after("<br>");
                    }

                }
            });
            reposition_delayed();
        }
    });
});



/**
 *      validates image link
 */
function isImageLink(s){
    try{
        s = s.toLowerCase();
    } catch (e){
        return false;
    }
    if (s.indexOf("http") > -1){
        if (s.indexOf('.gifv') == -1){
            if (s.indexOf('.jpg') > -1 || s.indexOf('.jpeg') > -1 || s.indexOf('.gif') > -1 || s.indexOf('.png') > -1){
                return true;
            }
        }
    }
    return false;
}



/**
 *      creates clipBox with image from imgURL
 */
function createClipBox(){

    //var fImageStyle = makeImageStyleString(imgURL);


    $("form[name=post] textarea").attr("id", "fazedr-form");
    $("#fazedr-form").wrap("<div id='fazedr-wrap' style='width: 83em;'/>");
    $("#fazedr-wrap").append("<style>" +
    "#fazedr-paste, #fazedr-paste-nsfw{border: 1px solid #A9A9A9;background: #FAFAFA;}" +
    "#fazedr-paste:hover, #fazedr-paste-nsfw:hover{background:#DFE8F7;}" +
    "</style>");
    //$("#fazedr-wrap").append("<img src='" + response.value + "' style='" + fImageStyle + "'/>");
    $("#fazedr-wrap").append("<div id='fazedr-imgpost' style='position: relative; display: none; width: 20em; float: right; border: 1px solid #999; height: 114px; padding: 10px; background: #eee'>" +
    "<div id=fazedr-close style='cursor: pointer; position: absolute; top: 2px; right: 6px'> x </div>" +
    "<strong style='display:block; margin-bottom:5px;'>From the clipboard</strong>" +
    "<div style='background: #e5e5e5; height: 100px; width:100px; overflow: hidden; text-align: center; float: left; margin-right: 5px;'>" +
    "<img id='fazedr_thumb' src='' style='' />" +
    "</div>" +
    "<button tabindex='-1' id=fazedr-paste style='cursor:pointer; width: 110px;height: 3em;margin-bottom: 3px;'>Paste [IMG]</button> " +
    "<br><button tabindex='-1' id=fazedr-paste-nsfw style='cursor:pointer; width: 110px;height: 3em;margin-bottom: 3px;'>Paste [NSFW]</button></div> " +
    "<div id='fazedr-cp-holder' style='display:none'></div>");

    $("#fazedr-paste").click(function(event){
        event.preventDefault();
        thumb = $("#fazedr_thumb");
        var ta = $("form[name=post] textarea");
        ta.val(ta.val() + "[img]" + thumb.attr("src")+ "[/img]\n");
        $(".button[value=Preview]").click();
    });

    $("#fazedr-paste-nsfw").click(function(event){
        event.preventDefault();
        thumb = $("#fazedr_thumb");
        var ta = $("form[name=post] textarea");
        ta.val(ta.val() + "[nsfw]" + thumb.attr("src") + "[/nsfw]\n");
        $(".button[value=Preview]").click();
    });

    $("#fazedr-close").click(function(){
        chrome.extension.sendRequest({
            key: "clearClipboard"
        }, function(response){
            hideClipBox();
        })
    })
}

function clipBoxTimer(){                                           1
    chrome.extension.sendRequest({
        key: "paste"
    }, function(response){
        try {
            var fUrl = getFazedrThumbUrl();
            var cUrl = response.value;
            if (isImageLink(cUrl)){

                // check if clipbox is already created
                if ($("#fazedr-form").length != 1) createClipBox();

                // check for update
                if (cUrl != fUrl){
                    updateClipBox(cUrl);
                }
            } else if ($("#fazedr-form").length > 0){
                hideClipBox();
            }
        } catch (e){}
        setTimeout("clipBoxTimer()", 2000);

    });
}

function getFazedrThumbUrl(){
    surl = $("#fazedr_thumb").attr("src");
    if (isImageLink(surl)) return surl;
    return "";
}


function updateClipBox(cUrl){

    var styling = makeImageStyleString(cUrl);
    var thumb = $("#fazedr_thumb");

    if ( $("#fazedr-imgpost:visible").length > 0 ){
        thumb.fadeOut(500, function(){
            thumb.attr("src", cUrl);
            thumb.attr("style", styling);
            thumb.fadeIn(500);
        })
    } else {
        thumb.attr("src", cUrl);
        thumb.attr("style", styling);
        showClipBox();
    }

}

function makeImageStyleString(imgUrl){
    fImage = new Image();
    fImage.src = imgUrl;
    var fImageStyle = "width: 100px; display: none;";
    if (fImage.height > fImage.width){
        fImageStyle = "height: 100px; display: none;";
    }
    return fImageStyle;
}

function hideClipBox(){
    $("#fazedr-imgpost").fadeOut(500, function(){
        $("#fazedr_thumb").attr("src", "");
    });
}

function showClipBox(){
    $("#fazedr_thumb").show();
    $("#fazedr-imgpost").fadeIn(500);

}

function reposition() {
    // reposition after inserts
    var disablereposition = "false";
    chrome.extension.sendRequest({
        key : "disablereposition"
    }, function(response) {
        disablereposition = response.value;
        if(disablereposition != "true") {
            var hash = window.location.hash;
            if (hash){
                var position = $(hash).offset();
                window.scrollTo(position.left, position.top);
            }
        }
    });
}

function reposition_delayed(){
    setTimeout("reposition()", 100);
}
