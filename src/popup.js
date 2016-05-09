$(function(){

				// NSFW images
				var nsfwImages = chrome.extension.getBackgroundPage().getVariable("nsfwImages");
				if (nsfwImages == "true"){
					$("#nsfwImages input").attr("checked", true);
				}

				$("#nsfwImages input").change(function(){
					if ($("#nsfwImages input").is(":checked")){
						nsfwImages = "true";
					} else{
						nsfwImages = "false";
					};
					chrome.extension.getBackgroundPage().setVariable("nsfwImages", nsfwImages);
					chrome.extension.getBackgroundPage().refreshTab();
				});

				// Media links
				var embedMedia = chrome.extension.getBackgroundPage().getVariable("embedMedia");
				if (embedMedia == "true"){
					$("#embedMedia input").attr("checked", true);
				}
				$("#embedMedia input").change(function(){
					if ($("#embedMedia input").is(":checked")){
						embedMedia = "true";
					} else{
						embedMedia = "false";
					};
					chrome.extension.getBackgroundPage().setVariable("embedMedia", embedMedia);
					chrome.extension.getBackgroundPage().refreshTab();
				});

				// Resize tall images
				var resizeTall = chrome.extension.getBackgroundPage().getVariable("resizeTall");
				if (resizeTall == "true"){
					$("#resizeTall input").attr("checked", true);
				}
				$("#resizeTall input").change(function(){
					if ($("#resizeTall input").is(":checked")){
						resizeTall = "true";
					} else{
						resizeTall = "false";
					};
					chrome.extension.getBackgroundPage().setVariable("resizeTall", resizeTall);
					chrome.extension.getBackgroundPage().refreshTab();
				});
    
                // Reposition
				var disablereposition = chrome.extension.getBackgroundPage().getVariable("disablereposition");
				if (disablereposition == "true"){
					$("#reposition input").attr("checked", true);
				}
				$("#reposition input").change(function(){
					if ($("#reposition input").is(":checked")){
						disablereposition = "true";
					} else{
						disablereposition = "false";
					};
					chrome.extension.getBackgroundPage().setVariable("disablereposition", disablereposition);
					chrome.extension.getBackgroundPage().refreshTab();
				});

				// auto refresh
				var autorefresh = chrome.extension.getBackgroundPage().getVariable("autorefresh");
				debugger;
				$("#autorefresh select option[value="+autorefresh+"]").prop('selected', true);

				$("#autorefresh select").change(function(){
					chrome.extension.getBackgroundPage().setVariable("autorefresh", $("#autorefresh select").val());
					chrome.extension.getBackgroundPage().refreshTab();
				});

			});
