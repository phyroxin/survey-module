/*======================================================================
 * Load json data from external file
 *======================================================================
 */
var url = '/api/getSurvey';
var questionsLoader = (function($, host) {
	var questionJson = "";
	return {
		loadData: function(path) {
			var jsonLoader = $.post(path, function(o) {
				questionJson = o;
				console.log('Data loaded...!');
				console.log(questionJson);
				$(host).trigger("DATA_LOADED");
			}, 'json')
			.error(function(result) {
				console.log('Error Loading Json');
			});
		}

		,
		getJson: function() {
			return questionJson;
		}
	};
})(jQuery, document);

questionsLoader.loadData(url);