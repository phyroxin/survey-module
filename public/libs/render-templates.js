/*========================================================
 * Render templates
 * Loads external templates from path and injects in to page DOM
 *========================================================
 */
 var url = './templates/templates.tmpl.html';
 var templateLoader = (function($,host){
	 return{
		loadExtTemplate: function(path){
			var tmplLoader = $.get(path)
				.success(function(result){
					//Add templates to DOM
					$("body").append(result);
				})
				.error(function(result){
					alert("Error Loading Templates!");
				})
				
			tmplLoader.complete(function(){	
				console.log('Templates loaded...!');
			});
		}
	 };
 })(jQuery, document);
 
 templateLoader.loadExtTemplate(url);