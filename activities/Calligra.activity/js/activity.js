// Rebase require directory
requirejs.config({
	baseUrl: "lib",
	paths: {
		activity: "../js"
	}
});

// Default templates
var defaultTemplates = [
	{
		name: "template-lower",
		images: [
			{image:"icons/lower-a.svg"},
			{image:"icons/lower-b.svg"},
			{image:"icons/lower-c.svg"}
		]
	},
	{
		name: "template-upper",
		images: [
			{image:"icons/upper-a.svg"},
			{image:"icons/upper-b.svg"},
			{image:"icons/upper-c.svg"}
		]
	}
];

// Vue main app
var app = new Vue({
	el: '#app',
	components: {
		'toolbar': Toolbar, 'localization': Localization, 'tutorial': Tutorial,
		'template-viewer': TemplateViewer, 'editor': Editor
	},
	data: {
		currentView: TemplateViewer,
		currentLibrary: null,
		currentTemplate: null,
		currentItem: -1
	},

	created: function() {
		requirejs(["sugar-web/activity/activity", "sugar-web/env", "activity/palettes/templatepalette"], function(activity, env, templatepalette) {
			// Initialize Sugarizer
			activity.setup();
		});
	},

	mounted: function() {
		// Load last library from Journal
		var vm = this;
		requirejs(["sugar-web/activity/activity", "sugar-web/env"], function(activity, env) {
			env.getEnvironment(function(err, environment) {
					// Use buddy color for background
					env.getEnvironment(function(err, environment) {
						document.getElementById("canvas").style.backgroundColor = environment.user.colorvalue.fill;
					});

				// Load context
				if (environment.objectId) {
					activity.getDatastoreObject().loadAsText(function(error, metadata, data) {
						if (error==null && data!=null) {
							var parsed = JSON.parse(data);
							vm.currentLibrary = parsed.library;
							vm.currentTemplate = parsed.template;
							document.getElementById("template-button").style.backgroundImage = "url(icons/"+vm.currentTemplate.name+".svg)";
						} else {
							vm.currentLibrary = defaultTemplates;
							vm.currentTemplate = defaultTemplates[0];
						}
					});
				} else {
					vm.currentLibrary = defaultTemplates;
					vm.currentTemplate = defaultTemplates[0];
				}
			});
		});

		// Handle resize
		window.addEventListener("resize", function() {
			vm.onResize();
		});

		// Handle unfull screen buttons (b)
		document.getElementById("unfullscreen-button").addEventListener('click', function() {
			vm.unfullscreen();
		});
	},

	updated: function() {
	},

	methods: {

		localized: function() {
			this.$refs.toolbar.localized(this.$refs.localization);
			this.$refs.tutorial.localized(this.$refs.localization);
		},

		// Handle fullscreen mode
		fullscreen: function() {
			document.getElementById("main-toolbar").style.opacity = 0;
			document.getElementById("canvas").style.top = "0px";
			document.getElementById("unfullscreen-button").style.visibility = "visible";
		},
		unfullscreen: function() {
			document.getElementById("main-toolbar").style.opacity = 1;
			document.getElementById("canvas").style.top = "55px";
			document.getElementById("unfullscreen-button").style.visibility = "hidden";
		},


		// Handle events
		onTemplateSelected: function(template) {
			var vm = this;
			vm.currentTemplate=vm.currentLibrary[template.index];
		},

		onItemSelected: function(item) {
			if (this.currentView === TemplateViewer) {
				// Load book
				var vm = this;
				vm.currentItem = item;
			}
		},

		onResize: function() {
			var vm = this;
		},

		onHelp: function() {
			var options = {};
			options.templatebutton = this.$refs.toolbar.$refs.templatebutton.$el;
			options.fullscreenbutton = this.$refs.toolbar.$refs.fullscreen.$el;
			if (this.currentView === TemplateViewer && this.$refs.view.$refs.item0 && this.$refs.view.$refs.item0[0]) {
				options.book = this.$refs.view.$refs.item0[0].$el;
			} else if (this.currentView === Editor) {
			}
			this.$refs.tutorial.show(options);
		},

		onStop: function() {
			// Save current library in Journal on Stop
			var vm = this;
			requirejs(["sugar-web/activity/activity"], function(activity) {
				console.log("writing...");
				requirejs(["sugar-web/activity/activity"], function(activity) {
					console.log("writing...");
					var context = {
						library: vm.currentLibrary,
						template: vm.currentTemplate
					};
					var jsonData = JSON.stringify(context);
					activity.getDatastoreObject().setDataAsText(jsonData);
					activity.getDatastoreObject().save(function(error) {
						if (error === null) {
							console.log("write done.");
						} else {
							console.log("write failed.");
						}
					});
				});
			});
		}
	}
});
