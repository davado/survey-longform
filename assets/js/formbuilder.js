
/*
    TODO: 
    * make an index of tabindex elements, 
    * store currentTab, nextTab, -> onkeypress, go to nextTab, currentTab = nextTab, set nextTab.
    
    * if all quetsions are answered, change the class of the section to "question-completed".
    
    * add the resetQuestion button to the H6 element, float right.

    * create PHP for processing the $_POST data
    
    * create MySQL database tables for storing the data
    * create PHP for acquiring the IP Address and other.

    * profile the JS to see *where* this boat leaks.
*/


// app configuration settings
var appConfig = {
    saveFile: "/survey/savejson.php",
    questionsManifest: "/survey/survey-data.json"
};

var model = {
    formData: {},
    formElements: {},
    inputIndex: [],
    index: 1
};

model.saveData = function(obj) {
  somethingChange = false;
  $.ajax({
      type: "POST",
      url: appConfig.saveFile,
      data: {regData: JSON.stringify(obj)},
      success: function(data){
          console.log('Register saved to server file.');
        //  console.log(JSON.stringify(obj));
      },
      error: function(e){
          console.log(e.message);
      }
  });

};

model.retrieveData = function(url, func) {
    
    $.ajax({
        dataType: "json",
        type: "GET",
        url: url,
        success: function(data, obj) {
            func(data);
        },
        error: function(e) {
            console.log(e.message);
        }
    });
};

//return true if jsonObj is valid
model.setRegister = function( jsonObj ) {
        this.formData = jsonObj;
        if (typeof this.formData === 'object') {
            //continue setting register and return true
            console.log("setReg - formData is set");
            return true;
        }
        else {
            console.log("setRegister failed");
            return false;
        }
};

model.setManifest = function( obj ) {

    function test(obj) {
        self = this;
        model.formElements = obj;
        console.log( "set:", model.formElements );
    }
    
    test( obj );

};

model.getManifest = function() {
    return model.formElements;
};

model.savePoint = function(id, val) {
    
    function getName(id) {
        var str; 
        var key = "";
        
        str = id.split("-");
        for (var p = 0; p < str.length-1; p++) {
            key += str[p];
            if (p < str.length-2) {
                key += "-";
            }
        }
            console.log(key, str);
        return key;
    }
    
    if(! model.hasLocalStorage ) {
        return false;
    } 
    id = getName(id);
    localStorage[id] = val;
    console.log(id, localStorage[id]);
};

model.restorePointFromLocal = function( id ){

    var score, textID, textInput;
    var idArr = id.split("-");
    
    if (idArr[idArr.length-1] === "text") {
        
        textID = id+"-response";
        inputText = document.getElementById( textID );
        inputText.value = localStorage[ id ];

    } else {

        score = localStorage[id];

        if ( score ) {
            score = parseInt(score);
            id = id+"-"+score;
            $('#'+id).value(score);
        }
    }
    
};

model.tabIndex = function( element_id ){
    if ( element_id !== undefined && typeof element_id === "string" ) {
        model.inputIndex.push( element_id );
        return model.index++;
    } else {
        return model.index;
    }
};

 model.hasLocalStorage = function () {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
};

/*
    FORMS
*/
build = {
    //add static properties 
};

build.form = function(obj){
    var container = document.createElement("div");
    container.setAttribute("class", "container");
    var submit, meta;
    var form = document.createElement("form");
    var attr = {id:obj.id, name:obj.id, action:"#", method:"post"};
    if ( obj.id !== null || obj.id !== undefined ){
        for (var key in attr ) {
            form.setAttribute(key, attr[key] );
        }
    }

    // get questions
    if (obj.hasOwnProperty("sections")){ 
        for (var section in obj.sections) {
            number = section.split("-");
            section = build.section( obj.sections[section], number[1]  );
            form.appendChild(section);
        }
    } else {
        console.log("obj passed into build.form does not have obj.sections");
    }
    
    // add form to the DOM (separate function).
    // wrap in div.container
    submit = build.submit();
    meta = build.meta(obj);

    form.appendChild(submit);
    container.appendChild(form);
    container.appendChild(meta);
    return container;
};

build.section = function(obj, number){
    var section, section_id, question, supertitle, text, point, points, resetButton;
    points = [];
    section_id = "section-"+number;
    section = document.createElement('div');
    section.setAttribute('class', 'radiobuttons form-group');
    section.setAttribute('id',  section_id );
    supertitle = document.createElement('h6'); 
    
    // create reset button
    resetButton = document.createElement('button');
    resetButton.setAttribute( 'class', "btn button-reset reset-question" );
    resetButton.setAttribute( 'type', 'button' );
    resetButton.appendChild( document.createTextNode("Reset Answers") );
    section.appendChild( resetButton );
    
    // get supertitle
    
    if( obj.supertitle !== undefined ) {

        text = document.createTextNode( obj.supertitle );
        supertitle.appendChild( text );
        section.appendChild(supertitle);
    }
    
    question = document.createElement('h5');
    // get question
    
    if( obj.question !== undefined ) {
        text = document.createTextNode( number+". "+obj.question);
        question.appendChild(text);
        section.appendChild(question);
    }
    // make points, build.points returns an array of points.
    if( obj.points !== undefined ) {
        points = build.points( obj.points, number );
        for ( var p = 0; p < points.length; p++){
            section.appendChild( points[p] );
        }
    }
    // wrap in div.formgroup.radiobuttons
    return section;
};

build.points = function( arr, number ){
    
    var wrapper, 
        point, points,
        labels, label, 
        inputs, input, 
        question, questionTextNode, 
        other, otherTextNode, 
        otherDescription, 
        checked, index; 
    
    labels = inputs = [];
    points = [];
    var appendPoint = function( nodes ){

        if ( Array.isArray(nodes) ) {
            wrapper  = document.createElement("div");
            isLabels = ( nodes[0] && nodes[0].tagName === "LABEL" );
            isInputs = ( nodes[0] && nodes[0].tagName === "INPUT" );

            
            if( isLabels ) {
                containerID = "label-container-";
                //this is wrong, figure out the correct step to iterate the x/index.
                x = model.tabIndex();
                containerID += x;
                index = model.tabIndex( containerID );

                wrapper.setAttribute( "id", containerID );
                wrapper.setAttribute( "class", "point-wrapper" );
                wrapper.setAttribute( "tabindex", index );
                // index++;
            }
            if ( isInputs ) {
                wrapper.setAttribute("class","radio-buttons section-"+number+"-inputs");
            }
            for( var x = 0; x < nodes.length; x++ ){
                wrapper.appendChild( nodes[x] );
            }

            point.appendChild( wrapper );

        } else if( typeof nodes === "object" ){
            point.appendChild( nodes );
        }
    };
    
    
    //each array
    for ( var i = 0; i < arr.length ; i++ ) {

        point = document.createElement('div');
        point.setAttribute('class','sect-point unselected');
        textType = "text";
        //each obj in array
        for ( var key in arr[i] ) {

            // otherDescription = (key === "other-description") ? arr[i][key] : "Other";
            
            
            if (key === "type") {
                if (arr[i][key] === "scale" ) {
                    pointClass = point.getAttribute("class") + " scale";
                    point.setAttribute("class", pointClass );
                    inputs = [];
                    labels = [];
                    for ( var j = 1; j < 11; j++ ) {
                        
                        inputName = "p-"+number+"-"+(i+1);
                        id = inputName+"-"+j;

                        // check if set in localStorage
                        if (model.hasLocalStorage && parseInt(localStorage[id]) !== null){
                            k = parseInt( localStorage[id] ) || 0;
                        }
                        selected = ( j === k );
                        
                        input = build.input( "radio", inputName, id, j, "hidden", selected );
                        inputs.push( input );
                        
                        label = build.label( id, j, selected );
                        labels.push(label);
                    }
                } else if ( arr[i][key] === "textarea" ) {
                    textType = "textarea";
                }
                
            } else if (key === "point") {
                question = document.createElement("p");
                question.setAttribute("class","question");
                questionTextNode = document.createTextNode( arr[i][key] );
                question.appendChild(questionTextNode);

            } else if (key === "other") {
                otherDescription = (arr[i].point) ? arr[i].point : "text";
                _name = "p"+"-"+number+"-"+(i+1)+"-text";
                _id = _name+"-response";
                question = document.createElement("div");
                question.setAttribute("class","input-group input-group-sm other-margin");
                
                span = document.createElement("span");
                span.setAttribute("class", "question input-group-addon");
                span.setAttribute("aria-describedby", _id );
                spanText = document.createTextNode( otherDescription );
                span.appendChild( spanText );
                
                input = document.createElement( "input" );
                input.setAttribute( "class", "form-control other-text" );
                input.setAttribute( "type", textType );
                input.setAttribute( "name", _name );
                input.setAttribute( "id", _id );
                input.setAttribute( "placeholder", arr[i][key] );
                input.setAttribute( "tabindex", model.tabIndex( _id ) );
                // index++;
                
                question.appendChild(span);
                question.appendChild(input);
            }

        }
        appendPoint( question );
        
        if( inputs[0] ) {
            appendPoint( inputs );
            appendPoint( labels );
        }
        
        points.push( point );
    }
    
    return points;
};

build.input = function(type, name, id, value, className, checked) {
    var attr = {type: type, name: inputName, id: id, value: value, class: className  };
    var input = document.createElement("input");
    for (var key in attr) {
        input.setAttribute(key, attr[key]);
    }
    if (checked) {
        input.setAttribute("checked", "checked");
        input.checked = true;
    }
    
    return input; 
};

build.label = function(id, value, selected){
    var label = document.createElement("label");
    var labelTextNode;
    label.setAttribute("for", id);
    label.setAttribute("id", id+"-label");
    if( selected ) {
        label.setAttribute("class", "selected");
    }
    if( value === 10 ){
        label.setAttribute("class", "ten");
    }
    labelTextNode = document.createTextNode(value);
    label.appendChild(labelTextNode);
    return label;
};

build.meta = function(obj){
    var meta = document.createElement("aside");
    meta.setAttribute("class", "container");
    var allowed = {"title": true, "version": true, "date": true, "author": true};
    var line, text;
    for (var key in obj) {
        if( key in allowed) {
            line = document.createElement("p");
            line.setAttribute( "class", "meta-"+key );
            span = document.createElement("span");
            span.setAttribute( "class", "meta-name" );
            spanText = document.createTextNode( key+":" );
            span.appendChild(spanText);
            line.appendChild(span);
            text = document.createTextNode( obj[key] );
            line.appendChild(text);
            meta.appendChild(line);
        }
    }
    return meta;
};

build.submit = function(){
    var index = model.tabIndex( "submit" );
    var submit = document.createElement( "button" );
    var attr = {type:"submit",id:"submit",value:"Submit the form", class: "btn btn-block btn-primary btn-lg btn-submit", tabindex: index };
    for( var key in attr ){
        if ( key !== "value" ) {
            submit.setAttribute(key, attr[key]);
        } else {
            text = document.createTextNode(attr[key]);
            submit.appendChild(text);
        }
    }
    return submit;
};

build.resetQuestion = function( section_id ) {
    
    var section = document.getElementById(section_id);
    var arrayOfPoints = section.getElementsByClassName("sect-point");
    var textResponse = section.getElementsByClassName("other-text");
    // get the array of section inputs
    var arrayOfWrappedInputs = document.getElementsByClassName( section_id+"-inputs" );
    
    // find the radio buttons and labels in the node object
    
    for ( var y = 0; y < arrayOfWrappedInputs.length ; y++ ) {

        // remove item from localStorage
        wrappedInput = arrayOfWrappedInputs[y];
        arrayOfInputs = wrappedInput.getElementsByTagName("INPUT");

        for ( var z = 0; z < arrayOfInputs.length ; z++ ) {
            input = arrayOfInputs[z];
            if ( input.checked ) {
                input.setAttribute("checked", false);
                localStorage.removeItem( input.getAttribute("name") );
                $("#"+input.getAttribute("id")+"-label").removeClass("selected");
            }
        }
    // remove selected from label
    // remove checked from input
    }
    
    // add class 'unselected' to .sect-point
    for ( y = 0; y < arrayOfPoints.length; y++ ) {
        var restoreClasses = arrayOfPoints[y].getAttribute("class") + " unselected";
        arrayOfPoints[y].setAttribute("class", restoreClasses);
    }

    if ( textResponse.length > 0 ) {
        for ( var q = 0; q < textResponse.length ; q++ ) {
            // remove item from localStorage
            localStorage.removeItem( textResponse[q].getAttribute("name") );
            // remove value from element
            textResponse[q].value = "";
            
        }
    }
};

build.focusNext = function( element_id ) {
    var element;
    var getNextIndex, getNextID;
    var el, index, id;

    // get the currentIndex from :indexof current element,
    getNextIndex = function( eID ) {
        var index = model.inputIndex.indexOf( eID );

        console.log("getnextindex  :",index);
        index++;
        console.log("getnextindex++:",index);

        return index;
    
    };
        
    getNextID = function( getNextIndex ) {
        var nextID = model.inputIndex[ getNextIndex ];
        console.log("nextID:", nextID);
        return nextID;
    };


    // get the  nextElement from model[cur++],
    var getNextElement = function( nextElementID ) {

        el = document.getElementById( nextElementID );
        return el;

    };
    /*
    
        element = getNextElement( function() {
                     getNextID( function() {
                        getNextIndex( element_id );
                    });
        });*/
    element = getNextElement( getNextID( getNextIndex( element_id ) ) );
    console.log("element",element);
    return element;
    
};

build.objectAvailable = function(obj) {

    if (typeof(obj) === 'object') {
        var r = false;
        for (var f in obj){
            r = true;
        }
        return r;

    } else if (obj === null || obj === undefined ) {
        return false;
    } else {
        return false;
    }
};
var timer = 0;

build.initialize = function(callback) {

        if (! build.objectAvailable( model.getManifest() ) ) {

            model.retrieveData( appConfig.questionsManifest, model.setManifest );
            if( timer < 6 ) {
                setTimeout( function() {
                    build.initialize( callback );
                }, 200+(500*timer) );
            }
            timer++;

        } else {

            if( callback && typeof callback === "function" ) {
                callback();
            }else{
                console.log("initialize: 'callback' is not a function");
            }
            
        }

};

var afterInit = function(callback) {

    document.body.appendChild( build.form( model.formElements ) );
    
    //check for localStorage
    if (window.addEventListener) {
      window.addEventListener("storage", handle_storage, false);
    } else {
      window.attachEvent("onstorage", handle_storage);
    }
    
    function handle_storage(e) {
      if (!e) { e = window.event; }
    }
    
    console.log("AfterInit: add form behaviours.");
    
    $("label").click( function(e){

        // model.savePoint($(this).for, $("input#"+this.id).value);
        $(this).parent().parent().removeClass('unselected');
        $(this).siblings().removeClass('selected');
        $(this).parent().children().removeClass("default-selected");
        $(this).addClass('selected');
    });
    
    $("input").change( function(e){
        model.savePoint(e.target.id, e.target.value );
        
    });
    
    $("button.reset-question").click( function(e) {
        var section = e.target.parentElement.id;
        //  console.log( e );
        
        if ( section ) {
            build.resetQuestion( section );
        }
    });
    
    $(window).keyup( function(e) {
        
        // console.log(e);
        if (e.target.className === "point-wrapper" || e.target.className === "other-text" ) {
        
            if (e.target.className === "point-wrapper") {
                // set radio button according to keypress
                var arrNum; 
                if ( e.which > 47 && e.which < 59 ) {
                    if ( e.which === 48 ) {
                        arrayNum = 9;
                    }
                    else {
                        arrayNum = e.which - 49;
                    } 
                   // console.log(e.target.childNodes[arrayNum]);
                                
                    //model.savePoint( e.target.childNodes[arrayNum].id, e.target.childNodes[arrayNum].value );

                    // this is not really how i want to do this...
                    $("#"+e.target.childNodes[arrayNum].id).click();
                } 

            } else if (e.target.className === "form-control other-text") {
                console.log(e.target.childNodes);
                // if Enter Key(13) or Tab(9)...
                if ( e.which === 13 ) {
                    console.log("Return Key 13");
                    model.savePoint(e.target.id, e.target.value );
                }
            }
            
            // next, advance to the next tab, if keypress is not tab
            if ( (e.which > 47 && e.which < 59) || e.which === 13 ) { 
                el = build.focusNext( e.target.id ); 
                el.focus();
            }
            
        }
    }).keydown( function(e) {

        if( e.which === 13 ) {
            e.preventDefault();
        }
    });
    
    
    if(callback && typeof callback === "function") {
        callback();
    }
    
};

build.resumeSurvey = function() {
    var key, val, id, node, label, arr;
    
    for ( key in localStorage ) {

        arr = key.split("-");
        val = localStorage[key];

        if(arr[0] === "p") {

            if (arr[arr.length-1] === "text") {
                id = key+"-"+"response";
            } else {
                id = key+"-"+val;
            }

            node = document.getElementById(id);

            if (node && node.tagName === "INPUT") {

                type = node.getAttribute("type");

                if ( type === "radio") {

                    node.setAttribute("checked", "checked");
                    node.checked = true;

                    label = $("#"+id+"-label");
                    label[0].setAttribute("class", "selected");
                    label.parent().parent().removeClass("unselected");

                } else if  ( type  === "text" || type === "textarea" ) {
                    
                    node.setAttribute("value", val);
                    
                }
            }
        }
    }
};

$( function(){
    build.initialize(afterInit);
    build.initialize(build.resumeSurvey);
    //afterInit();
});