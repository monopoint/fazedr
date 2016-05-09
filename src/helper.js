

        function setVariable(key, value){
            try{
                window.localStorage.setItem(key, value);
            } catch (e){
            }
        };
        function getVariable(key){
            try{
                var value =  window.localStorage.getItem(key);
            } catch (e){
            }
            return value;
        };


        chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
            if (request.key == "refreshTab"){
                refreshTab();
            }

            if (request.key == "paste"){
                var result = '';
                var sandbox = $('#sandbox').val('').select();
                if (document.execCommand('paste')) {
                    result = $("#sandbox").val();
                    sendResponse({value: result});
                } else sendResponse({value: ""})
            }
            else if (request.key == "clearClipboard"){
                var sandbox = $('#sandbox').val(' ').select();
                document.execCommand('copy')
                sendResponse({value: ""})
            }
            else sendResponse({value: localStorage[request.key]})
        });

        function refreshTab(){
            chrome.tabs.getSelected(undefined, function (tab){
                chrome.tabs.update(tab.id, {url: tab.url, selected: true});
            });
        };

        function getClipboard(){
            return document.execCommand("paste");
        }

SC.initialize(
    {
        client_id: '8186a44436788fa4336b7cd1364ba5e7'
    }
);
