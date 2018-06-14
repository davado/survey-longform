
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
    saveFile: "./savejson.php",
    questionsManifest: "./assets/data/survey-data.json"
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
      },
      error: function(e){
          console.log(e.message);
      }
  });

};

model.retrieveData = function(url, func, func2, func3) {

    $.ajax({
        dataType: "json",
        type: "GET",
        url: url,
        success: function(data, obj) {
            func(data);
            func2(func3);
        },
        error: function(jqXHR, exception) {
            if (jqXHR.status === 0) {
                console.log('Not connect.\n Verify Network.');
            } else if (jqXHR.status == 404) {
                console.log('Requested page not found. [404]');
            } else if (jqXHR.status == 500) {
                console.log('Internal Server Error [500].');
            } else if (exception === 'parsererror') {
                console.log('Requested JSON parse failed.');
            } else if (exception === 'timeout') {
                console.log('Time out error.');
            } else if (exception === 'abort') {
                console.log('Ajax request aborted.');
            } else {
                console.log('Uncaught Error.\n' + jqXHR.responseText);
            }
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

    function setForm(obj) {
        if( model.formElements !== obj ) {
            model.formElements = obj;
            console.log( "set:", model.formElements );
        }
    }
    
    setForm( obj );

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
    console.log("localStorage, set", id, "value:", localStorage[id]);
};

model.removePoint = function(id) {

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
    
    if( model.hasLocalStorage ) {
        id = getName(id);
        localStorage.removeItem = id;
        console.log( "localStorage.removeItem:", id );
    } else {
        return false;
    }
};

model.removeCheck = function(id) {

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
    
    if( model.hasLocalStorage ) {
        id = getName(id);
        localStorage.removeItem = id;
        console.log( "localStorage.removeItem:", id );
    } else {
        return false;
    }
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
    var submit, meta, preface;
    
    var form = document.createElement("form");
    var attr = {id:obj.id, name:obj.id, action:"#", method:"post"};
    if ( obj.id !== null || obj.id !== undefined ){
        for (var key in attr ) {
            form.setAttribute(key, attr[key] );
        }
    }
    
    // get title
    if( obj.hasOwnProperty("title") ) {
        if( document.getElementById('main-heading') ) {
            heading = document.getElementById('main-heading');
            if ( obj.title.length > 0 ){
                heading.innerHTML = obj.title;
            }
        }
    }
    
    // get preface
    
    if( obj.hasOwnProperty("preface") ) {
        preface = build.preface(obj.preface);

        if ( document.getElementById('preface') ) {
            preface_container = document.getElementById('preface');
            preface_container.appendChild(preface);
        } else {
            container.appendChild(preface);
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
                        
                        input = build.input( "radio", inputName, id, j, "hidden", selected, false );
                        inputs.push( input );
                        
                        label = build.label( id, j, selected );
                        labels.push(label);
                    }
                } else if ( arr[i][key] === "textarea" ) {
                    textType = "textarea";
                } else if ( arr[i][key] === "radio" || arr[i][key] === "multi" ) {
                    pointClass = point.getAttribute("class") + " "+arr[i][key];
                    point.setAttribute("class", pointClass );
                    inputs = [];
                    labels = [];
                    
                    if (arr[i].selection.length > 0){
                        for ( var m = 0; m < arr[i].selection.length; m++) {
                            //copy above...
                            inputName = "p"+number+"-"+(i+1);
                            id = inputName+"-"+m;
                            // check if set in localStorage
                            if (model.hasLocalStorage && parseInt(localStorage[inputName]) !== null){
                                k = parseInt( localStorage[inputName] ) || null;
                            }
                            selected = ( m === k );
                            classes = (arr[i][key] === "multi") ? "hidden multiple" : "hidden";
                            
                            input = build.input( "checkbox", inputName, id, m, classes, selected, true );
                            inputs.push( input );
                            
                            label = build.label(id, arr[i].selection[m], selected );
                            labels.push(label);
                        }
                    }

                } else {
                    
                }
                
            } else if (key === "point") {
                question = document.createElement("p");
                question.setAttribute("class","question");
                rawQuestion = arr[i][key];
                //questionTextNode = document.createTextNode( rawQuestion );
                // question.appendChild(questionTextNode);
                question.innerHTML = rawQuestion;

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

build.input = function(type, name, id, value, className, checked, multiple) {
    var attr = {type: type, name: inputName, id: id, value: value, class: className, multiple: multiple};
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

build.preface = function(obj) {
    var preface = document.createElement("div");
    preface.setAttribute("class", "preface");
    for (var i = 0; i < obj.length ; i++ ) {
        p = document.createElement("p");
        p.innerHTML = obj[i];
        preface.appendChild(p);
    }
    return preface;
};

build.meta = function(obj){
    var meta = document.createElement("div");
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
                
                if(input.getAttribute("type") === "checkbox") {
                    model.removeCheck( input.getAttribute("id") );
                
                } else {
                    model.removePoint( input.getAttribute("name") );
                
                }
                
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
            model.removeItem( textResponse[q].getAttribute("name") );
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

var update = {};

update.select = function(event) {
    var self = this;
    var target = event.target;
    // model.savePoint($(this).for, $("input#"+this.id).value);
    $(target).parent().parent().removeClass('unselected');
    $(target).siblings().removeClass('selected');
    $(target).parent().children().removeClass("default-selected");
    $(target).addClass('selected');
};

build.initialize = function(callback) {

        if (! build.objectAvailable( model.getManifest() ) ) {
            // console.log( "build ObjectAvailable says model is not available, try to load manifest");
            model.retrieveData( appConfig.questionsManifest, model.setManifest, afterInit, build.resumeSurvey );
            
/*

            if( timer < 6 ) {
                setTimeout( function() {
                    build.initialize( callback );
                }, 500+(500*timer) );
            }
            timer++;

*/

        } else {

/*
            if( callback && typeof callback === "function" ) {
                callback();
            } else {
                console.log("initialize: 'callback' is not a function");
            }
*/
            
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
        update.select(e);
    });
    
    $("input").change( function(e){
        if( $(this).attr("type") === "checkbox" && $(this).attr("multiple") === "true") {
            if( $this.checked ) {
                
                model.savePoint(e.target.id+"-multiple", e.target.value);
            }
        } else {
            model.savePoint(e.target.id, e.target.value );
        }
        
    });
    
    $("button.reset-question").click( function(e) {
        var section = e.target.parentElement.id;

        if ( section ) {
            build.resetQuestion( section );
        }
    });
    
    $(window).keyup( function(e) {
        
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
    console.log("Called: build.resumeSurvey");
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
    build.initialize();
    // build.initialize( afterInit );
    // build.initialize( build.resumeSurvey );
});
