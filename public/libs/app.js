var app = function(){
	/*========================================================
	 * Define models and collections to retrieve and store
	 * questions
	 *========================================================
	 */ 
	 Question	= Backbone.Model.extend();
	 
	 Questions	= Backbone.Collection.extend({
		 model: Question
		 // json data set end point to retrieve questions object
		 // set to '#' here as we have defined the questions json below
		,url: '#'
	 });

	 questions	= new Questions(questionsLoader.getJson());

	/*========================================================
	 * Backbone Home View
	 *========================================================
	 */
	 HomeView = Backbone.View.extend({
		 // define the html element the HomeView will be associated to 
		 el:'#container' 
		 
		// set globals for entire application
		,globals:{
			 page:1
			,progLength:0
			
			// use the number of questions to define progress increment value
			,progressInt:function(){
				var qObj = questions.toJSON();
				var prgInt = 100/qObj[0].length;
				return prgInt;
			}
			
			// assign questions json globally for manipulation
			,qObj:questions.toJSON()
			
			// create final send data array for data submission 
			,globalData:[]
		}
		
		// when HomeView called initialise progress value and call render function
		,initialize: function(){
			this.globals.progLength = this.globals.progressInt();
			this.render();
		}
		
		// listen for events and trigger assigned functions
		,events: {
			 'click #next-page':	'nextPage'
			,'click #prev-page':	'prevPage'
			,'click #end-page':		'endPage'
		}
		
		// go to the next page
		,nextPage: function(){
		
			var validated = this.isComplete(this.globals.page);
			
			if(validated){
				// increment global values for each function call
				this.globals.page		+= 1;
				this.globals.progLength += this.globals.progressInt();
				
				// get question length value from json object
				var qLen	= this.globals.qObj[0].length;
				
				// create div label for page identification (used to flip between pages)
				var divObj 	= $('#page'+this.globals.page);
				
				// make div visible according to page number
				for(i=1;i<=qLen;i++){
					if(i === this.globals.page)
						$('#page'+this.globals.page).css({'display':'block'});
					else
						$('#page'+i).css({'display':'none'});
				}
				
				// update control view
				this.$el.append(this.controlView.render(this.globals.page).el);
				
				// animate progress bar
				$('#prgId').animate({'width':this.globals.progLength+'%'});
			}
			
			return false;
		}
		
		// go to previous page
		,prevPage: function(){
			
			this.globals.page -= 1;
			this.globals.progLength -= this.globals.progressInt();
			
			var qLen	= this.globals.qObj[0].length;
			var divObj 	= $('#page'+this.globals.page);
			
			for(i=1;i<=qLen;i++){
				if(i === this.globals.page)
					$('#page'+this.globals.page).css({'display':'block'});
				else
					$('#page'+i).css({'display':'none'});
			}

			this.$el.append(this.controlView.render(this.globals.page).el);
			
			$('#prgId').animate({'width':this.globals.progLength+'%'});
		}
		
		// submit data function calls separate function TODO: may not need 
		,endPage: function(){
			
			var validated = this.isComplete(this.globals.page);
			
			if(validated)
				this.submitData();

			return false;
		}
		
		,isComplete: function(pageN){
			
			var obj	= this.globals.qObj[0];
			var err	= 0;
			
			$.each(obj, function(key, val){
				if(key!=='page'+pageN)
					return;
				$.each(val, function(k, v){
					if(v.type !== 'slider'){
						var field = $('#q'+v.order);
						var val = field.val();
						// append data to array
						if(val === ""){	
							field.css({'background-color':'#ffd97f'});
							err = 1;
						}else{
							field.css({'background-color':'transparent'});
						}
					}
				});
			});
			
			if(err===0)
				return true;
			else if(err===1)
				return false;
		}
		
		// actual submit data function 
		,submitData: function(){
			
			// assign question json
			// reset error state
			// create temporary data array
			var obj 			= this.globals.qObj[0];
			var err 			= 0;
			var tempData		= [];
			
			// drill down into json object and iterate through question arrays to determine answer states
			// push values to temporary array for usage
			// mark error when found
			$.each(obj, function(key, val){
			
				if(	   key==='length' 
					|| key==='url' 
					|| key==='redirect'
					|| key==='_id')
					return;
					
				$.each(val, function(k, v){
					if(v.type === 'slider'){
						var sliderValues = $('#q'+v.order).slider("option", "values");
						var sliVal	= sliderValues[0];
						// append data to array
						tempData.push({ref:sliVal});
					}
					else{
						var val = $('#q'+v.order).val();
						var ord = 'q'+v.order;
						// append data to array
						tempData.push({ref:val});
					}
				});
			});
	
			// push tempData to globalData array for submission 
			this.globals.globalData.push(tempData);
			
			// iterate through globalData array and pass each object to 
			// jquery ajax post function for submission to database
			// URL endpoint: 'home/postData'
			
			var jsonObj = {};
			var jn = 1;
			$.each(this.globals.globalData, function(key, val){
				$.each(val, function(key, val){
					jsonObj['q'+jn] = val.ref;
					jn=jn+1;
				});	
			});
			
			$.post('/api/addData', jsonObj, function(o){
				if(o.state==='err')
					console.log(o);
				else
					console.log(o);
					
			}, 'json');
			
			console.log(jsonObj);
			
			// render end page
			this.finalView = new FinalView();
			this.$el.append(this.finalView.render().el);
		}
		
		,render: function(){
			
			//	render progress bar 		
			this.$el.append($('<div />', {
								 'class':'progressWrap'
								})
								.html($('<div />', {
									 'id'	:'prgId'		
									,'class':'progressFill'
								}))
							);
			
			// create backbone view objects 
			this.listView = new ListView();
			this.controlView = new ControlView();
			
			// append views to $el ('#container') and pass through page number values
			this.$el.append(this.listView.render('page'+this.globals.page).el);
			this.$el.append(this.controlView.render(this.globals.page).el);
			
			// animate progress bar
			$('#prgId').animate({'width':this.globals.progLength+'%'});

			// return this to concatenate functions
			return this;
		}
	 });
	
	
	/*======================================================================
	 * Backbone List View
	 *======================================================================
	 */
	 ListView = Backbone.View.extend({
	 
		// define element ListView will be associated to
		 el: '#question-wrap'
		 
		// assign templates to local variables
		,initialize: function(){
			this.templateTitle 	= _.template($('#titleTemp').html());
			this.templateInput 	= _.template($('#textInputTemp').html());
			this.templateSelect = _.template($('#selectInputTemp').html());
			this.templateSlider = _.template($('#sliderInputTemp').html());
		}
		
		// render function will display new view when called
		,render: function(page){
			// assign template and elements for ease of use
			var  el 		= this.$el
				,title		= this.templateTitle
				,input		= this.templateInput
				,select		= this.templateSelect
				,slider		= this.templateSlider;
			
			// empty '#question-wrap' 
			el.empty();
			
			// iterate through questions to determine what type of input to display
			questions.each(function(data){
				
				// make json object to allow dot notation 
				var obj = data.toJSON();
				
				$.each(obj, function(key, val){
					
					// if key is 'length' or 'url' then ignore
					if(	   key==='length' 
						|| key==='url' 
						|| key==='redirect'
						|| key==='_id')
						return;
					
					// create div wrap for each page
					var pageDiv = $('<div />', {
						 'id':key
						,'class':'page-wrap'
						,'style':'display:none'
					});
					
					// append div to view element 
					el.append(pageDiv);
					
					// if key is equal to current page then css 'display: block'
					if(key === page){
						pageDiv.css({'display':'block'});
						$.each(val, function(k, v){
						
							// create page question text
							pageDiv.append(title({
								 order:		v.order
								,question:	v.question
							}));
							
							// create text input field
							if(v.type === 'text'){
								pageDiv.append(input({
									order:	v.order
								}));
							}
							
							//create dropdown menu 
							else if(v.type === 'dropdown'){
								pageDiv.append(select({
									 order:		v.order
									,options:	v.options
								}));
							}
							
							// create slider
							else{
								pageDiv.append(slider({
									 order:		v.order
								}));
							}
						});	
					}else{
						// set other pages to 'display: none'
						$.each(val, function(k, v){
							pageDiv.append(title({
								 order:		v.order
								,question:	v.question
							}));
							if(v.type === 'text'){
								pageDiv.append(input({
									order:	v.order
								}));
							}
							else if(v.type === 'dropdown'){
								pageDiv.append(select({
									 order:		v.order
									,options:	v.options
								}));
							}
							else{
								pageDiv.append(slider({
									 order:		v.order
								}));
							}
						});
					}	
				})
			});
			
			// initialize slider object and values 
			// TODO: assign json range value to 'step' 
			$( ".slider" ).slider();
			$( ".slider" ).slider({step:10});
			$( ".slider" ).slider("option", "values", [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ] );
			
			return this;
		}
	 });
	 
	 
	/*======================================================================
	 * Backbone Control View
	 *======================================================================
	 */
	 ControlView = Backbone.View.extend({
		 el: '#control-wrap'
		 
		,initialize: function(){}
		
		// render appropriate control buttons based on page value
		,render: function(page){
			var  el = this.$el;
			var qObj = questions.toJSON();
			
			el.empty();
			
			// if first page  
			if(page === 1){
				el.append($('<button/>', {
						 id:	'prev-page'
						,class:	'prevStyleNohover'
						,style:	'color:#999;'
						,disabled:	'disabled;'
					})
					.html('<< Back')
				);
				if(qObj[0].length !== 1){
					el.append($('<button/>', {
							 id:	'next-page'
							,class:	'nextStyle'
							,style:	'color:#444;'
						})
						.html('Next >>')
					);
				}
				else{
					el.append($('<button/>', {
							 id:	'end-page'
							,class:	'endStyle'
							,style:	'color:#444;'
						})
						.html('Submit')
					);
				}
			}
			
			// if not first and not last page 
			else if(page > qObj[0].length-1){
				el.append($('<button/>', {
						 id:	'prev-page'
						,class:	'prevStyle'
						,style:	'color:#444;'
					})
					.html('<< Back')
				);
				
				el.append($('<button/>', {
						 id:	'end-page'
						,class:	'endStyle'
						,style:	'color:#444;'
					})
					.html('Submit')
				);
			}
			// if last page
			else{
				el.append($('<button/>', {
						 id:	'prev-page'
						,class:	'prevStyle'
						,style:	'color:#444;'
					})
					.html('<< Back')
				);
				
				el.append($('<button/>', {
						 id:	'next-page'
						,class:	'nextStyle'
						,style:	'color:#444;'
					})
					.html('Next >>')
				);
			}
			return this;
		}
	 });
	
	 
	/*========================================================
	 * Backbone Final Template
	 *========================================================
	 */
	 FinalView = Backbone.View.extend({
		 el:'#question-wrap'
		 
		,initialize: function(){
			this.templateTitle 	= _.template($('#titleTemp').html());
			this.templateEnd 	= _.template($('#endPageTemp').html());
			this.urlObj 		= questions.toJSON();
		}
		
		,event: function(){}
		
		,render: function(){
			var	 el			= this.$el
				,control	= $('#control-wrap')
				,title		= this.templateTitle
				,end		= this.templateEnd
				,redirect	= this.urlObj[0].redirect
				,url		= this.urlObj[0].url;
			
			// set redirect message 
			var status = function(){
				return (redirect)?'and redirecting...':'';
			}
			
			// remove questions and control buttons
			control.empty();
			el.empty();
			
			// create and append div and populate with sending status message
			el.append($('<div />', {
					 'id':	 'sendingData'
					,'class':'sendingClass'
					,'style':'color: #000; padding:10px;'
				})
				.html('Sending data...'+status())
			);
			
			// if redirect set to true...
			// else display completion page with link embedded
			if(redirect===true)
				window.location = url;
			else{
				el.empty();
				el.append(end({
					 text: 'Thank You :)'
					,url: url
				}));
			}
			
			return this;
		}
	 });
};