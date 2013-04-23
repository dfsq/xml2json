var App = Ember.Application.create({});


/** **************************************************
 * Routes.
 */
App.Router.map(function() {
	this.resource('xml', function() {
		this.route('paste');
	});
	this.resource('about');
});

App.IndexRoute = Ember.Route.extend({
	redirect: function() {
		this.transitionTo('xml.paste');
	}
});

App.XmlRoute = Ember.Route.extend({
	events: {
		xmlrender: function(data) {
			this.get('controller').setProperties({
				xml: data,
				content: XMLParser.parse(data)
			});
			this.render('rendered', {
				into: 'xml',
				outlet: 'rendered'
			});
		},
		showjson: function(json) {
			this.get('controller').set('json', json);
			this.render('json', {
				into: 'xml',
				outlet: 'json'
			});
		},
		clearAll: function() {
			this.clearOutlet('xml', 'rendered');
			this.clearOutlet('xml', 'json');
		}
	}
});

Ember.Route.reopen({
	clearOutlet: function(container, outlet) {
		var parentView = this.router._lookupActiveView(container);
		parentView.disconnectOutlet(outlet);
	}
});


/** **************************************************
 * Controllers.
 */
App.XmlController = Ember.Controller.extend({
	
	attributes: true,
	inline: false,
	clearDisabled: true,
	
	process: function(data) {
		data && this.send('xmlrender', data);
	},
	
	generate: function(tag) {
		if (tag instanceof App.XmlController) {
			tag = this.get('tag');
		}
		else this.set('tag', tag);
		
		var code = XMLParser.toJSON(this.get('xml'), tag, this.get('attributes'), this.get('inline'));
		this.send('showjson', code);
		
		this.set('clearDisabled', false);
		
	}.observes('attributes', 'inline'),
	
	clear: function() {
		this.send('clearAll');
		this.set('clearDisabled', true);
	}
});


/** **************************************************
 * Views.
 */
App.XmlView = Ember.View.extend({
	tagName: 'form',
	submit: function(e) {
		var $target = $(e.target).find('.field'),
			data = $target.val();
		if (data) {
			this.get('controller').send('process', data);
		}
		else {
			$target.focus();
		}
		e.preventDefault();
	},
	click: function(e) {
		if ($(e.target).hasClass('btn-clear')) {
			this.get('controller').send('clear');
		}
	},
	focusOut: function(e) {
		var target = e.target;
		if (target.nodeName === 'TEXTAREA' && !target.value) {
			this.get('controller').send('clear');
			$(e.target).focus();
		}
	}
});

App.RenderedView = Ember.View.extend({
	didInsertElement: function() {
		var $tags = this.$('.tag'),
			self  = this;

		this.$().on('click', '.tag', function() {
			$tags.removeClass('selected')
				.filter('.' + $(this).data('tag')).toggleClass('selected');
			self.get('controller').send('generate', this.dataset['tag'].split('-'));
		});
		
		$tags.first().trigger('click');
	}
});